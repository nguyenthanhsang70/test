const c = document.getElementById('c');

const ctx = c.getContext('2d');

let w = c.width = window.innerWidth;

let h = c.height = window.innerHeight;

let hw = w / 2;

let hh = h / 2;

const opts = {

  strings: ['HAPPY', 'BIRTHDAY', 'TO YOU!'],   // Thay tên ở đây nếu muốn

  charSize: 30,

  charSpacing: 35,

  lineHeight: 50,

  fireworkPrevPoints: 10,

  fireworkBaseLineWidth: 5,

  fireworkAddedLineWidth: 8,

  fireworkSpawnTime: 200,

  fireworkBaseReachTime: 30,

  fireworkAddedReachTime: 30,

  fireworkCircleBaseSize: 20,

  fireworkCircleAddedSize: 10,

  fireworkCircleBaseTime: 30,

  fireworkCircleAddedTime: 30,

  fireworkCircleFadeBaseTime: 10,

  fireworkCircleFadeAddedTime: 5,

  fireworkBaseShards: 5,

  fireworkAddedShards: 5,

  fireworkShardPrevPoints: 3,

  fireworkShardBaseVel: 4,

  fireworkShardAddedVel: 2,

  fireworkShardBaseSize: 3,

  fireworkShardAddedSize: 3,

  gravity: 0.1,

  upFlow: -0.1,

  letterContemplatingWaitTime: 360,

  balloonSpawnTime: 40,

  balloonBaseInflateTime: 10,

  balloonAddedInflateTime: 10,

  balloonBaseSize: 20,

  balloonAddedSize: 20,

  balloonBaseVel: 0.4,

  balloonAddedVel: 0.4,

  balloonBaseRadian: -(Math.PI / 2 - 0.5),

  balloonAddedRadian: 1,

};

const calc = {

  totalWidth: opts.charSpacing * Math.max(...opts.strings.map(s => s.length))

};

const Tau = Math.PI * 2;

const letters = [];

ctx.font = opts.charSize + 'px Verdana';

class Letter {

  constructor(char, x, y) {

    this.char = char;

    this.x = x;

    this.y = y;

    this.dx = -ctx.measureText(char).width / 2;

    this.dy = opts.charSize / 2;

    this.fireworkDy = this.y - hh;

    const hue = ((x / calc.totalWidth) + 0.5) % 1 * 360;

    this.color = `hsl(${hue},80%,50%)`;

    this.lightColor = `hsl(${hue},80%,light%)`;

    this.lightAlphaColor = `hsla(${hue},80%,light%,alp)`;

    this.alphaColor = `hsla(${hue},80%,50%,alp)`;

    this.reset();

  }

  reset() {

    this.phase = 'firework';

    this.tick = 0;

    this.spawned = false;

    this.spawningTime = opts.fireworkSpawnTime * Math.random() | 0;

    this.reachTime = opts.fireworkBaseReachTime + opts.fireworkAddedReachTime * Math.random() | 0;

    this.lineWidth = opts.fireworkBaseLineWidth + opts.fireworkAddedLineWidth * Math.random();

    this.prevPoints = [[0, hh, 0]];

  }

