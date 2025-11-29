const REDIRECT_URL = "index.html"; // Thay link chuyển hướng ở đây

const c = document.getElementById('c');
const ctx = c.getContext('2d');

let w = c.width = window.innerWidth;
let h = c.height = window.innerHeight;
let hw = w / 2;
let hh = h / 2;

const opts = {
  strings: ['HAPPY', 'BIRTHDAY', 'TO YOU!'],
  charSize: 56,
  charSpacing: 62,
  lineHeight: 100,
  fireworkPrevPoints: 10,
  fireworkBaseLineWidth: 6,
  fireworkAddedLineWidth: 10,
  fireworkSpawnTime: 200,
  fireworkBaseReachTime: 30,
  fireworkAddedReachTime: 30,
  fireworkCircleBaseSize: 32,
  fireworkCircleAddedSize: 20,
  fireworkBaseShards: 7,
  fireworkAddedShards: 7,
  gravity: 0.08,
  upFlow: -0.12,
  letterContemplatingWaitTime: 400,
  balloonBaseSize: 38,
  balloonSpawnTime: 50,
  balloonBaseInflateTime: 12,
  balloonAddedInflateTime: 12,
  balloonBaseVel: 0.5,
  balloonAddedVel: 0.5,
  balloonBaseRadian: -Math.PI / 2,
  balloonAddedRadian: Math.PI,
};

const Tau = Math.PI * 2;
const letters = [];
let hasRedirected = false;

ctx.font = `${opts.charSize}px Verdana, sans-serif`;

// Hàm tạo màu có alpha linh hoạt (sửa lỗi alp, light% trước đây)
function createColor(hue) {
  return {
    color: `hsl(${hue},85%,55%)`,
    lightColor: `hsl(${hue},90%,75%)`,
    lightAlpha: a => `hsla(${hue},90%,80%,${a})`,
    alpha: a => `hsla(${hue},85%,55%,${a})`
  };
}

function createLetters() {
  letters.length = 0;
  opts.strings.forEach((line, i) => {
    let offsetX = line.length * opts.charSpacing / 2;
    if (i === 1) offsetX = ctx.measureText(line).width / 2; // BIRTHDAY chính giữa chuẩn

    const totalHeight = (opts.strings.length - 1) * opts.lineHeight;
    const y = i * opts.lineHeight - totalHeight / 2;

    for (let j = 0; j < line.length; j++) {
      const x = j * opts.charSpacing - offsetX;
      letters.push(new Letter(line[j], x, y));
    }
  });
}

class Letter {
  constructor(char, x, y) {
    this.char = char;
    this.x = x;
    this.y = y;
    this.dx = -ctx.measureText(char).width / 2;
    this.dy = opts.charSize / 2;
    this.fireworkDy = this.y - hh;

    const hue = (x * 1.2 + 180) % 360;
    Object.assign(this, createColor(hue));

    this.reset();
  }

  reset() {
    this.phase = 'firework';
    this.tick = this.tick2 = 0;
    this.spawned = false;
    this.spawningTime = opts.fireworkSpawnTime * Math.random() | 0;
    this.reachTime = opts.fireworkBaseReachTime + opts.fireworkAddedReachTime * Math.random() 0;
    this.lineWidth = opts.fireworkBaseLineWidth + opts.fireworkAddedLineWidth * Math.random();
    this.prevPoints = [[0, hh, 0]];
    this.shards = null;
  }

