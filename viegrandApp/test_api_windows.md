---
noteId: "63e29940654c11f0b6b4355d6b743456"
tags: []

---

# Test API VieGrand - Windows CMD

## 🧪 Lệnh curl cho Windows CMD

### 📝 API Đăng Ký

### 1. Test đăng ký thành công (1 dòng)
```cmd
curl -X POST https://viegrand.site/backend/signup.php -H "Content-Type: application/json" -d "{\"fullName\":\"Test User\",\"email\":\"test@example.com\",\"phone\":\"0987654321\",\"password\":\"123456\"}"
```

### 2. Test đăng ký thành công (nhiều dòng)
```cmd
curl -X POST https://viegrand.site/backend/signup.php ^
-H "Content-Type: application/json" ^
-d "{\"fullName\":\"Nguyễn Văn Test\",\"email\":\"test@example.com\",\"phone\":\"0987654321\",\"password\":\"123456\"}"
```

### 3. Test validation - thiếu trường
```cmd
curl -X POST https://viegrand.site/backend/signup.php -H "Content-Type: application/json" -d "{\"fullName\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"123456\"}"
```

### 4. Test validation - email không hợp lệ
```cmd
curl -X POST https://viegrand.site/backend/signup.php -H "Content-Type: application/json" -d "{\"fullName\":\"Test User\",\"email\":\"invalid-email\",\"phone\":\"0987654321\",\"password\":\"123456\"}"
```

### 5. Test validation - password quá ngắn
```cmd
curl -X POST https://viegrand.site/backend/signup.php -H "Content-Type: application/json" -d "{\"fullName\":\"Test User\",\"email\":\"test@example.com\",\"phone\":\"0987654321\",\"password\":\"123\"}"
```

### 6. Test validation - phone quá ngắn
```cmd
curl -X POST https://viegrand.site/backend/signup.php -H "Content-Type: application/json" -d "{\"fullName\":\"Test User\",\"email\":\"test@example.com\",\"phone\":\"123\",\"password\":\"123456\"}"
```

### 7. Test trùng lặp email (chạy 2 lần)
```cmd
curl -X POST https://viegrand.site/backend/signup.php -H "Content-Type: application/json" -d "{\"fullName\":\"Test User\",\"email\":\"duplicate@example.com\",\"phone\":\"0987654321\",\"password\":\"123456\"}"
```

### 8. Test method không đúng (GET thay vì POST)
```cmd
curl -X GET https://viegrand.site/backend/signup.php
```

### 🔐 API Đăng Nhập

### 9. Test đăng nhập thành công
```cmd
curl -X POST https://viegrand.site/backend/login.php -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"123456\"}"
```

### 10. Test đăng nhập - email không tồn tại
```cmd
curl -X POST https://viegrand.site/backend/login.php -H "Content-Type: application/json" -d "{\"email\":\"nonexistent@example.com\",\"password\":\"123456\"}"
```

### 11. Test đăng nhập - sai mật khẩu
```cmd
curl -X POST https://viegrand.site/backend/login.php -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"wrongpassword\"}"
```

### 12. Test đăng nhập - thiếu trường
```cmd
curl -X POST https://viegrand.site/backend/login.php -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\"}"
```

### 13. Test đăng nhập - email không hợp lệ
```cmd
curl -X POST https://viegrand.site/backend/login.php -H "Content-Type: application/json" -d "{\"email\":\"invalid-email\",\"password\":\"123456\"}"
```

### ⚙️ API Settings

### 14. Test lấy settings
```cmd
curl -X GET https://viegrand.site/backend/settings.php
```

### 15. Test cập nhật settings
```cmd
curl -X PUT https://viegrand.site/backend/settings.php -H "Content-Type: application/json" -d "{\"userId\":1,\"isDarkMode\":true,\"language\":\"en\"}"
```

### 💎 API Premium

### 16. Test lấy premium plans
```cmd
curl -X GET https://viegrand.site/backend/premium/plans
```

### 17. Test lấy premium status
```cmd
curl -X GET https://viegrand.site/backend/premium/my-status
```

### 18. Test lấy payment methods
```cmd
curl -X GET https://viegrand.site/backend/premium/payment-methods
```

### 19. Test lấy transactions
```cmd
curl -X GET https://viegrand.site/backend/premium/payment/my-transactions
```

### 20. Test mua premium
```cmd
curl -X POST https://viegrand.site/backend/premium/purchase -H "Content-Type: application/json" -d "{\"planId\":2,\"paymentMethod\":\"momo\"}"
```

### 21. Test mua premium với gói khác
```cmd
curl -X POST https://viegrand.site/backend/premium/purchase -H "Content-Type: application/json" -d "{\"planId\":1,\"paymentMethod\":\"vnpay\"}"
```

## 🎯 Lệnh curl đơn giản nhất cho Windows:

### Đăng ký:
```cmd
curl -X POST https://viegrand.site/backend/signup.php -H "Content-Type: application/json" -d "{\"fullName\":\"Test User\",\"email\":\"test@example.com\",\"phone\":\"0987654321\",\"password\":\"123456\"}"
```

### Đăng nhập:
```cmd
curl -X POST https://viegrand.site/backend/login.php -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"123456\"}"
```

## 🔧 Nếu không có curl, dùng PowerShell:

### PowerShell đơn giản:

**Đăng ký:**
```powershell
Invoke-RestMethod -Uri "https://viegrand.site/backend/signup.php" -Method POST -ContentType "application/json" -Body '{"fullName":"Test User","email":"test@example.com","phone":"0987654321","password":"123456"}'
```

**Đăng nhập:**
```powershell
Invoke-RestMethod -Uri "https://viegrand.site/backend/login.php" -Method POST -ContentType "application/json" -Body '{"email":"test@example.com","password":"123456"}'
```

### PowerShell với response chi tiết:
```powershell
$response = Invoke-WebRequest -Uri "https://viegrand.site/backend/signup.php" -Method POST -ContentType "application/json" -Body '{"fullName":"Test User","email":"test@example.com","phone":"0987654321","password":"123456"}'
$response.Content
```

## 📝 Lưu ý cho Windows CMD:

1. **Dấu ngoặc kép**: Sử dụng `\"` thay vì `"` trong JSON
2. **Xuống dòng**: Sử dụng `^` thay vì `\`
3. **Nếu không có curl**: Dùng PowerShell thay thế

## 🚀 Cách chạy nhanh:

1. Mở **CMD** (Windows + R, gõ `cmd`)
2. Copy lệnh này và paste:
```cmd
curl -X POST https://viegrand.site/backend/signup.php -H "Content-Type: application/json" -d "{\"fullName\":\"Test User\",\"email\":\"test@example.com\",\"phone\":\"0987654321\",\"password\":\"123456\"}"
```
3. Nhấn Enter

## 📊 Response mong đợi:

### ✅ Thành công:
```json
{
  "success": true,
  "data": {
    "access_token": "generated_token_here",
    "user": {
      "id": 1,
      "fullName": "Test User",
      "email": "test@example.com",
      "phone": "0987654321",
      "role": "elderly",
      "active": true
    }
  },
  "message": "User registered successfully"
}
```

### ❌ Lỗi:
```json
{
  "success": false,
  "error": {
    "statusCode": 400,
    "message": "Email already exists",
    "error": "Bad request"
  }
}
``` 