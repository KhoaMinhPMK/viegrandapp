# VieGrand Premium API Documentation

## Tổng quan

VieGrand Premium API cung cấp các tính năng quản lý gói Premium, thanh toán và đăng ký cho ứng dụng VieGrand.

## Cấu hình môi trường

### 1. Cài đặt dependencies

```bash
yarn install
```

### 2. Thiết lập môi trường

```bash
# Sao chép file cấu hình
cp .env.example .env

# Chỉnh sửa file .env với thông tin của bạn
nano .env
```

### 3. Khởi chạy ứng dụng

```bash
# Development
yarn dev

# Production
yarn prod

# With auto-restart
yarn start:dev
```

## API Endpoints

### Authentication

Tất cả API endpoints (trừ public endpoints) đều yêu cầu JWT token trong header:

```
Authorization: Bearer <your-jwt-token>
```

### Premium Plans

#### 1. Lấy danh sách gói Premium

```http
GET /api/premium/plans
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Premium Monthly",
      "description": "Gói Premium hàng tháng...",
      "price": 99000,
      "duration": 30,
      "type": "monthly",
      "features": ["Gọi video không giới hạn", "..."],
      "isRecommended": true
    }
  ],
  "message": "Lấy danh sách gói Premium thành công"
}
```

#### 2. Lấy chi tiết gói Premium

```http
GET /api/premium/plans/{id}
```

#### 3. Tạo gói Premium mới (Admin only)

```http
POST /api/premium/plans
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Premium Weekly",
  "description": "Gói Premium hàng tuần",
  "price": 29000,
  "duration": 7,
  "type": "weekly",
  "features": ["Feature 1", "Feature 2"]
}
```

### User Subscriptions

#### 1. Đăng ký gói Premium

```http
POST /api/premium/subscribe
Authorization: Bearer <user-token>
Content-Type: application/json

{
  "planId": 1,
  "paymentMethod": "momo",
  "autoRenewal": true
}
```

#### 2. Kiểm tra trạng thái Premium

```http
GET /api/premium/my-status
Authorization: Bearer <user-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isPremium": true,
    "subscription": {
      "id": 1,
      "status": "active",
      "endDate": "2025-08-07T00:00:00Z",
      "daysRemaining": 31
    },
    "plan": {
      "name": "Premium Monthly",
      "features": ["..."]
    }
  }
}
```

#### 3. Hủy subscription

```http
PUT /api/premium/subscription/{id}/cancel
Authorization: Bearer <user-token>
Content-Type: application/json

{
  "cancelReason": "Không còn nhu cầu sử dụng"
}
```

### Payment

#### 1. Lấy danh sách phương thức thanh toán

```http
GET /api/premium/payment-methods
```

#### 2. Tạo giao dịch thanh toán

```http
POST /api/premium/payment/create
Authorization: Bearer <user-token>
Content-Type: application/json

{
  "subscriptionId": 1,
  "planId": 1,
  "amount": 99000,
  "paymentMethod": "momo",
  "type": "subscription",
  "description": "Thanh toán gói Premium Monthly"
}
```

#### 3. Khởi tạo thanh toán

```http
POST /api/premium/payment/{transactionId}/initiate
Authorization: Bearer <user-token>
Content-Type: application/json

{
  "amount": 99000,
  "currency": "VND",
  "description": "Thanh toán gói Premium",
  "paymentMethod": "momo",
  "customerInfo": {
    "name": "Nguyễn Văn A",
    "email": "user@example.com",
    "phone": "0123456789"
  },
  "callbackUrl": "http://localhost:3000/api/premium/payment/callback",
  "returnUrl": "http://localhost:3001/premium/payment/result"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "TX_1234567890_ABC123",
    "paymentUrl": "https://mock-payment.momo.com/pay/TX_1234567890_ABC123",
    "qrCode": "data:image/png;base64,iVBORw0KG...",
    "deepLink": "momo://payment/MOMO_1234567890_ABC123"
  }
}
```

#### 4. Lấy lịch sử giao dịch

```http
GET /api/premium/payment/my-transactions
Authorization: Bearer <user-token>
```

### Admin Endpoints

#### 1. Thống kê tổng quan

```http
GET /api/premium/admin/stats
Authorization: Bearer <admin-token>
```

#### 2. Kiểm tra subscription hết hạn

```http
GET /api/premium/admin/expired-subscriptions
Authorization: Bearer <admin-token>
```

#### 3. Chạy scheduler thủ công (Development)

```http
POST /api/premium/admin/scheduler/run-check
Authorization: Bearer <admin-token>
```

## Webhook/Callback

### Payment Callback

```http
POST /api/premium/payment/callback
Content-Type: application/json

{
  "transactionCode": "TX_1234567890_ABC123",
  "status": "success",
  "gatewayTransactionId": "MOMO_1234567890_ABC123",
  "gatewayResponse": {
    "message": "Payment completed successfully"
  }
}
```

## Error Handling

API sử dụng format response thống nhất:

### Success Response
```json
{
  "success": true,
  "data": { /* result data */ },
  "message": "Thành công"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu đầu vào không hợp lệ",
    "details": [
      {
        "property": "amount",
        "constraints": { "isNumber": "amount must be a number" }
      }
    ]
  }
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Development

### Testing

```bash
# Run all tests
yarn test

# Run specific test suite
yarn test premium

# Run tests with coverage
yarn test:cov
```

### Code Quality

```bash
# Format code
yarn format

# Lint code
yarn lint

# Run all checks
yarn premium:check
```

## Scheduler

Hệ thống scheduler tự động chạy các tác vụ sau:

- **Mỗi giờ**: Kiểm tra subscription hết hạn
- **Mỗi ngày 9h**: Kiểm tra subscription sắp hết hạn (7, 3, 1 ngày)
- **Mỗi ngày 2h**: Xử lý auto-renewal
- **Mỗi tuần**: Dọn dẹp dữ liệu cũ
- **Mỗi 30 phút**: Kiểm tra transaction pending quá lâu

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill process using port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **IP connection issues**
   - Đảm bảo HOST=0.0.0.0 trong file .env
   - Kiểm tra firewall settings
   - Với React Native: Sử dụng IP address thay vì localhost

3. **CORS errors**
   - Thêm domain của frontend vào CORS config trong main.ts
   - Với React Native: Thêm exp:// URL vào allowed origins

### Logs

```bash
# View application logs
yarn start:dev

# View specific service logs
grep "PremiumService" logs/application.log
```

## Support

Nếu gặp vấn đề, vui lòng:

1. Kiểm tra file logs
2. Đảm bảo cấu hình .env đúng
3. Kiểm tra network connectivity
4. Liên hệ team phát triển

---

**VieGrand Development Team**
Version: 1.0.0
Updated: July 2025
