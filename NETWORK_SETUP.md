# Hướng dẫn Setup Network cho VieGrand App

## Vấn đề

Khi test trên thiết bị thật, app không thể kết nối với backend API vì thiết bị không thể truy cập `localhost` của máy tính.

## Giải pháp

### Bước 1: Kiểm tra IP của máy tính

```bash
# Trên Linux/macOS
ip route get 1.1.1.1 | awk '{print $7}' | head -1

# Hoặc
hostname -I | awk '{print $1}'

# Trên Windows
ipconfig | findstr IPv4
```

### Bước 2: Cấu hình Network trong App

Mở file `viegrandApp/src/config/network.ts` và cập nhật:

```typescript
export const NETWORK_CONFIG = {
  // Địa chỉ IP thật của máy tính (thay đổi theo IP của bạn)
  HOST_IP: '172.28.184.31', // <-- Thay bằng IP của máy bạn
  
  // Để test với localhost (emulator/simulator), đặt USE_LOCALHOST = true
  // Để test với thiết bị thật, đặt USE_LOCALHOST = false
  USE_LOCALHOST: false, // <-- false cho thiết bị thật, true cho emulator
  
  // Port của backend
  PORT: '3000',
};
```

### Bước 3: Kiểm tra Backend đang chạy

```bash
# Kiểm tra process
netstat -tulpn | grep :3000

# Test backend với localhost
curl http://localhost:3000/api

# Test backend với IP thật
curl http://172.28.184.31:3000/api
```

### Bước 4: Kiểm tra Firewall

```bash
# Kiểm tra UFW status
sudo ufw status

# Nếu cần, cho phép port 3000
sudo ufw allow 3000/tcp
```

### Bước 5: Restart Backend với CORS đúng

Backend đã được cấu hình CORS để cho phép kết nối từ IP thật. Restart backend:

```bash
cd vg_backend
yarn start:dev
```

### Bước 6: Rebuild App

```bash
cd viegrandApp

# Clean build
cd android
./gradlew clean
cd ..

# Rebuild
yarn android
```

## Debug Network Issues

App có chức năng debug network tự động. Khi khởi động, app sẽ hiển thị thông tin:

```
🔍 NETWORK DEBUG INFO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 Platform: android
🤖 Is Emulator: false
📄 Device Type: phone
🌐 Suggested API URL: http://172.28.184.31:3000/api
⏰ Timestamp: 2025-01-27T10:30:00.000Z
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Troubleshooting

### 1. "Connection failed" error

- Kiểm tra backend có đang chạy không
- Kiểm tra IP trong config có đúng không
- Kiểm tra firewall
- Đảm bảo phone và máy tính cùng mạng WiFi

### 2. "Network request failed"

- Thử đặt `USE_LOCALHOST: false` trong config
- Restart backend
- Rebuild app

### 3. Endpoint không tìm thấy

- Kiểm tra backend logs
- Đảm bảo API prefix `/api` được sử dụng
- Test backend với curl trước

### 4. CORS errors

Backend đã được cấu hình CORS với:
- `*` (allow all) for development
- Specific IP patterns for your network
- All necessary headers and methods

## Testing Commands

```bash
# Test local connection
curl http://localhost:3000/api

# Test network connection  
curl http://172.28.184.31:3000/api

# Test with your IP (replace with actual IP)
curl http://YOUR_IP:3000/api

# Test specific endpoint
curl http://172.28.184.31:3000/api/users/test
```

## Network Configuration Switch

Để chuyển đổi giữa testing modes:

**Testing trên Emulator/Simulator:**
```typescript
USE_LOCALHOST: true
```

**Testing trên thiết bị thật:**
```typescript
USE_LOCALHOST: false
HOST_IP: '172.28.184.31' // IP thật của máy
```

## Notes

- Đảm bảo backend bind với `0.0.0.0:3000` (đã cấu hình sẵn)
- CORS đã được cấu hình để allow connections
- Firewall rule cho port 3000 đã được thêm
- App sẽ tự động detect device type và log debug info 