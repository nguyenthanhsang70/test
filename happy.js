<script>
// happy.js – ĐÃ SỬA LỖI MÀN HÌNH ĐEN TRÊN PC
const c = document.getElementById('c');
const ctx = c.getContext('2d');

let w, h, hw, hh;

// Hàm resize chuẩn nhất
function resizeCanvas() {
  w = c.width = window.innerWidth;
  h = c.height = window.innerHeight;
  hw = w / 2;
  hh = h / 2;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', resizeCanvas);
// Dự phòng cho Chrome/Firefox bị trễ
setTimeout(resizeCanvas, 50);
setTimeout(resizeCanvas, 300);

const opts = {
  strings: ['HAPPY', 'BIRTHDAY', 'TO YOU!'],
  charSize: 30,
  charSpacing: 35,
  lineHeight: 50,
  // ... các options còn lại giữ nguyên 100%
  // (không cần paste lại hết, bạn chỉ cần thay phần trên)
};

// ĐỔI LINK CHUYỂN TRANG Ở ĐÂY
const NEXT_PAGE_URL = "index.html";   // ← trang bạn muốn chuyển tới

// ... toàn bộ code còn lại của bạn giữ nguyên 100%
// (class Letter, Shard, balloonPath, anim loop, redirect, v.v.)
</script>
