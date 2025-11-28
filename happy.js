const c = document.getElementById('c');
const ctx = c.getContext('2d');

let w = c.width = window.innerWidth;
let h = c.height = window.innerHeight;
let hw = w / 2;
let hh = h / 2;

// ==== CẤU HÌNH ====
const opts = {
  strings: ['HAPPY', 'BIRTHDAY', 'TO YOU!'], // ← Thay tên ở đây nhé
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
  balloonBaseSize: 40,           // tăng lên cho đẹp hơn
  balloonBaseVel: 0.4,
  balloonAddedVel: 0.4,
  balloonBaseRadian: -(Math.PI / 2 - 0.5),
  balloonAddedRadian: 1,
};

// LINK CHUYỂN TỚI SAU KHI BÓNG BAY HẾT
const NEXT_PAGE_URL = "https://www.facebook.com/messages/t/100010253991234"; 
// ← Thay link quà tặng, video, Zalo, v.v. vào đây

const calc = {
  totalWidth: opts.charSpacing * Math.max(...opts.strings.map(s => s.length))
};

const Tau = Math.PI * 2;
const letters = [];
let doneCount = 0;
let redirected = false;

ctx.font = `${opts.charSize}px Verdana, sans-serif`;

class Letter {
  constructor(char, x, y) {
    this.char = char;
    this.x = x;
    this.y = y;

    this.dx = -ctx.measureText(char).width / 2;
    this.dy = opts.charSize / 2;
    this.fireworkDy = this.y - hh;

    const hue = ((x / calc.totalWidth + 0.5) % 1) * 360;

    this.color = `hsl(${hue},80%,50%)`;
    this.lightColor = (light) => `hsl(${hue},80%,${light}%)`;
    this.lightAlphaColor = (light, alp) => `hsla(${hue},80%,${light}%,${alp})`;
    this.alphaColor = (alp) => `hsla(${hue},80%,50%,${alp})`;

    this.reset();
  }

  reset() {
    this.phase = 'firework';
    this.tick =  = 0;
    this.tick2 = 0;
    this.spawned = false;
    this.spawningTime = opts.fireworkSpawnTime * Math.random() | 0;
    this.reachTime = opts.fireworkBaseReachTime + opts.fireworkAddedReachTime * Math.random() | 0;
    this.lineWidth = opts.fireworkBaseLineWidth + opts.fireworkAddedLineWidth * Math.random();
    this.prevPoints = [[0, hh, 0]];
    this.shards = null;
  }

  step() {
    // ==== PHÁO HOA ====
    if (this.phase === 'firework') {
      if (!this.spawned) {
        if (++this.tick >= this.spawningTime) { this.spawned = true; this.tick = 0; }
        return;
      }

      ++this.tick;
      const t = this.tick / this.reachTime;
      const x = t * this.x;
      const y = hh + Math.sin(t * Math.PI / 2) * this.fireworkDy;

      if (this.prevPoints.length > opts.fireworkPrevPoints) this.prevPoints.shift();
      this.prevPoints.push([x, y, t * this.lineWidth]);

      for (let i = 1; i < this.prevPoints.length; i++) {
        const [x1,y1] = this.prevPoints[i];
        const [x2,y2] = this.prevPoints[i-1];
        ctx.strokeStyle = this.alphaColor(i / this.prevPoints.length);
        ctx.lineWidth = this.prevPoints[i][2] * (i / this.prevPoints.length);
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      }

      if (this.tick >= this.reachTime) {
        this.phase = 'contemplate';
        this.circleFinalSize = opts.fireworkCircleBaseSize + opts.fireworkCircleAddedSize * Math.random();
        this.circleCompleteTime = opts.fireworkCircleBaseTime + opts.fireworkCircleAddedTime * Math.random() | 0;
        this.circleCreating = true;
        this.circleFadeTime = opts.fireworkCircleFadeBaseTime + opts.fireworkCircleFadeAddedTime * Math.random() | 0;
        this.tick = this.tick2 = 0;

        // tạo mảnh pháo hoa
        const cnt = opts.fireworkBaseShards + opts.fireworkAddedShards * Math.random() | 0;
        const angle = Tau / cnt;
        let px = 1, py = 0;
        this.shards = [];
        for (let i = 0; i < cnt; i++) {
          const tmp = px;
          px = px * Math.cos(angle) - py * Math.sin(angle);
          py = py * Math.cos(angle) + tmp * Math.sin(angle);
          this.shards.push(new Shard(this.x, this.y, px, py, this.alphaColor));
        }
      }
      return;
    }

    // ==== NỔ + HIỆN CHỮ ====
    if (this.phase === 'contemplate') {
      ++this.tick;

      // vòng tròn nổ
      if (this.circleCreating) {
        ++this.tick2;
        const p = this.tick2 / this.circleCompleteTime;
        const s = -Math.cos(p * Math.PI)/2 + 0.5;
        ctx.fillStyle = this.lightAlphaColor(50 + 50*p, p);
        ctx.beginPath();
        ctx.arc(this.x, this.y, s * this.circleFinalSize, 0, Tau);
        ctx.fill();

        if (this.tick2 > this.circleCompleteTime) {
          this.circleCreating = false;
          this.circleFading = true;
          this.tick2 = 0;
        }
      }
      else if (this.circleFading) {
        ctx.fillStyle = this.lightColor(70);
        ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

        ++this.tick2;
        const p = this.tick2 / this.circleFadeTime;
        const s = -Math.cos(p * Math.PI)/2 + 0.5;
        ctx.fillStyle = this.lightAlphaColor(100, 1-s);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.circleFinalSize, 0, Tau);
        ctx.fill();

        if (this.tick2 >= this.circleFadeTime) this.circleFading = false;
      }
      else {
        ctx.fillStyle = this.lightColor(70);
        ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
      }

      // mảnh vỡ
      this.shards?.forEach((s, i) => {
        s.step();
        if (!s.alive) this.shards.splice(i, 1);
      });

      if (this.tick > opts.letterContemplatingWaitTime) {
        this.phase = 'balloon';
        this.tick = 0;
      }
      return;
    }

