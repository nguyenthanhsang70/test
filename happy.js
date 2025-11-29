const REDIRECT_URL = "index.html"; // Thay link chuyển hướng ở đây

const c = document.getElementById('c');
const ctx = c.getContext('2d');
let w = c.width = window.innerWidth;
let h = c.height = window.innerHeight;
let hw = w / 2;
let hh = h / 2;

const opts = {
  strings: ['HAPPY', 'BIRTHDAY', 'TO YOU!'],
  charSize: 56,              // To đẹp, giống ảnh bạn gửi
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
};

const Tau = Math.PI * 2;
const letters = [];
let hasRedirected = false;

ctx.font = `${opts.charSize}px Verdana, sans-serif`;

// TÍNH TOÁN ĐỂ BIRTHDAY LUÔN Ở CHÍNH GIỮA MÀN HÌNH
function createLetters() {
  letters.length = 0; // Xóa cũ nếu resize

  opts.strings.forEach((line, i) => {
    const isBirthday = i === 1;
    let offsetX = 0;

    if (isBirthday) {
      // Đo chính xác độ rộng thực tế của từ "BIRTHDAY"
      const textWidth = ctx.measureText(line).width;
      offsetX = textWidth / 2;
    } else {
      // Các dòng khác căn giữa theo cách thông thường (vẫn đẹp)
      const approxWidth = line.length * opts.charSpacing;
      offsetX = approxWidth / 2;
    }

    // Tính vị trí Y của từng dòng (căn giữa theo chiều dọc)
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

    // Màu sắc cầu vồng đẹp lung linh
    const hue = (x * 1.2 + 180) % 360;
    this.color = `hsl(${hue}, 85%, 55%)`;
    this.lightColor = `hsl(${hue}, 90%, 75%)`;
    this.lightAlphaColor = `hsla(${hue},90%,light%,alp)`;
    this.alphaColor = `hsla(${hue},85%,55%,alp)`;

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
        ++this.tick;
        if (this.tick >= this.spawningTime) {
          this.spawned = true;
          this.tick = 0;
        }
        return;
      }

      ++this.tick;
      const progress = this.tick / this.reachTime;
      const x = this.x * progress;
      const y = hh + this.fireworkDy * progress;

      if (this.prevPoints.length > opts.fireworkPrevPoints) this.prevPoints.shift();
      this.prevPoints.push([x, y, progress * this.lineWidth]);

      for (let i = 1; i < this.prevPoints.length; i++) {
        const [x1, y1, lw1] = this.prevPoints[i];
        const [x2, y2] = this.prevPoints[i - 1];
        ctx.strokeStyle = this.alphaColor.replace('alp', i / this.prevPoints.length);
        ctx.lineWidth = lw1;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      }

      if (progress >= 1) {
        this.phase = 'contemplate';
        this.circleFinalSize = opts.fireworkCircleBaseSize + opts.fireworkCircleAddedSize * Math.random();
        this.circleCompleteTime = 30 + 20 * Math.random() | 0;
        this.circleCreating = true;
        this.tick = this.tick2 = 0;

        // Pháo hoa nổ
        const cnt = opts.fireworkBaseShards + opts.fireworkAddedShards * Math.random() | 0;
        const angleStep = Tau / cnt;
        let angle = Math.random() * Tau;
        this.shards = [];
        for (let i = 0; i < cnt; i++) {
          this.shards.push(new Shard(this.x, this.y, Math.cos(angle), Math.sin(angle), this.alphaColor));
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
          const size = p * this.circleFinalSize;
          ctx.fillStyle = this.lightAlphaColor.replace('light', 80).replace('alp', p);
          ctx.beginPath();
          ctx.arc(this.x, this.y, size, 0, Tau);
          ctx.fill();
        }
      }

      else if (this.circleFading) {
        ctx.fillStyle = this.lightColor;
        ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
        ++this.tick2;
        if (this.tick2 > 15) this.circleFading = false;
      }

      else {
        ctx.fillStyle = this.lightColor;
        ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
      }

      // Vẽ mảnh pháo hoa
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
        this.spawnTime = opts.balloonSpawnTime * Math.random() | 0;
        this.inflateTime = opts.balloonBaseInflateTime + opts.balloonAddedInflateTime * Math.random() | 0;
        this.size = opts.balloonBaseSize + 10 * Math.random();
        const angle = opts.balloonBaseRadian + opts.balloonAddedRadian * Math.random();
        const speed = opts.balloonBaseVel + opts.balloonAddedVel * Math.random();
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
      }
    }

    else if (this.phase === 'balloon') {
      if (this.tick < this.spawnTime) {
        ++this.tick;
        ctx.fillStyle = this.lightColor;
        ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
      }
      else if (this.tick < this.spawnTime + this.inflateTime) {
        ++this.tick;
        const p = (this.tick - this.spawnTime) / this.inflateTime;
        const bx = this.x;
        const by = this.y - this.size * p;
        ctx.fillStyle = this.alphaColor.replace('alp', p * 0.9);
        ctx.beginPath();
        balloonPath(bx, by, this.size * p);
        ctx.fill();

        ctx.strokeStyle = this.lightColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(bx, by + this.size * p);
        ctx.lineTo(bx, this.y + opts.charSize / 2);
        ctx.stroke();

        ctx.fillStyle = this.lightColor;
        ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
      }
      else {
        this.x += this.vx;
        this.y += this.vy += opts.upFlow;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        balloonPath(this.x, this.y, this.size);
        ctx.fill();

        ctx.strokeStyle = this.lightColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.size);
        ctx.lineTo(this.x, this.y + this.size + 20);
        ctx.stroke();

        ctx.fillStyle = this.lightColor;
        ctx.fillText(this.char, this.x + this.dx, this.y + this.dy + this.size);

        if (this.y < -hh - 100) this.phase = 'done';
      }
    }
  }
}

