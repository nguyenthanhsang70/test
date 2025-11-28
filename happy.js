const c = document.getElementById('c');
const ctx = c.getContext('2d');
let w = c.width = window.innerWidth;
let h = c.height = window.innerHeight;
let hw = w / 2;
let hh = h / 2;

// ==================== CẤU HÌNH ====================
const opts = {
  strings: ['HAPPY', 'BIRTHDAY', 'TO YOU!'], // Thay nội dung ở đây
  charSize: 34,
  charSpacing: 38,
  lineHeight: 56,
  fireworkPrevPoints: 10,
  fireworkBaseLineWidth: 5,
  fireworkAddedLineWidth: 8,
  fireworkSpawnTime: 200,
  fireworkBaseReachTime: 30,
  fireworkAddedReachTime: 30,
  fireworkCircleBaseSize: 20,
  fireworkCircleAddedSize: 10,
  fireworkBaseShards: 6,
  fireworkAddedShards: 6,
  gravity: 0.1,
  upFlow: -0.1,
  letterContemplatingWaitTime: 400,
  balloonBaseSize: 40,
  balloonBaseVel: 0.5,
  balloonAddedVel: 0.6,
  balloonBaseRadian: -(Math.PI / 2 - 0.5),
  balloonAddedRadian: 1.2,
};

// LINK CHUYỂN ĐẾN SAU KHI XONG (QUAN TRỌNG!!!)
const NEXT_PAGE_URL = "index.html"; // ĐÃ SỬA: có dấu ngoặc kép đầy đủ
// Thay link này thành: tin nhắn FB, Zalo, YouTube, ảnh quà, video…

const Tau = Math.PI * 2;
const letters = [];
let doneCount = 0;
let redirected = false;

ctx.font = `${opts.charSize}px Verdana, sans-serif`;

// Tính chiều rộng thực tế từng dòng để căn giữa chính xác
const lineWidths = opts.strings.map(line => {
  let width = 0;
  for (const ch of line) width += ctx.measureText(ch).width;
  width += (line.length - 1) * (opts.charSpacing - ctx.measureText(' ').width || 10);
  return width;
});

// ==================== LỚP CHỮ ====================
class Letter {
  constructor(char, x, y) {
    this.char = char;
    this.x = x;
    this.y = y;
    this.dx = -ctx.measureText(char).width / 2;
    this.dy = opts.charSize / 2;
    this.fireworkDy = this.y - hh;
    const hue = ((x / w + 0.5) % 1) * 360;
    this.hue = hue;
    this.color = `hsl(${hue},85%,55%)`;
    this.light = l => `hsl(${hue},85%,${l}%)`;
    this.alpha = a => `hsla(${hue},85%,55%,${a})`;
    this.lightAlpha = (l, a) => `hsla(${hue},85%,${l}%,${a})`;
    this.reset();
  }

  reset() {
    this.phase = 'firework'; // firework → contemplate → balloon → done
    this.tick = 0;
    this.spawned = false;
    this.spawningTime = opts.fireworkSpawnTime * Math.random() | 0;
    this.reachTime = opts.fireworkBaseReachTime + opts.fireworkAddedReachTime * Math.random() | 0;
    this.lineWidth = opts.fireworkBaseLineWidth + opts.fireworkAddedLineWidth * Math.random();
    this.prevPoints = [[0, hh]];
    this.shards = [];
  }

