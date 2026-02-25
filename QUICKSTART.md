# 🚀 Bắt Đầu Nhanh - Album Gia Đình

Hướng dẫn cơ bản để chạy ứng dụng trong 15 phút!

## 🎯 3 Bước Chính

### 1. Cấu Hình Firebase (5 phút)
- [ ] Tạo Firebase Project: https://firebase.google.com → "Go to console"
- [ ] Click "Add project" → Đặt tên `family-album`
- [ ] Làm theo hướng dẫn tạo Web App
- [ ] **Copy Firebase Config**
- [ ] Dán vào file `public/firebase-config.js`
- [ ] Bật "Authentication" (Email/Password)
- [ ] Tạo "Firestore Database" (asia-southeast1)
- [ ] Tạo "Storage" (asia-southeast1)

👉 **Chi tiết đầy đủ xem tại: [SETUP.md](SETUP.md)**

### 2. Chạy Local (3 phút)
```bash
cd Album
npm install
npm start
```
Mở `http://localhost:8000` ✅

### 3. Deploy GitHub Pages (5 phút)
```bash
git init
git remote add origin https://github.com/YOUR_USERNAME/Album.git
git branch -M main
git add .
git commit -m "Initial commit"
git push -u origin main
```

Ở Settings → Pages, chọn "Deploy from a branch" (main)
Sau 1-2 phút: `https://YOUR_USERNAME.github.io/Album/` ✅

---

## ✨ Tính Năng Sẵn Có

✅ Full Authentication (đăng ký/đăng nhập)  
✅ Tạo & quản lý Albums  
✅ Upload ảnh/video kéo-thả (Drag & Drop)  
✅ Xem & xoá files  
✅ Responsive design (mobile-friendly)  

---

## 📝 Firebase Config Template

Lấy từ Firebase Console → Project Settings → Your apps:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "1:YOUR_APP_ID:web:YOUR_WEB_ID"
};
```

**Dán toàn bộ vào `public/firebase-config.js`**

---

## 🆘 Vấn Đề Thường Gặp

| 🔴 Vấn Đề | ✅ Giải Pháp |
|-----------|------------|
| Lỗi "firebase not defined" | Kiểm tra firebase-config.js có config không |
| Upload bị từ chối | Kiểm tra Firestore Rules & Storage Rules |
| Trang trắng | F12 → Console xem có error không |
| Localhost không mở | Chạy `npm install` trước `npm start` |

---

## 📂 Cấu Trúc Files

```
Album/
├── public/
│   ├── index.html              ← Trang chính
│   ├── style.css               ← CSS (đẹp đó)
│   ├── script.js               ← Logic ứng dụng
│   └── firebase-config.js      ← ⚠️ CẦN THA ĐỔI NÀY
├── .github/
│   └── workflows/
│       └── deploy.yml          ← Auto deploy
├── .gitignore                  ← Git config
├── package.json                ← Dependencies
├── README.md                   ← Docs
├── SETUP.md                    ← Hướng dẫn Firebase chi tiết
└── QUICKSTART.md               ← File này
```

---

## 🎓 Tiếp Theo (Nâng Cao)

Sau khi ứng dụng chạy được:

1. **Chia sẻ với gia đình**
   - Share link GitHub Pages
   - Mọi người đăng ký & dùng bình thường

2. **Nâng cấp tính năng**
   - Thêm chia sẻ albums (permissions)
   - Comments trên ảnh
   - Search & filter

3. **Bảo mật**
   - Áp dụng Firestore Rules
   - Giới hạn storage quota

---

## 💬 Support

- Lỗi Firebase? → Xem [SETUP.md](SETUP.md)
- Lỗi code? → F12 → Console (browser)
- Lỗi GitHub? → Settings → Pages

---

**Chúc bạn thành công! 🎉📸**

Hãy bắt đầu: [SETUP.md](SETUP.md)
