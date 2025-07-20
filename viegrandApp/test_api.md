---
noteId: "4414f770654c11f0b6b4355d6b743456"
tags: []

---

# Test API VieGrand

## 🧪 Test API Đăng Ký

### 1. Test đăng ký thành công
```bash
curl -X POST https://viegrand.site/backend/signup.php \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Nguyễn Văn Test",
    "email": "test@example.com",
    "phone": "0987654321",
    "password": "123456"
  }'
```

### 2. Test validation - thiếu trường
```bash
curl -X POST https://viegrand.site/backend/signup.php \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Nguyễn Văn Test",
    "email": "test@example.com",
    "password": "123456"
  }'
```

### 3. Test validation - email không hợp lệ
```bash
curl -X POST https://viegrand.site/backend/signup.php \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Nguyễn Văn Test",
    "email": "invalid-email",
    "phone": "0987654321",
    "password": "123456"
  }'
```

### 4. Test validation - password quá ngắn
```bash
curl -X POST https://viegrand.site/backend/signup.php \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Nguyễn Văn Test",
    "email": "test@example.com",
    "phone": "0987654321",
    "password": "123"
  }'
```

### 5. Test validation - phone quá ngắn
```bash
curl -X POST https://viegrand.site/backend/signup.php \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Nguyễn Văn Test",
    "email": "test@example.com",
    "phone": "123",
    "password": "123456"
  }'
```

### 6. Test trùng lặp email (chạy 2 lần)
```bash
curl -X POST https://viegrand.site/backend/signup.php \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Nguyễn Văn Test",
    "email": "duplicate@example.com",
    "phone": "0987654321",
    "password": "123456"
  }'
```

### 7. Test trùng lặp phone (chạy 2 lần)
```bash
curl -X POST https://viegrand.site/backend/signup.php \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Nguyễn Văn Test",
    "email": "test2@example.com",
    "phone": "0987654321",
    "password": "123456"
  }'
```

### 8. Test method không đúng (GET thay vì POST)
```bash
curl -X GET https://viegrand.site/backend/signup.php
```

## 🎯 Lệnh curl đơn giản nhất để test nhanh:

```bash
curl -X POST https://viegrand.site/backend/signup.php -H "Content-Type: application/json" -d '{"fullName":"Test User","email":"test@example.com","phone":"0987654321","password":"123456"}'
```

## 📊 Response mong đợi:

### ✅ Thành công (201):
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
      "age": null,
      "address": null,
      "gender": null,
      "role": "elderly",
      "active": true,
      "createdAt": "2024-01-01 00:00:00",
      "updatedAt": "2024-01-01 00:00:00"
    }
  },
  "message": "User registered successfully"
}
```

### ❌ Lỗi (400):
```json
{
  "success": false,
  "error": {
    "statusCode": 400,
    "message": "Email already exists",
    "error": "Bad request",
    "timestamp": "2024-01-01 00:00:00",
    "path": "/backend/signup.php",
    "method": "POST"
  }
}
```

## 🔧 Test với PowerShell (Windows):

```powershell
Invoke-RestMethod -Uri "https://viegrand.site/backend/signup.php" -Method POST -ContentType "application/json" -Body '{"fullName":"Test User","email":"test@example.com","phone":"0987654321","password":"123456"}'
```

## 🌐 Test với Postman:

1. **Method:** POST
2. **URL:** `https://viegrand.site/backend/signup.php`
3. **Headers:** `Content-Type: application/json`
4. **Body (raw JSON):**
```json
{
  "fullName": "Test User",
  "email": "test@example.com",
  "phone": "0987654321",
  "password": "123456"
}
``` 