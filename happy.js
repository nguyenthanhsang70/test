const c = document.getElementById('c');
const ctx = c.getContext('2d');

let w = c.width = window.innerWidth;
let h = c.height = window.innerHeight;
let hw = w / 2;
let hh = h / 2;

const opts = {
  strings: ['HAPPY', 'BIRTHDAY', 'TO YOU!'], // ✨ ĐỔI LỜI CHÚC Ở ĐÂY
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

// 👉 TRANG MUỐN CHUYỂN ĐẾN SAU HIỆU ỨNG
const NEXT_PAGE_URL = "index.html";

const calc = {
  totalWidth: opts.charSpacing * Math.max(...opts.strings.map(s => s.length))
};

const Tau = Math.PI * 2;
const letters = [];
let doneCount = 0;
let redirectTriggered = false;

ctx.font = opts.charSize + 'px Verdana';

class Letter {
  constructor(char, x, y) {
    this.char = char;
    this.x = x;
    this.y = y;
    this.dx = -ctx.measureText(char).width / 2;
    this.dy = opts.charSize / 2;

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
    this.shards = null;
  }

  step() {
    this.tick++;

    // ---------------- FIREWORK ----------------
    if (this.phase === 'firework') {
      if (!this.spawned) {
        this.spawned = true;
        this.py = hh;
        this.px = this.x;
        this.vy = (this.y - hh) / (opts.fireworkBaseReachTime + Math.random() * opts.fireworkAddedReachTime);
        this.vx = 0;
        this.prevPoints = [];
      }

      this.py += this.vy;
      this.prevPoints.push([this.px, this.py]);

      while (this.prevPoints.length > opts.fireworkPrevPoints)
        this.prevPoints.shift();

      ctx.strokeStyle = this.alphaColor.replace('alp', 1);
      ctx.lineWidth = opts.fireworkBaseLineWidth;
      ctx.beginPath();
      ctx.moveTo(this.prevPoints[0][0], this.prevPoints[0][1]);

      for (let i = 1; i < this.prevPoints.length; i++)
        ctx.lineTo(this.prevPoints[i][0], this.prevPoints[i][1]);

      ctx.stroke();

      if (Math.abs(this.py - this.y) < 10) {
        this.phase = 'circle';
        this.tick = 0;
        this.circleSize = opts.fireworkCircleBaseSize + Math.random() * opts.fireworkCircleAddedSize;
      }
    }

    // ---------------- CIRCLE EXPLOSION ----------------
    else if (this.phase === 'circle') {
      const t = this.tick / (opts.fireworkCircleBaseTime + opts.fireworkCircleAddedTime);

      ctx.strokeStyle = this.alphaColor.replace('alp', 1 - t);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.circleSize * t, 0, Tau);
      ctx.stroke();

      if (t >= 1) {
        this.phase = 'balloon';
        this.tick = 0;

        this.cx = this.x;
        this.cy = this.y;

        this.size = 0;
        this.inflateTime = opts.balloonBaseInflateTime + Math.random() * opts.balloonAddedInflateTime;
        this.maxSize = opts.balloonBaseSize + Math.random() * opts.balloonAddedSize;

        this.vx = (Math.random() - 0.5) * 2;
        this.vy = -(opts.balloonBaseVel + Math.random() * opts.balloonAddedVel);

        this.inflating = true;
      }
    }

    // ---------------- BALLOON ----------------
    else if (this.phase === 'balloon') {

      if (this.inflating) {
        const t = this.tick / this.inflateTime;
        this.size = this.maxSize * t;

        if (t >= 1) {
          this.inflating = false;
        }
      } else {
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

        if (this.cy + this.size < -hh || Math.abs(this.cx) > hw + 100) {
          this.phase = 'done';
          doneCount++;
        }
      }
    }
  }
}

// ---------------- BALLOON SHAPE ----------------
function balloonPath(x, y, r) {
  ctx.moveTo(x, y - r);
  ctx.bezierCurveTo(x + r, y - r, x + r, y + r, x, y + r);
  ctx.bezierCurveTo(x - r, y + r, x - r, y - r, x, y - r);
}

// ---------------- CREATE LETTERS ----------------
for (let i = 0; i < opts.strings.length; i++) {
  for (let j = 0; j < opts.strings[i].length; j++) {

    letters.push(new Letter(
      opts.strings[i][j],
      j * opts.charSpacing + opts.charSpacing / 2 - opts.strings[i].length * opts.charSize / 2,
      i * opts.lineHeight + opts.lineHeight / 2 - opts.strings.length * opts.lineHeight / 2
    ));
  }
}

// ---------------- ANIMATE ----------------
function anim() {
  requestAnimationFrame(anim);

  ctx.fillStyle = '#111119';
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.translate(hw, hh);

  letters.forEach(l => l.step());
  ctx.restore();

  if (doneCount >= letters.length && !redirectTriggered) {
    redirectTriggered = true;
    setTimeout(() => {
      window.location.href = NEXT_PAGE_URL;
    }, 1000);
  }
}

anim();

// ---------------- RESIZE ----------------
window.addEventListener('resize', () => {
  w = c.width = window.innerWidth;
  h = c.height = window.innerHeight;
  hw = w / 2;
  hh = h / 2;
});
