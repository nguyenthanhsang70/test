const REDIRECT_URL = "index.html"; // THAY LINK CHUYỂN HƯỚNG SAU KHI XONG Ở ĐÂY

const c = document.getElementById('c');
const ctx = c.getContext('2d');
let w = c.width = window.innerWidth;
let h = c.height = window.innerHeight;
let hw = w / 2;
let hh = h / 2;

const opts = {
  strings: ['HAPPY', 'BIRTHDAY', 'TO YOU!'],
  charSize: 52,              // Chữ to đẹp
  charSpacing: 58,           // Khoảng cách chữ
  lineHeight: 90,            // Khoảng cách giữa các dòng

  fireworkPrevPoints: 10,
  fireworkBaseLineWidth: 6,
  fireworkAddedLineWidth: 10,
  fireworkSpawnTime: 200,
  fireworkBaseReachTime: 30,
  fireworkAddedReachTime: 30,
  fireworkCircleBaseSize: 30,
  fireworkCircleAddedSize: 18,
  fireworkCircleBaseTime: 30,
  fireworkCircleAddedTime: 30,
  fireworkCircleFadeBaseTime: 10,
  fireworkCircleFadeAddedTime: 5,
  fireworkBaseShards: 6,
  fireworkAddedShards: 6,
  fireworkShardPrevPoints: 3,
  fireworkShardBaseVel: 4,
  fireworkShardAddedVel: 2,
  fireworkShardBaseSize: 3,
  fireworkShardAddedSize: 3,
  gravity: 0.08,
  upFlow: -0.12,
  letterContemplatingWaitTime: 400,

  balloonSpawnTime: 50,
  balloonBaseInflateTime: 12,
  balloonAddedInflateTime: 12,
  balloonBaseSize: 36,         // Bóng bay to hơn
  balloonBaseVel: 0.5,
  balloonAddedVel: 0.5,
  balloonBaseRadian: -(Math.PI / 2 - 0.5),
  balloonAddedRadian: 1,
};

const Tau = Math.PI * 2;
const letters = [];
let hasRedirected = false;

