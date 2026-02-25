# 📸 Family Album - Ứng Dụng Lưu Trữ Ảnh Gia Đình

Ứng dụng web để lưu trữ, quản lý và chia sẻ ảnh/video gia đình với bảo mật cao bằng **Firebase**.

## ✨ Tính Năng

✅ **Chế độ Công Khai** - Mọi người có thể xem và đăng ảnh không cần tài khoản
✅ **Admin Control** - Admin đăng nhập để quản lý và xoá ảnh/album
✅ **Lưu trữ ảnh/video** - Sử dụng Firebase Cloud Storage & Google Drive
✅ **Tổ chức Albums** - Phân loại ảnh theo albums  
✅ **Giao diện thân thiện** - Responsive, đẹp và dễ sử dụng  
✅ **Deploy miễn phí** - Chạy trên GitHub Pages  

## 🚀 Hướng Dẫn Cài Đặt

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/Album.git
cd Album
```

### 2. Cấu Hình Firebase

**Bước 1:** Tạo project Firebase
- Truy cập https://firebase.google.com
- Click "Go to console"
- Click "+ Add project"
- Đặt tên project (vd: "family-album")
- Chọn "Create project"

**Bước 2:** Lấy Firebase Config
- Ở Console, click ⚙️ (Settings)
- Chọn "Project settings"
- Scroll xuống, tìm "Web apps"
- Click biểu tượng web `</>`
- Copy toàn bộ config object

**Bước 3:** Cập nhật Firebase Config
- Mở file `public/firebase-config.js`
- Thay thế các giá trị trong `firebaseConfig`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HỨU_ĐÂY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "1:YOUR_APP_ID:web:YOUR_WEB_ID"
};
```

### 3. Cấu Hình Firebase Services

**Authentication:**
- Ở Console Firebase, chọn "Authentication"
- Click "Get started"
- Click "Email/Password"
- Bật "Email/Password"
- Click "Save"

**Firestore Database:**
- Chọn "Firestore Database"
- Click "Create database"
- Chọn "Start in test mode" (hoặc với rules bảo mật)
- Chọn location "asia-southeast1" (gần Việt Nam)
- Click "Create"

**Storage:**
- Chọn "Storage"
- Click "Get started"
- Click "Next"
- Chọn location tương tự Firestore
- Click "Done"

### 4. Cấu Hình GitHub

**Bước 1:** Tạo GitHub Repository
- Truy cập https://github.com/new
- Đặt tên: "Album" (không gạch dưới)
- Chọn "Public"
- Click "Create repository"

**Bước 2:** Push Code
```bash
git remote add origin https://github.com/YOUR_USERNAME/Album.git
git branch -M main
git push -u origin main
```

**Bước 3:** Cấu Hình GitHub Pages
- Ở Repository, click "Settings"
- Chọn "Pages" (bên trái)
- Source: "Deploy from a branch"
- Branch: "main"
- Folder: "/(root)"
- Click "Save"

⏳ Chờ 1-2 phút, rồi truy cập: `https://YOUR_USERNAME.github.io/Album`

**Bước 4:** Cập nhật Homepage trong package.json
```json
"homepage": "https://YOUR_USERNAME.github.io/Album"
```

## 🛠️ Chạy Localhost

```bash
# Cài đặt dependencies
npm install

# Chạy server local
npm start
```

Mở browser vào `http://localhost:8000`

## 📤 Deploy lên GitHub Pages

```bash
npm run deploy
```

Hoặc commit & push trực tiếp lên GitHub - GitHub Pages sẽ tự deploy.

## 📁 Cấu Trúc Dự Án

```
Album/
├── public/
│   ├── index.html          # Trang web chính
│   ├── style.css           # CSS styling
│   ├── script.js           # Logic ứng dụng
│   └── firebase-config.js  # Firebase configuration
├── .gitignore              # Git ignore file
├── package.json            # Dependencies
└── README.md               # Tài liệu
```

## 🔐 Firestore Rules (Bảo Mật)

Nếu muốn bảo mật tốt hơn, áp dụng rules này:

Ở Firestore Console → "Rules", thay thế:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /albums/{albumId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
    
    match /files/{fileId} {
      allow read, write: if request.auth.uid == resource.data.uploadedBy || 
                            request.auth.uid in resource.data.sharedWith;
      allow create: if request.auth != null;
    }
  }
}
```

## 🔑 Storage Rules

Ở Storage Console → "Rules", thay thế:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /albums/{albumId}/{allPaths=**} {
      allow read, write: if request.auth.uid == request.auth.uid;
    }
  }
}
```

## 🎯 Sử Dụng

1. **Truy cập** ứng dụng tại GitHub Pages link
2. **Đăng ký** tài khoản mới hoặc **Đăng nhập**
3. **Tạo Album** bằng cách kéo thả ảnh/video
4. **Quản lý** các ảnh - xem, tải xuống, xoá
5. **Chia sẻ link** với gia đình

## 🆘 Troubleshooting

### Lỗi: "Firebase Config not found"
- Kiểm tra `firebase-config.js` có đúng credentials không

### Lỗi: "Permission denied" khi upload
- Kiểm tra Firestore Rules và Storage Rules đã đúng không

### Trang không load
- Chờ GitHub Pages deploy xong (1-2 phút)
- Clear browser cache (Ctrl+Shift+Delete)
- Kiểm tra Console (F12) có error không

##🤝 Đóng Góp

Nếu tìm lỗi hoặc có ý tưởng cải thiện, hãy tạo Issue hoặc Pull Request!

## 📄 License

MIT License - Sử dụng tự do!

## Usage

- Open `public/index.html` in your browser to view the application.
- The application allows users to interact with Firebase services, such as authentication and storage.

## Contributing

Feel free to submit issues or pull requests for any improvements or features you would like to see in this project.

## License

This project is licensed under the MIT License. See the LICENSE file for details.