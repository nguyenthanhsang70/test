const c = document.getElementById('c');
const ctx = c.getContext('2d');
let w = c.width = window.innerWidth;
let h = c.height = window.innerHeight;
let hw = w / 2;
let hh = h / 2;
// ==================== CẤU HÌNH ====================
const opts = {
  strings: ['HAPPY', 'BIRTHDAY', 'TO YOU!'], // ← Thay tên người nhận ở đây
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
  gravity: 0.1,
  upFlow: -0.1,
  letterContemplatingWaitTime: 400,
  balloonBaseSize: 40, // kích thước bóng bay
  balloonBaseVel: 0.5,
  balloonAddedVel: 0.6,
  balloonBaseRadian: -(Math.PI / 2 - 0.5),
  balloonAddedRadian: 1.2,
};
// LINK CHUYỂN ĐẾN SAU KHI BÓNG BAY HẾT (QUAN TRỌNG!!!)
const NEXT_PAGE_URL = "index.html
// Thay link này thành: tin nhắn FB, Zalo, YouTube, ảnh quà, video… gì cũng được
const calc = {
  totalWidth: opts.charSpacing * Math.max(...opts.strings.map(s => s.length))
};
const Tau = Math.PI * 2;
const letters = [];
let doneCount = 0;
let redirected = false;
ctx.font = ${opts.charSize}px Verdana, sans-serif;
// ==================== LỚP CHỮ =================
class Letter {
  constructor(char, x, y) {
    this.char = char;
    this.x = x;
    this.y = y;
    this.dx = -ctx.measureText(char).width / 2;
    this.dy = opts.charSize / 2;
    this.fireworkDy = this.y - hh;
    const hue = ((x / calc.totalWidth + 0.5) % 1) * 360;
    this.hue = hue;
    this.color = hsl(${hue},85%,55%);
    this.light = (l) => hsl(${hue},85%,${l}%);
    this.alpha = (a) => hsla(${hue},85%,55%,${a});
    this.lightAlpha = (l, a) => hsla(${hue},85%,${l}%,${a});
    this.reset();
  }
  reset() {
    this.phase = 'firework'; // firework → contemplate → balloon → done
    this.tick = 0;
    this.tick2 = 0;
    this.spawned = false;
    this.spawningTime = opts.fireworkSpawnTime * Math.random() | 0;
    this.reachTime = opts.fireworkBaseReachTime + opts.fireworkAddedReachTime * Math.random() | 0;
    this.lineWidth = opts.fireworkBaseLineWidth + opts.fireworkAddedLineWidth * Math.random();
    this.prevPoints = [[0, hh, 0]];
    this.shards = [];
  }
  step() {
    // ---------- PHÁO HOA BAY LÊN ----------
    if (this.phase === 'firework') {
      if (!this.spawned) {
        if (++this.tick >= this.spawningTime) {
          this.spawned = true;
          this.tick = 0;
        }
        return;
      }
      ++this.tick;
      const t = this.tick / this.reachTime;
      const x = t * this.x;
      const y = hh + Math.sin(t * Math.PI / 2) * this.fireworkDy;
      if (this.prevPoints.length > opts.fireworkPrevPoints) this.prevPoints.shift();
      this.prevPoints.push([x, y, t * this.lineWidth]);
      for (let i = 1; i < this.prevPoints.length; i++) {
        const p1 = this.prevPoints[i];
        const p2 = this.prevPoints[i - 1];
        ctx.strokeStyle = this.alpha(i / this.prevPoints.length);
        ctx.lineWidth = p1[2] * (i / (this.prevPoints.length - 1));
        ctx.beginPath();
        ctx.moveTo(p2[0], p2[1]);
        ctx.lineTo(p1[0], p1[1]);
        ctx.stroke();
      }
      if (t >= 1) {
        this.phase = 'contemplate';
        this.tick = 0;
        this.tick2 = 0;
        this.circleFinalSize = opts.fireworkCircleBaseSize + opts.fireworkCircleAddedSize * Math.random();
        // tạo mảnh nổ
        const cnt = opts.fireworkBaseShards + opts.fireworkAddedShards * Math.random() | 0;
        const angleStep = Tau / cnt;
        let angle = 0;
        for (let i = 0; i < cnt; i++) {
          const speed = opts.fireworkShardBaseVel + opts.fireworkShardAddedVel * Math.random();
          this.shards.push({
            x: this.x,
            y: this.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1
          });
          angle += angleStep;
        }
      }
      return;
    }
    // ---------- NỔ + HIỆN CHỮ ----------
    if (this.phase === 'contemplate') {
      ++this.tick;
      // vòng tròn nổ
      if (this.tick < 40) {
        const p = this.tick / 40;
        const size = p * this.circleFinalSize;
        ctx.fillStyle = this.lightAlpha(70, p);
        ctx.beginPath();
        ctx.arc(this.x, this.y, size, 0, Tau);
        ctx.fill();
      }
      // hiện chữ
      ctx.fillStyle = this.light(75);
      ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
      // mảnh pháo hoa rơi
      this.shards = this.shards.filter(s => {
        s.x += s.vx;
        s.y += s.vy += opts.gravity;
        s.life -= 0.02;
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
        // khởi tạo vận tốc bay lên
        const rad = opts.balloonBaseRadian + opts.balloonAddedRadian * Math.random();
        const vel = opts.balloonBaseVel + opts.balloonAddedVel * Math.random();
        this.vx = Math.cos(rad) * vel;
        this.vy = Math.sin(rad) * vel;
        this.bx = this.x;
        this.by = this.y;
      }
      return;
    }
    // ---------- BÓNG BAY BAY LÊN ----------
    if (this.phase === 'balloon') {
      this.bx += this.vx;
      this.by += this.vy += opts.upFlow;
      // vẽ bóng bay
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.bx, this.by, opts.balloonBaseSize, 0, Tau);
      ctx.fill();
      // dây bóng
      ctx.strokeStyle = this.light(30);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.bx, this.by + opts.balloonBaseSize);
      ctx.lineTo(this.bx, this.by + opts.balloonBaseSize + 30);
      ctx.stroke();
      // chữ trên bóng
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.char, this.bx, this.by);
      // bay khỏi màn hình → tính là xong
      if (this.by < -hh -hh - 100) {
        this.phase = 'done';
        doneCount++; // TĂNG BIẾN ĐẾM
      }
    }
  }
}
// ==================== TẠO CHỮ ====================
opts.strings.forEach((line, i) => {
  [...line].forEach((char, j) => {
    const x = j * opts.charSpacing + opts.charSpacing / 2 - (line.length * opts.charSize) / 2;
    const y = i * opts.lineHeight + opts.lineHeight / 2 - (opts.strings.length - 1) * opts.lineHeight / 2;
    letters.push(new Letter(char, x, y));
  });
});
// ==================== VÒNG LẶP CHÍNH ====================
function anim() {
  requestAnimationFrame(anim);
  ctx.fillStyle = '#0a0a1f';
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.translate(hw, hh);
  letters.forEach(letter => letter.step());
  ctx.restore();
  // KHI TẤT CẢ BÓNG ĐÃ BAY HẾT → CHUYỂN TRANG
  if (doneCount >= letters.length && !redirected) {
    redirected = true;
    setTimeout(() => {
      window.location.href = NEXT_PAGE_URL;
    }, 1500); // đợi 1.5 giây cho đẹp mắt
  }
}
anim();
// ==================== KHI THAY ĐỔI KÍCH THƯỚC ====================
window.addEventListener('resize', () => {
  w = c.width = window.innerWidth;
  h = c.height = window.innerHeight;
  hw = w / 2;
  hh = h / 2;
});