class Shard {
  constructor(x, y, vx, vy, color) {
    const speed = 4 + 3 * Math.random();
    this.x = x + vx * speed;
    this.y = y + vy * speed;
    this.vx = vx * speed;
    this.vy = vy * speed;
    this.color = color;
    this.points = [[this.x, this.y]];
    this.alive = true;
  }
  step() {
    this.x += this.vx;
    this.y += this.vy += opts.gravity;
    this.points.push([this.x, this.y]);
    if (this.points.length > 4) this.points.shift();

    for (let i = 1; i < this.points.length; i++) {
      ctx.strokeStyle = this.color.replace('alp', i / this.points.length);
      ctx.lineWidth = 4 * (i / this.points.length);
      ctx.beginPath();
      ctx.moveTo(this.points[i-1][0], this.points[i-1][1]);
      ctx.lineTo(this.points[i][0], this.points[i][1]);
      ctx.stroke();
    }
    if (this.y > h + 50) this.alive = false;
  }
}

function balloonPath(x, y, size) {
  ctx.moveTo(x, y - size);
  ctx.bezierCurveTo(x + size/2, y - size/2, x + size/2, y + size/2, x, y + size);
  ctx.bezierCurveTo(x - size/2, y + size/2, x - size/2, y - size/2, x, y - size);
  ctx.closePath();
}

// Tạo chữ lần đầu
createLetters();

// Animation
function anim() {
  requestAnimationFrame(anim);
  ctx.fillStyle = 'rgba(10,10,25,0.15)';
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.translate(hw, hh);

  let done = true;
  letters.forEach(l => {
    l.step();
    if (l.phase !== 'done') done = false;
  });

  ctx.restore();

  if (done && !hasRedirected) {
    hasRedirected = true;
    setTimeout(() => window.location.href = REDIRECT_URL, 2000);
  }
}

anim();

// Khi resize màn hình → tính lại vị trí chữ (vẫn giữ BIRTHDAY chính giữa)
window.addEventListener('resize', () => {
  w = c.width = window.innerWidth;
  h = c.height = window.innerHeight;
  hw = w / 2;
  hh = h / 2;
  ctx.font = `${opts.charSize}px Verdana, sans-serif`;
  createLetters();
});