  step() {
    if (this.phase === 'firework') {
      if (!this.spawned) {
        if (++this.tick >= this.spawningTime) this.spawned = true;
        return;
      }

      ++this.tick;
      const p = this.tick / this.reachTime;
      const x = this.x * p;
      const y = hh + this.fireworkDy * p;

      if (this.prevPoints.length > opts.fireworkPrevPoints) this.prevPoints.shift();
      this.prevPoints.push([x, y, p * this.lineWidth]);

      for (let i = 1; i < this.prevPoints.length; i++) {
        const [x1, y1, lw1] = this.prevPoints[i];
        const [x2, y2] = this.prevPoints[i - 1];
        ctx.strokeStyle = this.alpha(i / this.prevPoints.length);
        ctx.lineWidth = lw1;
        ctx.beginPath();
        ctx.moveTo(x2 + hw, y2 + hh);
        ctx.lineTo(x1 + hw, y1 + hh);
        ctx.stroke();
      }

      if (p >= 1) {
        this.phase = 'contemplate';
        this.circleFinalSize = opts.fireworkCircleBaseSize + opts.fireworkCircleAddedSize * Math.random();
        this.circleCompleteTime = 30 + 20 * Math.random() 0;
        this.circleCreating = true;
        this.tick = this.tick2 = 0;

        const cnt = opts.fireworkBaseShards + opts.fireworkAddedShards * Math.random() 0;
        const step = Tau / cnt;
        let angle = Math.random() * Tau;
        this.shards = [];
        for (let i = 0; i < cnt; i++) {
          this.shards.push(new Shard(this.x, this.y, Math.cos(angle), Math.sin(angle), this.alpha));
          angle += step;
        }
      }
    }
    else if (this.phase === 'contemplate') {
      ++this.tick;

      if (this.circleCreating) {
        const p = ++this.tick2 / this.circleCompleteTime;
        if (p >= 1) {
          this.circleCreating = false;
          this.circleFading = true;
          this.tick2 = 0;
        } else {
          ctx.fillStyle = this.lightAlpha(p);
          ctx.beginPath();
          ctx.arc(this.x + hw, this.y + hh, p * this.circleFinalSize, 0, Tau);
          ctx.fill();
        }
      }
      else {
        ctx.fillStyle = this.lightColor;
        ctx.fillText(this.char, this.x + this.dx + hw, this.y + this.dy + hh);
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
        this.spawnTime = opts.balloonSpawnTime * Math.random() 0;
        this.inflateTime = opts.balloonBaseInflateTime + opts.balloonAddedInflateTime * Math.random() 0;
        this.size = opts.balloonBaseSize + 10 * Math.random();
        const angle = opts.balloonBaseRadian + opts.balloonAddedRadian * Math.random();
        const speed = opts.balloonBaseVel + opts.balloonAddedVel * Math.random();
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
      }
    }
    else if (this.phase === 'balloon') {
      if (this.tick < this.spawnTime + this.inflateTime) {
        ++this.tick;
        const p = Math.max(0, (this.tick - this.spawnTime) / this.inflateTime);
        const bx = this.x + hw;
        const by = this.y + hh - this.size * p;

        if (p > 0) {
          ctx.fillStyle = this.alpha(p * 0.9);
          ctx.beginPath();
          balloonPath(bx, by, this.size * p);
          ctx.fill();

          ctx.strokeStyle = this.lightColor;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(bx, by + this.size * p);
          ctx.lineTo(bx, this.y + hh + opts.charSize / 2);
          ctx.stroke();
        }
        ctx.fillStyle = this.lightColor;
        ctx.fillText(this.char, this.x + this.dx + hw, this.y + this.dy + hh);
      } else {
        this.x += this.vx;
        this.y += this.vy += opts.upFlow;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        balloonPath(this.x + hw, this.y + hh, this.size);
        ctx.fill();

        ctx.strokeStyle = this.lightColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.x + hw, this.y + hh + this.size);
        ctx.lineTo(this.x + hw, this.y + hh + this.size + 20);
        ctx.stroke();

        ctx.fillStyle = this.lightColor;
        ctx.fillText(this.char, this.x + this.dx + hw, this.y + this.dy + hh + this.size);

        if (this.y + hh < -150) this.phase = 'done';
      }
    }
  }
}

class Shard {
  constructor(x, y, vx, vy, colorFn) {
    const speed = 4 + 3 * Math.random();
    this.x = x + vx * speed;
    this.y = y + vy * speed;
    this.vx = vx * speed;
    this.vy = vy * speed;
    this.colorFn = colorFn;
    this.points = [[this.x, this.y]];
    this.alive = true;
  }

  step() {
    this.x += this.vx;
    this.y += this.vy += opts.gravity;
    this.points.push([this.x, this.y]);
    if (this.points.length > 4) this.points.shift();

    for (let i = 1; i < this.points.length; i++) {
      ctx.strokeStyle = this.colorFn(i / this.points.length);
      ctx.lineWidth = 4 * (i / this.points.length);
      ctx.beginPath();
      ctx.moveTo(this.points[i - 1][0] + hw, this.points[i - 1][1] + hh);
      ctx.lineTo(this.points[i][0] + hw, this.points[i][1] + hh);
      ctx.stroke();
    }

    if (this.y + hh > h + 50) this.alive = false;
  }
}

function balloonPath(x, y, size) {
  ctx.moveTo(x, y - size);
  ctx.bezierCurveTo(x + size / 1.6, y - size / 2, x + size / 1.6, y + size / 2, x, y + size);
  ctx.bezierCurveTo(x - size / 1.6, y + size / 2, x - size / 1.6, y - size / 2, x, y - size);
  ctx.closePath();
}

// Khởi chạy
createLetters();

function loop() {
  requestAnimationFrame(loop);
  ctx.fillStyle = 'rgba(10,10,25,0.15)';
  ctx.fillRect(0, 0, w, h);

  let allDone = true;
  letters.forEach(l => {
    l.step();
    if (l.phase !== 'done') allDone = false;
 0;
  });

  if (allDone && !hasRedirected) {
    hasRedirected = true;
    setTimeout(() => location.href = REDIRECT_URL, 3000);
  }
}

loop();

window.addEventListener('resize', () => {
  w = c.width = innerWidth;
  h = c.height = innerHeight;
  hw = w / 2;
  hh = h / 2;
  ctx.font = `${opts.charSize}px Verdana, sans-serif`;
  createLetters();
});