    // ==== BÓNG BAY ====
    if (this.phase === 'balloon') {
      if (this.tick < 40) { // chờ chút cho đẹp
        ++this.tick;
        ctx.fillStyle = this.lightColor(70);
        ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
      } else if (this.tick < 100) { // bơm bóng
        ++this.tick;
        const p = (this.tick - 40) / 60;
        const bx = this.x;
        const by = this.y - opts.balloonSize * p;

        ctx.fillStyle = this.alphaColor(p);
        ctx.beginPath();
        balloonPath(bx, by, opts.balloonSize * p);
        ctx.fill();

        ctx.strokeStyle = this.lightColor(80);
        ctx.beginPath();
        ctx.moveTo(bx, by + opts.balloonSize * p);
        ctx.lineTo(bx, this.y);
        ctx.stroke();

        ctx.fillStyle = this.lightColor(70);
        ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
      } else {
        // bay lên
        if (!this.cx) {
          this.cx = this.x;
          this.cy = this.y;
          const rad = opts.balloonBaseRadian + opts.balloonAddedRadian * Math.random();
          const vel = opts.balloonBaseVel + opts.balloonAddedVel * Math.random();
          this.vx = Math.cos(rad) * vel;
          this.vy = Math.sin(rad) * vel;
        }

        this.cx += this.vx;
        this.cy += this.vy += opts.upFlow;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        balloonPath(this.cx, this.cy, opts.balloonSize);
        ctx.fill();

        ctx.strokeStyle = this.lightColor(80);
        ctx.beginPath();
        ctx.moveTo(this.cx, this.cy + opts.balloonSize);
        ctx.lineTo(this.cx, this.cy + opts.balloonSize + 20);
        ctx.stroke();

        ctx.fillStyle = this.lightColor(70);
        ctx.fillText(this.char, this.cx + this.dx, this.cy + this.dy + opts.balloonSize);

        // bay khỏi màn hình → xong
        if (this.cy < -hh - 100) {
          this.phase = 'done';
          doneCount++;
        }
      }
    }
  }
}

class Shard {
  constructor(x, y, vx, vy, colorFn) {
    const vel = opts.fireworkShardBaseVel + opts.fireworkShardAddedVel * Math.random();
    this.x = x;
    this.y = y;
    this.vx = vx * vel;
    this.vy = vy * vel;
    this.colorFn = colorFn;
    this.points = [[x, y]];
    this.size = opts.fireworkShardBaseSize + opts.fireworkShardAddedSize * Math.random();
    this.alive = true;
  }

  step() {
    this.x += this.vx;
    this.y += this.vy += opts.gravity;
    this.points.push([this.x, this.y]);
    if (this.points.length > opts.fireworkShardPrevPoints) this.points.shift();

    for (let i = 1; i < this.points.length; i++) {
      ctx.strokeStyle = this.colorFn(i / this.points.length);
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
  ctx.bezierCurveTo(x-size/2, y-size/2, x-size/4, y-size, x, y-size);
  ctx.bezierCurveTo(x+size/4, y-size, x+size/2, y-size/2, x, y);
  ctx.lineTo(x-5, y+size/3);
  ctx.lineTo(x+5, y+size/3);
  ctx.closePath();
}

// Tạo chữ
opts.strings.forEach((str, i) => {
  [...str].forEach((char, j) => {
    letters.push(new Letter(
      char,
      j * opts.charSpacing + opts.charSpacing/2 - str.length * opts.charSize/2,
      i * opts.lineHeight + opts.lineHeight/2 - opts.strings.length * opts.lineHeight/2
    ));
  });
});

// Vòng lặp
function anim() {
  requestAnimationFrame(anim);
  ctx.fillStyle = '#111119';
  ctx.fillRect(0,0,w,h);

  ctx.save();
  ctx.translate(hw, hh);

  letters.forEach(l => l.step());

  ctx.restore();

  // Chuyển trang khi xong
  if (doneCount >= letters.length && !redirected) {
    redirected = true;
    setTimeout(() => window.location.href = NEXT_PAGE_URL, 1500);
  }
}
anim();

// Resize
window.addEventListener('resize', () => {
  w = c.width = window.innerWidth;
  h = c.height = window.innerHeight;
  hw = w/2;
  hh = h/2;
});
