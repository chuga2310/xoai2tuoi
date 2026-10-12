# Xoài tròn 2 tuổi

Website thư mời sinh nhật bé Xoài (Tường San) — https://xoai.technet.software

Static HTML, không cần build. Mọi thứ được publish nằm trong `site/`.

## Push lần đầu

```bash
cd deploy
git init -b main
git add .
git commit -m "Website sinh nhật Xoài"
git remote add origin git@github.com:chuga2310/xoai2tuoi.git
git push -u origin main
```

## Bật GitHub Pages + subdomain

1. **Settings → General → Danger Zone → Change visibility → Private** (cần GitHub Pro).
2. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
3. **Settings → Pages → Custom domain:** `xoai.technet.software` → Save. Khi chứng chỉ xong, tick **Enforce HTTPS**.
4. Ở nhà đăng ký tên miền, thêm bản ghi DNS:

   | Type | Host | Value |
   |---|---|---|
   | CNAME | `xoai` | `chuga2310.github.io` |

> Lưu ý: repo Private nhưng trang Pages vẫn công khai trên web (ai có link đều xem được).

## Sửa nội dung

- **Thời gian tiệc:** `site/app.js` → `CONFIG.thoiGian`, dạng `'2026-11-15 17:30'` (giờ Việt Nam). Khi có giờ, trang tự hiện đồng hồ đếm ngược + nút "Thêm vào lịch".
- **Ảnh album:** `site/index.html`, khối `<div class="strip">`.

## Backend cho form xác nhận

Hiện form chỉ lưu trên máy khách (`localStorage`). Khi có API, thay thân hàm `sendRsvp(data)` trong `site/app.js`:

```js
async function sendRsvp(data) {
  const res = await fetch('https://api.example.com/rsvp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('RSVP failed');
}
```

`data` = `{ going, name, adults, kids, wish, at }`.
