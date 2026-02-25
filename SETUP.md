# 🔧 Hướng Dẫn Cấu Hình Firebase Chi Tiết

Hướng dẫn này sẽ giúp bạn cấu hình Firebase từ A-Z.

## 📝 Danh Sách Công Việc

- [ ] Tạo Firebase Project
- [ ] Lấy Firebase Config
- [ ] Cấu Hình Authentication (Email/Password)
- [ ] Tạo Firestore Database
- [ ] Cấu Hình Firebase Storage
- [ ] Cập nhật firebase-config.js
- [ ] Cấu Hình GitHub Pages
- [ ] Deploy lần đầu

---

## 1️⃣ Tạo Firebase Project

### Bước 1.1: Truy cập Firebase Console
- Mở https://firebase.google.com
- Click nút **"Go to console"** (phía bên phải)
- Nếu cần, đăng nhập bằng Google Account

### Bước 1.2: Tạo Project Mới
- Click **"+ Add project"** (nếu có sẵn project, click "Create project")
- Đặt tên project: `family-album` hoặc tên bạn muốn
- Chọn/Nhập location: **Vietnam** hoặc gần nhất
- Click **"Create project"**
- Chờ 1-2 phút cho project được tạo

---

## 2️⃣ Lấy Firebase Config

### Bước 2.1: Thêm Web App
- Ở trang Console, tìm tab **"Project Overview"** (góc trái)
- Click biểu tượng **web** `</>`
- Đặt tên app: `family-album`
- ✅ Tick "Also set up Firebase Hosting"
- Click **"Register app"**

### Bước 2.2: Copy Firebase Config
Sau khi register, bạn sẽ thấy đoạn code tương tự:

```javascript
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC_xxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "family-album-xxxxx.firebaseapp.com",
  projectId: "family-album-xxxxx",
  storageBucket: "family-album-xxxxx.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdefg123456"
};
```

📋 **Copy toàn bộ config này** (giữ lại cho bước tiếp theo)

---

## 3️⃣ Cấu Hình Authentication (Đăng Nhập)

### Bước 3.1: Vào Authentication
- Click menu **"Authentication"** (bên trái)
- Click **"Get started"**

### Bước 3.2: Kích Hoạt Email/Password
- Tìm provider **"Email/Password"**
- Click vào, rồi toggle **"Enable"**
- Không cần phone number, giữ mặc định
- Click **"Save"**

✅ Xong! Người dùng có thể dùng email/password để đăng nhập

---

## 4️⃣ Tạo Firestore Database

### Bước 4.1: Vào Firestore
- Click menu **"Firestore Database"** (bên trái)
- Click **"Create database"**

### Bước 4.2: Cấu Hình
- **Mode**: Chọn **"Start in test mode"**
  (Sau này bạn có thể cấu hình security rules)
- **Location**: Chọn **asia-southeast1 (Singapore)**
  (Gần Việt Nam, tốc độ nhanh)
- Click **"Create"**
- Chờ 1-2 phút

✅ Database sẵn sàng! Bạn có thể thấy collections: `albums`, `files`

---

## 5️⃣ Cấu Hình Firebase Storage

### Bước 5.1: Vào Storage
- Click menu **"Storage"** (bên trái)
- Click **"Get started"**

### Bước 5.2: Cấu Hình
- Click **"Next"**
- **Location**: Chọn tương tự Firestore: **asia-southeast1**
- Click **"Done"**

✅ Storage sẵn sàng lưu ảnh/video!

---

## 5️⃣.5️⃣ Tạo Admin Account (Rất Quan Trọng!)

### Bước 5.5.1: Vào Users
- Ở Firebase Console
- Click **"Authentication"** (menu bên trái)
- Click tab **"Users"**

### Bước 5.5.2: Tạo Admin User
- Click nút **"Add user"** hoặc **"Create user"**
- **Email**: `van@admin.com`
- **Password**: `van1508`
- Click **"Create user"**

✅ Admin account đã tạo!

Admin account này sẽ có quyền:
- ✅ Tạo tài khoản mới cho gia đình
- ✅ Thấy tab "Đăng Ký" ở login
- ✅ Admin khác không được phép tạo account

👉 **Xem chi tiết: [ADMIN_SETUP.md](../ADMIN_SETUP.md)**

---

## 6️⃣ Cập Nhật firebase-config.js

### Bước 6.1: Mở File
- Mở VS Code
- Tìm file: `public/firebase-config.js`

### Bước 6.2: Thay Thế Config
Xóa phần `firebaseConfig = {...}` cũ, dán config bạn copy từ bước 2.2:

