# 🔐 Hướng Dẫn Cấu Hình Admin Account

## 📝 Tài Khoản Admin

**Tên đăng nhập (Username)**: `admin`  
**Password**: `van1508`

## 🛠️ Các Bước Tạo Admin Account

### Bước 1: Vào Firebase Console

- Truy cập https://firebase.google.com → Go to console
- Chọn project của bạn

### Bước 2: Vào Authentication

- Click menu **"Authentication"** (bên trái)
- Click tab **"Users"**

### Bước 3: Tạo User Mới

- Click nút **"Add user"** (hoặc **"Create user"**)
- **Email**: `admin@albumlocal.com` (⚠️ Phải đúng format này!)
- **Password**: `van1508`
- Click **"Create user"**

✅ Admin account đã tạo!

---

## 🎯 Cách Hoạt Động

### Khi Admin Đăng Nhập
- Dùng username: `admin`, password: `van1508`
- **Tab "Đăng Ký" sẽ hiện lên** ở màn hình login
- Admin có thể **tạo tài khoản mới** cho những người khác

### Khi User Thường Đăng Nhập
- User khác không thấy tab "Đăng Ký"
- Nếu cố gắng tạo account qua URL, sẽ nhận lỗi: "❌ Chỉ Admin mới có thể tạo tài khoản mới!"

---

## 📋 Workflow Sử Dụng

### Lần Đầu: Admin Tạo Tài Khoản Cho Gia Đình

1. **Admin đăng nhập**
   - Username: `admin`
   - Password: `van1508`

2. **Admin trong ứng dụng**
   - Nhấn "Đăng Nhập" → Vào login modal
   - Click tab **"Đăng Ký"** (chỉ admin thấy được)
   - Nhập Họ tên, username, password của người gia đình
   - Click "Đăng Ký"

3. **Người gia đình dùng ứng dụng**
   - Dùng username + password mà admin vừa tạo để đăng nhập
   - Không thấy tab "Đăng Ký" (bình thường)
   - Upload ảnh, xem albums như bình thường

---

## 🔑 Quản Lý Admin

### Đổi Password Admin

- Vào Firebase Console → Authentication → Users
- Tìm user `admin@albumlocal.com`
- Click "..." → "Edit user"
- Đổi password
- Click "Update"

### Thêm Nhiều Admin (Tùy Chọn)

Mở file `public/script.js`, tìm dòng:

```javascript
const ADMIN_USERNAME = 'admin';
```

Thay thế bằng:

```javascript
const ADMIN_USERNAMES = ['admin', 'admin2'];

async function checkAdminStatus(user) {
    if (!user) {
        isAdmin = false;
        currentUsername = null;
        return;
    }
    
    // Extract username from email
    const username = user.email.split('@')[0];
    currentUsername = username;
    isAdmin = ADMIN_USERNAMES.includes(username);
    updateUIBasedOnAdminStatus();
}
```

Sau đó tạo các admin accounts khác tương tự. Tên Firebase phải là `admin2@albumlocal.com`, `admin3@albumlocal.com`, etc.

---

## ⚠️ Lưu Ý Bảo Mật

- **KHÔNG chia sẻ** thông tin đăng nhập admin cho người không tin tưởng
- Admin có quyền tạo tài khoản cho bất kỳ ai
- Nếu bị lộ password, hãy đổi ngay ở Firebase Console

---

## ✅ Kiểm Tra

### Test 1: Đăng Nhập Admin

1. Mở ứng dụng
2. Click "Đăng Nhập"
3. Nhập:
   - Username: `admin`
   - Password: `van1508`
4. Click "Đăng Nhập"
5. ✅ Phải thấy "admin (Admin)" ở góc trên

### Test 2: Xem Tab Signup (Admin Only)

1. Sau khi admin đăng nhập
2. Click "Đăng Nhập" → Modal hiện lên
3. ✅ Phải thấy 2 tabs: "Đăng Nhập" **và** "Đăng Ký"

### Test 3: User Thường Không Thấy Signup

1. Đăng xuất
2. Đăng nhập bằng tài khoản user thường
3. Click "Đăng Nhập"
4. ✅ Phải **chỉ thấy** tab "Đăng Nhập", không thấy "Đăng Ký"

### Test 4: Admin Tạo Tài Khoản

1. Admin đăng nhập
2. Click "Đăng Nhập" → Modal
3. Click tab "Đăng Ký"
4. Nhập :
   - Họ tên: "Người Gia Đình"
   - Username: "giadinh"
   - Password: "Password123"
   - Xác nhận: "Password123"
5. Click "Đăng Ký"
6. ✅ Phải thấy: "✅ Tài khoản tạo thành công!"

### Test 5: User Mới Dùng Account Được Tạo

1. Đăng xuất
2. Đăng nhập bằng:
   - Username: `giadinh`
   - Password: `Password123`
3. ✅ Phải đăng nhập được và thấy albums
4. ✅ Tab "Đăng Ký" không xuất hiện

---

## 🎉 Xong!

Bây giờ ứng dụng của bạn:
- ✅ Chỉ admin mới có thể tạo tài khoản
- ✅ User thường không thấy tính năng đăng ký
- ✅ Đăng nhập bằng username thay vì email
- ✅ An toàn hơn cho gia đình

Hãy thử test và chia sẻ với gia đình! 📸
