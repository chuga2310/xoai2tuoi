/* ================= CẤU HÌNH — chỉ cần sửa ở đây ================= */
const CONFIG = {
  tuoi: 2,
  // Thời gian bữa tiệc theo giờ Việt Nam, dạng 'YYYY-MM-DD HH:mm' (VD '2026-11-15 17:30').
  // Để '' khi chưa chốt — trang sẽ hiện "Sắp có".
  thoiGian: '',
  diaChi: 'S202.2508 Vinhomes Smart City, Tây Mỗ, Hà Nội',
};

/* ================= Gửi xác nhận tham dự =================
   Hiện chỉ lưu trên máy khách. Khi có backend, thay thân hàm bằng fetch() tới API
   (ném lỗi nếu thất bại để form báo cho khách). */
const RSVP_KEY = 'xoai-rsvp';
async function sendRsvp(data) {
  localStorage.setItem(RSVP_KEY, JSON.stringify(data));
}
function loadRsvp() {
  try { return JSON.parse(localStorage.getItem(RSVP_KEY) || 'null'); } catch { return null; }
}

/* ================= Không cần sửa phần dưới ================= */
const $ = (id) => document.getElementById(id);
const pad = (n) => String(n).padStart(2, '0');
const WD = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

document.querySelectorAll('[data-tuoi]').forEach((el) => { el.textContent = CONFIG.tuoi; });

/* Cuộn từng trang */
const scroller = $('scroller');
const pages = [...document.querySelectorAll('.page')];
const dots = [...document.querySelectorAll('.nav button')];
let current = 0;
function goTo(i) {
  const p = pages[Math.max(0, Math.min(pages.length - 1, i))];
  scroller.scrollTo({ top: p.offsetTop, behavior: 'smooth' });
}
scroller.addEventListener('scroll', () => {
  const mid = scroller.scrollTop + scroller.clientHeight * 0.5;
  let idx = 0;
  pages.forEach((p, i) => { if (p.offsetTop <= mid) idx = i; });
  if (idx !== current) {
    current = idx;
    dots.forEach((d, i) => d.setAttribute('aria-current', String(i === idx)));
  }
}, { passive: true });
dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));
document.querySelectorAll('[data-next]').forEach((b) => b.addEventListener('click', () => goTo(current + 1)));
window.addEventListener('keydown', (e) => {
  const t = e.target.tagName;
  if (t === 'INPUT' || t === 'TEXTAREA') return;
  if (e.key === ' ' && t === 'BUTTON') return;
  if (['ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); goTo(current + 1); }
  if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); goTo(current - 1); }
});

/* Album */
const strip = $('strip');
document.querySelectorAll('[data-strip]').forEach((b) => b.addEventListener('click', () => {
  strip.scrollBy({ left: Number(b.dataset.strip) * Math.max(260, strip.clientWidth * 0.6), behavior: 'smooth' });
}));

/* Thời gian + đếm ngược */
(function setupTime() {
  const m = String(CONFIG.thoiGian || '').trim().match(/(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2})[:h](\d{2}))?/);
  if (!m) return;
  const [y, mo, d, hh = 0, mi = 0] = [m[1], m[2], m[3], m[4], m[5]].map((v) => (v === undefined ? undefined : +v));
  const hasTime = m[4] !== undefined;
  const at = new Date(`${y}-${pad(mo)}-${pad(d)}T${pad(hh)}:${pad(mi)}:00+07:00`);
  $('date-big').textContent = `${pad(d)}/${pad(mo)}`;
  $('date-sub').textContent = `${WD[new Date(Date.UTC(y, mo - 1, d)).getUTCDay()]}, năm ${y}`;
  if (hasTime) { $('time-big').textContent = `${hh}h${pad(mi)}`; $('time-sub').textContent = 'Nhớ đến đúng giờ nha!'; }

  const f = (dt) => `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}00`;
  const startVN = new Date(Date.UTC(y, mo - 1, d, hh, mi));
  const endVN = new Date(startVN.getTime() + 3 * 36e5);
  $('cal').href = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
    + '&text=' + encodeURIComponent(`Sinh nhật ${CONFIG.tuoi} tuổi bé Xoài`)
    + '&dates=' + f(startVN) + '/' + f(endVN) + '&ctz=Asia/Ho_Chi_Minh'
    + '&location=' + encodeURIComponent(CONFIG.diaChi);

  $('soon').hidden = true;
  $('countdown-row').hidden = false;
  const tick = () => {
    const diff = Math.max(0, at.getTime() - Date.now());
    $('cd-d').textContent = Math.floor(diff / 864e5);
    $('cd-h').textContent = pad(Math.floor(diff / 36e5) % 24);
    $('cd-m').textContent = pad(Math.floor(diff / 6e4) % 60);
    $('cd-s').textContent = pad(Math.floor(diff / 1e3) % 60);
  };
  tick();
  setInterval(tick, 1000);
})();

/* Xác nhận tham dự */
const form = $('rsvp-form');
const thanks = $('thanks');
const counts = { adults: 1, kids: 0 };
const renderCounts = () => { $('out-adults').textContent = counts.adults; $('out-kids').textContent = counts.kids; };
document.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => {
  const k = b.dataset.key;
  counts[k] = Math.max(0, Math.min(20, counts[k] + Number(b.dataset.step)));
  renderCounts();
}));
function showError(msg) { const e = $('f-err'); e.textContent = msg; e.hidden = !msg; }
$('f-name').addEventListener('input', () => showError(''));

function showThanks(s) {
  $('thanks-title').textContent = s.going ? `Yay! Hẹn gặp ${s.name} nhé!` : `Tiếc quá, ${s.name} ơi!`;
  $('thanks-sub').textContent = s.going
    ? `Xoài đã ghi nhớ: ${s.adults} người lớn${s.kids ? ` và ${s.kids} bé` : ''}. Con sẽ để dành phần bánh cho mọi người!`
    : 'Cảm ơn bạn đã báo — Xoài sẽ thổi nến thật to để gửi niềm vui tới bạn nha.';
  form.hidden = true;
  thanks.hidden = false;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const going = !(e.submitter && e.submitter.value === 'no');
  const name = $('f-name').value.trim();
  if (!name) { showError('Bạn cho Xoài biết tên với nha!'); $('f-name').focus(); return; }
  const data = { going, name, adults: counts.adults, kids: counts.kids, wish: $('f-wish').value.trim(), at: new Date().toISOString() };
  const btns = form.querySelectorAll('button[type="submit"]');
  btns.forEach((b) => { b.disabled = true; });
  try {
    await sendRsvp(data);
    showThanks(data);
  } catch (err) {
    showError('Ôi, chưa gửi được. Bạn thử lại giúp Xoài nha!');
  } finally {
    btns.forEach((b) => { b.disabled = false; });
  }
});

$('edit-rsvp').addEventListener('click', () => { thanks.hidden = true; form.hidden = false; });

const saved = loadRsvp();
if (saved) {
  $('f-name').value = saved.name || '';
  $('f-wish').value = saved.wish || '';
  counts.adults = saved.adults ?? 1;
  counts.kids = saved.kids ?? 0;
  renderCounts();
  showThanks(saved);
}
