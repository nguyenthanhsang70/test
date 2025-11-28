const c = document.getElementById('c');
const ctx = c.getContext('2d');
let w = c.width = window.innerWidth;
let h = c.height = window.innerHeight;
let hw = w / 2;
let hh = h / 2;
const opts = {
  strings: ['HAPPY', 'BIRTHDAY', 'TO YOU!'], // Thay tên người nhận ở đây
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
// ĐỔI LINK NÀY THÀNH TRANG BẠN MUỐN CHUYỂN TỚI
const NEXT_PAGE_URL = "index.html";
// Ví dụ:
// "https://www.youtube.com/watch?v=abc123"
// "https://drive.google.com/file/d/abc123/view"
// "https://zalo.me/0123456789"
// "trang-chuc-mung-cua-ban.html"
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
    this.shards = null;
    doneCount = Math.max(0, doneCount - 1); // nếu reset thì giảm đếm
  }
  step() {
    // ... (giữ nguyên toàn bộ code step() như cũ của bạn)
    // CHỈ THAY ĐỔI PHẦN CUỐI: khi chuyển sang 'done'
    if (this.phase === 'balloon' && !this.inflating && !this.spawning) {
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
        // TĂNG BIẾN ĐẾM KHI 1 CHỮ BAY XONG
        doneCount++;
      }
    }
    // ... (giữ nguyên phần còn lại của step)
  }
}
// (Giữ nguyên class Shard và balloonPath như cũ)
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
// Animation loop – THÊM ĐIỀU KIỆN CHUYỂN TRANG
function anim() {
  requestAnimationFrame(anim);
  ctx.fillStyle = '#111119';
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.translate(hw, hh);
  letters.forEach(l => l.step());
  ctx.restore();
  // KHI TẤT CẢ CÁC CHỮ ĐÃ BAY HẾT
  if (doneCount >= letters.length && !redirectTriggered) {
    redirectTriggered = true;
    // Đợi thêm 1 giây cho đẹp rồi mới chuyển
    setTimeout(() => {
      window.location.href = NEXT_PAGE_URL;
    }, 1000);
  }
}
anim();
window.addEventListener('resize', () => {
  w = c.width = window.innerWidth;
  h = c.height = window.innerHeight;
  hw = w / 2;
  hh = h / 2;
});