```javascript
// ============================================
// FIREBASE CONFIG - THAY ĐỔI VỚI THÔNG TIN CỦA BẠN
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyC_xxxxxxxxxxxxxxxxxxxxxxxx",  // ← Thay thế
  authDomain: "family-album-xxxxx.firebaseapp.com",  // ← Thay thế
  projectId: "family-album-xxxxx",  // ← Thay thế
  storageBucket: "family-album-xxxxx.appspot.com",  // ← Thay thế
  messagingSenderId: "1234567890",  // ← Thay thế
  appId: "1:1234567890:web:abcdefg123456"  // ← Thay thế
};

firebase.initializeApp(firebaseConfig);
```

### Bước 6.3: Save File
- Ctrl+S hoặc File → Save

---

## 7️⃣ Cấu Hình GitHub Pages

### Bước 7.1: Tạo GitHub Repository
- Truy cập https://github.com/new
- **Repository name**: `Album` (không gạch dưới, không space)
- **Description**: "Family Album - Firebase Storage"
- Chọn **"Public"**
- ✅ Thêm ".gitignore" template: "Node"
- Click **"Create repository"**

### Bước 7.2: Push Code Lên GitHub
Ở Terminal/PowerShell (trong folder Album):

```bash
# Nếu chưa có git repository
git init

# Thêm remote
git remote add origin https://github.com/YOUR_USERNAME/Album.git

# Đặt branch chính
git branch -M main

# Add tất cả files
git add .

# Commit
git commit -m "Initial commit: Family Album with Firebase"

# Push lên GitHub
git push -u origin main
```

(Nhập GitHub username + token/password nếu được hỏi)

### Bước 7.3: Cấu Hình GitHub Pages
- Ở Repository, click **"Settings"** (phía trên)
- Chọn **"Pages"** (menu bên trái)
- **Source**: Chọn **"Deploy from a branch"**
- **Branch**: `main`
- **Folder**: `/ (root)`
- Click **"Save"**

⏳ Chờ 1-2 phút

### Bước 7.4: Kiểm Tra Deploy
- Ở Settings → Pages, bạn sẽ thấy:
  ```
  Your site is published at https://YOUR_USERNAME.github.io/Album/
  ```
- Click link đó hoặc vào browser trực tiếp

✅ Ứng dụng đã live online!

---

## 8️⃣ Cập Nhật package.json (Tuỳ Chọn)

Nếu muốn `npm run deploy` tự động deploy:

```json
{
  ...
  "homepage": "https://YOUR_USERNAME.github.io/Album",
  ...
}
```

Thay `YOUR_USERNAME` bằng GitHub username thực của bạn.

---

## 🧪 Kiểm Tra Hoạt Động

### Chạy Local Test
```bash
# Cài npm packages
npm install

# Chạy server
npm start
```

Mở `http://localhost:8000` - bạn sẽ thấy:
- ✅ Trang đăng ký/đăng nhập
- ✅ Có thể upload ảnh/video
- ✅ Có thể tạo albums

### Test Trên GitHub Pages
- Truy cập link GitHub Pages
- Kiểm tra các tính năng tương tự

---

## 🔐 Bảo Mật (Tuỳ Chọn Nâng Cao)

Nếu muốn tăng cường bảo mật, cập nhật Firestore Rules:

Ở Firestore Console → "Rules":

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /albums/{albumId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
    
    match /files/{fileId} {
      allow read, write: if request.auth.uid == resource.data.uploadedById;
      allow create: if request.auth != null;
    }
  }
}
```

Click **"Publish"**

---

## ❓ FAQ

**Q: Tôi quên Firebase Config thì sao?**
A: Quay lại Project Settings (⚙️) → Your apps → Web → Copy config

**Q: Có được code trên private repository không?**
A: Được, nhưng GitHub Pages không hoạt động trên private repos. Dùng public repo.

**Q: Có giới hạn storage không?**
A: Firebase có free tier 1GB/tháng cho Firestore, 5GB cho Storage. Khá đủ cho gia đình!

**Q: Nhiều người dùng cùng máy có được không?**
A: Có, mỗi người đăng nhập riêng. Chỉ thấy albums của chính mình.

---

## 🎉 Hoàn Tất!

Xin chúc mừng! Ứng dụng Album Gia Đình của bạn đã sẵn sàng:

1. ✅ API, Storage, Authentication từ Firebase
2. ✅ Website lên GitHub Pages
3. ✅ Sẵn sàng chia sẻ với gia đình

Giời bạn có thể:
- Share URL GitHub Pages cho gia đình
- Mọi người đăng nhập & dùng bình thường
- Ảnh/video được lưu trữ an toàn trên Firebase

Happy sharing! 📸😊