  step() {
    // Pháo hoa bay lên
    if (this.phase === 'firework') {
      if (!this.spawned) {
        if (++this.tick >= this.spawningTime) this.spawned = true;
        return;
      }
      ++this.tick;
      const t = this.tick / this.reachTime;
      const x = this.x * t;
      const y = hh + this.fireworkDy * Math.sin(t * Math.PI / 2);

      this.prevPoints.push([x, y]);
      if (this.prevPoints.length > opts.fireworkPrevPoints) this.prevPoints.shift();

      for (let i = 1; i < this.prevPoints.length; i++) {
        const [x1, y1] = this.prevPoints[i];
        const [x2, y2] = this.prevPoints[i - 1];
        ctx.strokeStyle = this.alpha(i / this.prevPoints.length);
        ctx.lineWidth = this.lineWidth * (i / this.prevPoints.length);
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      }

      if (t >= 1) {
        this.phase = 'contemplate';
        this.tick = 0;
        this.circleSize = opts.fireworkCircleBaseSize + opts.fireworkCircleAddedSize * Math.random();

        // Tạo mảnh nổ
        const cnt = opts.fireworkBaseShards + opts.fireworkAddedShards * Math.random() | 0;
        for (let i = 0; i < cnt; i++) {
          const angle = Tau * i / cnt + (Math.random() - 0.5) * 0.5;
          const vel = 3 + Math.random() * 3;
          this.shards.push({
            x: this.x, y: this.y,
            vx: Math.cos(angle) * vel,
            vy: Math.sin(angle) * vel,
            life: 1
          });
        }
      }
      return;
    }

    // Hiện chữ + nổ + mảnh rơi
    if (this.phase === 'contemplate') {
      ++this.tick;

      // Vòng tròn nổ
      if (this.tick < 40) {
        const p = this.tick / 40;
        ctx.fillStyle = this.lightAlpha(70, p);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.circleSize * p, 0, Tau);
        ctx.fill();
      }

      // Vẽ chữ
      ctx.fillStyle = this.light(75);
      ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

      // Mảnh pháo hoa rơi
      this.shards = this.shards.filter(s => {
        s.x += s.vx;
        s.y += (s.vy += opts.gravity);
        s.life -= 0.015;
        if (s.life > 0) {
          ctx.fillStyle = this.alpha(s.life);
          ctx.fillRect(s.x - 2, s.y - 2, 4, 4);
          return true;
        }
        return false;
      });

      if (this.tick > opts.letterContemplatingWaitTime) {
        this.phase = 'balloon';
        this.tick = 0;
        const rad = opts.balloonBaseRadian + opts.balloonAddedRadian * Math.random();
        const vel = opts.balloonBaseVel + opts.balloonAddedVel * Math.random();
        this.vx = Math.cos(rad) * vel;
        this.vy = Math.sin(rad) * vel;
        this.bx = this.x;
        this.by = this.y;
      }
      return;
    }

    // Bóng bay bay lên
    if (this.phase === 'balloon') {
      this.bx += this.vx;
      this.by += (this.vy += opts.upFlow);

      // Vẽ bóng
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.bx, this.by, opts.balloonBaseSize, 0, Tau);
      ctx.fill();

      // Dây bóng
      ctx.strokeStyle = this.light(30);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.bx, this.by + opts.balloonBaseSize);
      ctx.lineTo(this.bx, this.by + opts.balloonBaseSize + 30);
      ctx.stroke();

      // Chữ trên bóng
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.char, this.bx, this.by);

      // Bay khỏi màn hình → xong
      if (this.by < -h - 100) {
        this.phase = 'done';
        doneCount++;
      }
    }
  }
}

// ==================== TẠO CHỮ (căn giữa chuẩn) ====================
opts.strings.forEach((line, i) => {
  const lineWidth = lineWidths[i];
  let currentX = -lineWidth / 2;

  [...line].forEach(char => {
    const charWidth = ctx.measureText(char).width;
    const x = currentX + charWidth / 2;
    const y = i * opts.lineHeight - (opts.strings.length - 1) * opts.lineHeight / 2;
    letters.push(new Letter(char, x, y));
    currentX += charWidth + (opts.charSpacing - ctx.measureText(' ').width || 10);
  });
});

// ==================== VÒNG LẶP CHÍNH ====================
function anim() {
  requestAnimationFrame(anim);
  ctx.fillStyle = '#0a0a1f';
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.translate(hw, hh);
  letters.forEach(l => l.step());
  ctx.restore();

  // Khi tất cả bóng bay hết → chuyển trang
  if (doneCount >= letters.length && !redirected) {
    redirected = true;
    setTimeout(() => {
      window.location.href = NEXT_PAGE_URL;
    }, 1500); // Đợi 1.5 giây cho đẹp
  }
}
anim();

// Resize màn hình
window.addEventListener('resize', () => {
  w = c.width = window.innerWidth;
  h = c.height = window.innerHeight;
  hw = w / 2;
  hh = h / 2;
});