  step() {

    if (this.phase === 'firework') {

      if (!this.spawned) {

        if (++this.tick >= this.spawningTime) {

          this.tick = 0;

          this.spawned = true;

        }

        return;

      }

      ++this.tick;

      const lp = this.tick / this.reachTime;

      const ap = Math.sin(lp * Math.PI / 2);

      const x = lp * this.x;

      const y = hh + ap * this.fireworkDy;

      if (this.prevPoints.length > opts.fireworkPrevPoints) this.prevPoints.shift();

      this.prevPoints.push([x, y, lp * this.lineWidth]);

      for (let i = 1; i < this.prevPoints.length; i++) {

        const p = this.prevPoints[i];

        const p2 = this.prevPoints[i - 1];

        ctx.strokeStyle = this.alphaColor.replace('alp', i / this.prevPoints.length);

        ctx.lineWidth = p[2] * i / (this.prevPoints.length - 1);

        ctx.beginPath();

        ctx.moveTo(p[0], p[1]);

        ctx.lineTo(p2[0], p2[1]);

        ctx.stroke();

      }

      if (this.tick >= this.reachTime) {

        this.phase = 'contemplate';

        this.circleFinalSize = opts.fireworkCircleBaseSize + opts.fireworkCircleAddedSize * Math.random();

        this.circleCompleteTime = opts.fireworkCircleBaseTime + opts.fireworkCircleAddedTime * Math.random() | 0;

        this.circleCreating = true;

        this.circleFadeTime = opts.fireworkCircleFadeBaseTime + opts.fireworkCircleFadeAddedTime * Math.random() | 0;

        this.tick = this.tick2 = 0;

        // Tạo mảnh vỡ pháo hoa

        const cnt = opts.fireworkBaseShards + opts.fireworkAddedShards * Math.random() | 0;

        const angle = Tau / cnt;

        let px = 1, py = 0;

        for (let i = 0; i < cnt; i++) {

          const tmp = px;

          px = px * Math.cos(angle) - py * Math.sin(angle);

          py = py * Math.cos(angle) + tmp * Math.sin(angle);

          this.shards = this.shards || [];

          this.shards.push(new Shard(this.x, this.y, px, py, this.alphaColor));

        }

      }

    }

    else if (this.phase === 'contemplate') {

      ++this.tick;

      // Vòng tròn nổ

      if (this.circleCreating) {

        ++this.tick2;

        const p = this.tick2 / this.circleCompleteTime;

        const a = -Math.cos(p * Math.PI) / 2 + 0.5;

        ctx.fillStyle = this.lightAlphaColor.replace('light', 50 + 50 * p).replace('alp', p);

        ctx.beginPath();

        ctx.arc(this.x, this.y, a * this.circleFinalSize, 0, Tau);

        ctx.fill();

        if (this.tick2 > this.circleCompleteTime) {

          this.circleCreating = false;

          this.circleFading = true;

          this.tick2 = 0;

        }

      }

      else if (this.circleFading) {

        ctx.fillStyle = this.lightColor.replace('light', 70);

        ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

        ++this.tick2;

        const p = this.tick2 / this.circleFadeTime;

        const a = -Math.cos(p * Math.PI) / 2 + 0.5;

        ctx.fillStyle = this.lightAlphaColor.replace('light', 100).replace('alp', 1 - a);

        ctx.beginPath();

        ctx.arc(this.x, this.y, this.circleFinalSize, 0, Tau);

        ctx.fill();

        if (this.tick2 >= this.circleFadeTime) this.circleFading = false;

      }

      else {

        ctx.fillStyle = this.lightColor.replace('light', 70);

        ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

      }

      // Mảnh vỡ

      if (this.shards) {

        for (let i = this.shards.length - 1; i >= 0; i--) {

          this.shards[i].step();

          if (!this.shards[i].alive) this.shards.splice(i, 1);

        }

      }

      // Chuyển sang bóng bay

      if (this.tick > opts.letterContemplatingWaitTime) {

        this.phase = 'balloon';

        this.tick = 0;

        this.spawning = true;

        this.spawnTime = opts.balloonSpawnTime * Math.random() | 0;

        this.inflateTime = opts.balloonBaseInflateTime + opts.balloonAddedInflateTime * Math.random() | 0;

        this.size = opts.balloonBaseSize + opts.balloonAddedSize * Math.random();

        const rad = opts.balloonBaseRadian + opts.balloonAddedRadian * Math.random();

        const vel = opts.balloonBaseVel + opts.balloonAddedVel * Math.random();

        this.vx = Math.cos(rad) * vel;

        this.vy = Math.sin(rad) * vel;

      }

    }

    else if (this.phase === 'balloon') {

      if (this.spawning) {

        ++this.tick;

        ctx.fillStyle = this.lightColor.replace('light', 70);

        ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

        if (this.tick >= this.spawnTime) {

          this.spawning = false;

          this.inflating = true;

          this.tick = 0;

        }

      }

      else if (this.inflating) {

        ++this.tick;

        const p = this.tick / this.inflateTime;

        const bx = this.cx = this.x;

        const by = this.cy = this.y - this.size * p;

        ctx.fillStyle = this.alphaColor.replace('alp', p);

        ctx.beginPath();

        balloonPath(bx, by, this.size * p);

        ctx.fill();

        ctx.strokeStyle = this.lightColor.replace('light', 80);

        ctx.beginPath();

        ctx.moveTo(bx, by + this.size * p);

        ctx.lineTo(bx, this.y);

        ctx.stroke();

        ctx.fillStyle = this.lightColor.replace('light', 70);

        ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

        if (this.tick >= this.inflateTime) this.inflating = false;

      }

      else {

        this.cx += this.vx;

        this.cy += this.vy += opts.upFlow;

        ctx.fillStyle = this.color;

        ctx.beginPath();

        balloonPath(this.cx, this.cy, this.size);

        ctx.fill();

        ctx.strokeStyle = this.lightColor.replace('light', 80);

        ctx.beginPath();

        ctx.moveTo(this.cx, this.cy + this.size);

        ctx.lineTo(this.cx, this.cy + this.size + 15);

        ctx.stroke();

        ctx.fillStyle = this.lightColor.replace('light', 70);

        ctx.fillText(this.char, this.cx + this.dx, this.cy + this.dy + this.size);

        if (this.cy + this.size < -hh || Math.abs(this.cx) > hw + 100)

          this.phase = 'done';

      }

    }

  }

}

