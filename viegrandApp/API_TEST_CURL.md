# VieGrand API Testing với CURL trên Windows

## 🔧 Chuẩn bị:
- Backend API URL: `https://viegrand.site/backend/`
- Curl đã có sẵn trên Windows 10/11

## 📋 Test Scripts:

### 1. Test đăng ký user (Signup)

```powershell
# Test với dữ liệu mẫu
curl -X POST "https://viegrand.site/backend/signup.php" ^
  -H "Content-Type: application/json" ^
  -H "Accept: application/json" ^
  -d "{\"fullName\":\"Test User\",\"email\":\"test123@example.com\",\"phone\":\"0123456789\",\"password\":\"123456\"}"
```

### 2. Test đăng nhập (Login)

```powershell
curl -X POST "https://viegrand.site/backend/login.php" ^
  -H "Content-Type: application/json" ^
  -H "Accept: application/json" ^
  -d "{\"email\":\"test123@example.com\",\"password\":\"123456\"}"
```

### 3. Test Premium APIs

#### Lấy danh sách gói Premium:
```powershell
curl -X GET "https://viegrand.site/backend/premium.php/plans" ^
  -H "Accept: application/json"
```

#### Lấy trạng thái Premium của user:
```powershell
curl -X GET "https://viegrand.site/backend/premium.php/my-status" ^
  -H "Accept: application/json"
```

#### Kích hoạt Premium Trial:
```powershell
curl -X POST "https://viegrand.site/backend/premium.php/activate-trial" ^
  -H "Content-Type: application/json" ^
  -H "Accept: application/json" ^
  -d "{}"
```

#### Mua gói Premium:
```powershell
curl -X POST "https://viegrand.site/backend/premium.php/purchase" ^
  -H "Content-Type: application/json" ^
  -H "Accept: application/json" ^
  -d "{\"planId\":1,\"paymentMethod\":\"momo\"}"
```

#### Lấy lịch sử giao dịch:
```powershell
curl -X GET "https://viegrand.site/backend/premium.php/payment/my-transactions" ^
  -H "Accept: application/json"
```

### 4. Test Admin APIs

#### Kiểm tra subscription hết hạn:
```powershell
curl -X POST "https://viegrand.site/backend/premium_admin.php/check-expired" ^
  -H "Content-Type: application/json" ^
  -H "Accept: application/json" ^
  -d "{}"
```

#### Thống kê Premium:
```powershell
curl -X GET "https://viegrand.site/backend/premium_admin.php/stats" ^
  -H "Accept: application/json"
```

## 🐛 Debug Commands:

### Test Database Connection:
```powershell
curl -X GET "https://viegrand.site/backend/debug.php" ^
  -H "Accept: application/json"
```

### Kiểm tra server response:
```powershell
# Test với verbose output
curl -v "https://viegrand.site/backend/premium.php/plans"
```

### Test CORS:
```powershell
curl -X OPTIONS "https://viegrand.site/backend/signup.php" ^
  -H "Origin: http://localhost:8081" ^
  -H "Access-Control-Request-Method: POST" ^
  -H "Access-Control-Request-Headers: Content-Type"
```

## 📊 Expected Responses:

### Successful Signup:
```json
{
  "success": true,
  "data": {
    "access_token": "...",
    "user": {
      "id": 123,
      "fullName": "Test User",
      "email": "test123@example.com",
      "phone": "0123456789",
      "role": "elderly",
      "premium": {
        "isPremium": false,
        "daysRemaining": 0,
        "plan": null
      }
    }
  },
  "message": "User registered successfully"
}
```

### Error Response:
```json
{
  "success": false,
  "error": {
    "statusCode": 400,
    "message": "Email already exists",
    "error": "Bad request",
    "timestamp": "2025-07-20 10:30:00",
    "path": "/backend/signup.php",
    "method": "POST"
  }
}
```

## 🔍 Troubleshooting:

### 1. Nếu lỗi 500 (Internal Server Error):
```powershell
# Kiểm tra error log
curl -X GET "https://viegrand.site/backend/debug.php" -v
```

### 2. Nếu lỗi database:
- Kiểm tra database connection trong config.php
- Đảm bảo bảng users đã được tạo
- Kiểm tra stored procedures

### 3. Nếu lỗi CORS:
- Kiểm tra setCorsHeaders() trong config.php
- Test từ browser console thay vì curl

### 4. Test với data thật từ app:
```powershell
curl -X POST "https://viegrand.site/backend/signup.php" ^
  -H "Content-Type: application/json" ^
  -H "Accept: application/json" ^
  -d "{\"fullName\":\"Vhhj\",\"email\":\"pmkkhoaminh@gmail.com\",\"phone\":\"2580147369\",\"password\":\"123123\"}"
```

## 💡 Tips:

1. **Sử dụng PowerShell** thay vì CMD cho curl syntax tốt hơn
2. **Thêm -v flag** để xem chi tiết request/response
3. **Sử dụng -w flag** để xem timing: `-w "@curl-format.txt"`
4. **Save response** vào file: `-o response.json`

## 🚀 Batch Test Script:

Tạo file `test_api.bat`:

```batch
@echo off
echo Testing VieGrand API...
echo.

echo 1. Testing Signup...
curl -X POST "https://viegrand.site/backend/signup.php" -H "Content-Type: application/json" -d "{\"fullName\":\"Test User %RANDOM%\",\"email\":\"test%RANDOM%@example.com\",\"phone\":\"0123456789\",\"password\":\"123456\"}"
echo.
echo.

echo 2. Testing Premium Plans...
curl -X GET "https://viegrand.site/backend/premium.php/plans"
echo.
echo.

echo 3. Testing Premium Status...
curl -X GET "https://viegrand.site/backend/premium.php/my-status"
echo.
echo.

pause
```

Chạy: `test_api.bat`