// Tính chiều rộng dòng dài nhất để căn giữa các dòng ngắn
const calc = {
  totalWidth: opts.charSpacing * Math.max(...opts.strings.map(s => s.length))
};

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
    this.lightColor = `hsl(${hue},80%,70%)`;
    this.lightAlphaColor = `hsla(${hue},80%,light%,alp)`;
    this.alphaColor = `hsla(${hue},80%,50%,alp)`;
    this.reset();
  }

  reset() {
    this.phase = 'firework';
    this.tick = 0;
    this.tick2 = 0;
    this.spawned = false;
    this.spawningTime = opts.fireworkSpawnTime * Math.random() | 0;
    this.reachTime = opts.fireworkBaseReachTime + opts.fireworkAddedReachTime * Math.random() | 0;
    this.lineWidth = opts.fireworkBaseLineWidth + opts.fireworkAddedLineWidth * Math.random();
    this.prevPoints = [[0, hh, 0]];
    this.shards = null;
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
      const progress = this.tick / this.reachTime;
      const ease = Math.sin(progress * Math.PI / 2);
      const x = ease * this.x;
      const y = hh + ease * this.fireworkDy;

      if (this.prevPoints.length > opts.fireworkPrevPoints) this.prevPoints.shift();
      this.prevPoints.push([x, y, progress * this.lineWidth]);

      for (let i = 1; i < this.prevPoints.length; i++) {
        const [x1, y1, lw1] = this.prevPoints[i];
        const [x2, y2, lw2] = this.prevPoints[i - 1];
        ctx.strokeStyle = this.alphaColor.replace('alp', i / this.prevPoints.length);
        ctx.lineWidth = lw1 * (i / (this.prevPoints.length - 1));
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

        // Tạo mảnh pháo hoa
        const cnt = opts.fireworkBaseShards + opts.fireworkAddedShards * Math.random() | 0;
        const angleStep = Tau / cnt;
        let angle = Math.random() * Tau;
        this.shards = [];
        for (let i = 0; i < cnt; i++) {
          const vx = Math.cos(angle);
          const vy = Math.sin(angle);
          this.shards.push(new Shard(this.x, this.y, vx, vy, this.alphaColor));
          angle += angleStep;
        }
      }
    }
    else if (this.phase === 'contemplate') {
      ++this.tick;

      if (this.circleCreating) {
        ++this.tick2;
        const p = this.tick2 / this.circleCompleteTime;
        if (p >= 1) {
          this.circleCreating = false;
          this.circleFading = true;
          this.tick2 = 0;
        } else {
          const a = -Math.cos(p * Math.PI) / 2 + 0.5;
          ctx.fillStyle = this.lightAlphaColor.replace('light', 50 + 50 * p).replace('alp', p);
          ctx.beginPath();
          ctx.arc(this.x, this.y, a * this.circleFinalSize, 0, Tau);
          ctx.fill();
        }
      }
      else if (this.circleFading) {
        ctx.fillStyle = this.lightColor;
        ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
        ++this.tick2;
        const p = this.tick2 / this.circleFadeTime;
        if (p >= 1) this.circleFading = false;
        else {
          const a = -Math.cos(p * Math.PI) / 2 + 0.5;
          ctx.fillStyle = this.lightAlphaColor.replace('light', 100).replace('alp', 1 - a);
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.circleFinalSize, 0, Tau);
          ctx.fill();
        }
      }
      else {
        ctx.fillStyle = this.lightColor;
        ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
      }

      if (this.shards) {
        for (let i = this.shards.length - 1; i >= 0; i--) {
          this.shards[i].step();
          if (!this.shards[i].alive) this.shards.splice(i, 1);
        }
      }

      if (this.tick > opts.letterContemplatingWaitTime) {
        this.phase = 'balloon';
        this.tick = 0;
        this.spawning = true;
        this.spawnTime = opts.balloonSpawnTime * Math.random() | 0;
        this.inflateTime = opts.balloonBaseInflateTime + opts.balloonAddedInflateTime * Math.random() | 0;
        this.size = opts.balloonSize;
        const rad = opts.balloonBaseRadian + opts.balloonAddedRadian * Math.random();
        const vel = opts.balloonBaseVel + opts.balloonAddedVel * Math.random();
        this.vx = Math.cos(rad) * vel;
        this.vy = Math.sin(rad) * vel;
      }
    }
    else if (this.phase === 'balloon') {
      if (this.spawning) {
        ++this.tick;
        ctx.fillStyle = this.lightColor;
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

        ctx.strokeStyle = this.lightColor.replace('70', '85');
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(bx, by + this.size * p);
        ctx.lineTo(bx, this.y);
        ctx.stroke();

        ctx.fillStyle = this.lightColor;
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

        ctx.strokeStyle = this.lightColor.replace('70', '85');
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(this.cx, this.cy + this.size);
        ctx.lineTo(this.cx, this.cy + this.size + 18);
        ctx.stroke();

        ctx.fillStyle = this.lightColor;
        ctx.fillText(this.char, this.cx + this.dx, this.cy + this.dy + this.size);

        if (this.cy + this.size < -hh || Math.abs(this.cx) > hw + 300) {
          this.phase = 'done';
        }
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
      ctx.lineWidth = this.size * (i / this.points.length);
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
  ctx.bezierCurveTo(x - size / 2, y - size / 2, x - size / 4, y - size, x, y - size);
  ctx.bezierCurveTo(x + size / 4, y - size, x + size / 2, y - size / 2, x, y);
  ctx.lineTo(x - 5, y + size / 2.8);
  ctx.lineTo(x + 5, y + size / 2.8);
  ctx.closePath();
}

// TẠO CHỮ — BIRTHDAY LUÔN Ở GIỮA HOÀN HẢO
ctx.font = opts.charSize + 'px Verdana';
for (let i = 0; i < opts.strings.length; i++) {
  const line = opts.strings[i];
  let offsetX = 0;

  if (i === 1) { // Dòng BIRTHDAY (index = 1)
    // Căn giữa tuyệt đối theo toàn bộ màn hình
    const lineWidth = ctx.measureText(line).width;
    offsetX = lineWidth / 2;
  } else {
    // 2 dòng kia vẫn căn giữa theo cách cũ (đẹp và cân đối)
    offsetX = (calc.totalWidth - line.length * opts.charSpacing) / 2;
  }

  for (let j = 0; j < line.length; j++) {
    const charX = j * opts.charSpacing - offsetX;
    const charY = i * opts.lineHeight + opts.lineHeight / 2 - (opts.strings.length - 1) * opts.lineHeight / 2;

    letters.push(new Letter(line[j], charX, charY));
  }
}

// Animation loop
function anim() {
  requestAnimationFrame(anim);
  ctx.fillStyle = '#0d0d1a';
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.translate(hw, hh);

  let allDone = true;
  letters.forEach(l => {
    l.step();
    if (l.phase !== 'done') allDone = false;
  });

  ctx.restore();

  if (allDone && !hasRedirected) {
    hasRedirected = true;
    setTimeout(() => {
      window.location.href = REDIRECT_URL;
    }, 1500);
  }
}

anim();

// Resize
window.addEventListener('resize', () => {
  w = c.width = window.innerWidth;
  h = c.height = window.innerHeight;
  hw = w /  / 2;
  hh = h / 2;
});