class Shard {

  constructor(x, y, vx, vy, color) {

    const vel = opts.fireworkShardBaseVel + opts.fireworkShardAddedVel * Math.random();

    this.x = x + vx * vel;

    this.y = y + vy * vel;

    this.vx = vx * vel;

    this.vy = vy * vel;

    this.color = color;

    this.points = [[this.x, this.y]];

    this.size = opts.fireworkShardBaseSize + opts.fireworkShardAddedSize * Math.random();

    this.alive = true;

  }

  step() {

    this.x += this.vx;

    this.y += this.vy += opts.gravity;

    this.points.push([this.x, this.y]);

    if (this.points.length > opts.fireworkShardPrevPoints) this.points.shift();

    for (let i = 1; i < this.points.length; i++) {

      ctx.strokeStyle = this.color.replace('alp', i / this.points.length);

      ctx.lineWidth = i * this.size / this.points.length;

      ctx.beginPath();

      ctx.moveTo(this.points[i-1][0], this.points[i-1][1]);

      ctx.lineTo(this.points[i][0], this.points[i][1]);

      ctx.stroke();

    }

    if (this.y > h) this.alive = false;

  }

}

function balloonPath(x, y, size) {

  ctx.moveTo(x, y);

  ctx.bezierCurveTo(x - size/2, y - size/2, x - size/4, y - size, x, y - size);

  ctx.bezierCurveTo(x + size/4, y - size, x + size/2, y - size/2, x, y);

  ctx.lineTo(x - 4, y + size/3);

  ctx.lineTo(x + 4, y + size/3);

  ctx.closePath();

}

// Tạo chữ

for (let i = 0; i < opts.strings.length; i++) {

  for (let j = 0; j < opts.strings[i].length; j++) {

    letters.push(new Letter(

      opts.strings[i][j],

      j * opts.charSpacing + opts.charSpacing / 2 - opts.strings[i].length * opts.charSize / 2,

      i * opts.lineHeight + opts.lineHeight / 2 - opts.strings.length * opts.lineHeight / 2

    ));

  }

}

// Animation loop

function anim() {

  requestAnimationFrame(anim);

  ctx.fillStyle = '#111119';

  ctx.fillRect(0, 0, w, h);

  ctx.save();

  ctx.translate(hw, hh);

  let allDone = true;

  letters.forEach(l => {

    l.step();

    if (l.phase !== 'done') allDone = false;

  ;

  });

  ctx.restore();

  if (allDone) letters.forEach(l => l.reset());

}

anim();

window.addEventListener('resize', () => {

  w = c.width = window.innerWidth;

  h = c.height = window.innerHeight;

  hw = w / 2;

  hh = h / 2;

});
