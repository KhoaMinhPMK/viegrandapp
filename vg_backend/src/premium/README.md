# Premium Module Documentation

## Tổng quan

Premium Module cung cấp đầy đủ tính năng quản lý gói Premium cho ứng dụng VieGrand, bao gồm:

- 🎯 **Quản lý gói Premium** (Premium Plans)
- 👥 **Đăng ký người dùng** (User Subscriptions)
- 💳 **Xử lý thanh toán** (Payment Processing)
- 🔔 **Thông báo** (Notifications)
- ⏰ **Tự động hóa** (Scheduling & Auto-renewal)

## Cấu trúc thư mục

```
src/premium/
├── dto/                        # Data Transfer Objects
│   ├── premium-plan.dto.ts
│   ├── user-subscription.dto.ts
│   └── payment-transaction.dto.ts
├── entities/                   # Database entities
│   ├── premium-plan.entity.ts
│   ├── user-subscription.entity.ts
│   └── payment-transaction.entity.ts
├── middleware/                 # Middleware & Guards
│   └── premium.middleware.ts
├── validators/                 # Custom validators
│   └── premium.validator.ts
├── filters/                    # Exception filters
│   └── premium-exception.filter.ts
├── premium.controller.ts       # REST API endpoints
├── premium.service.ts          # Business logic
├── payment.service.ts          # Payment processing
├── notification.service.ts     # Notification system
├── scheduler.service.ts        # Auto tasks
└── premium.module.ts          # Module definition
```

## Tính năng chính

### 1. Premium Plans Management
- Tạo, sửa, xóa gói Premium
- Quản lý giá, thời hạn, tính năng
- Hỗ trợ gói tháng/năm với giảm giá

### 2. User Subscriptions
- Đăng ký gói Premium
- Quản lý subscription lifecycle
- Auto-renewal & manual renewal
- Hủy subscription với lý do

### 3. Payment Processing
- Hỗ trợ nhiều phương thức thanh toán
- Mock payment gateway (MoMo, ZaloPay, VNPay)
- Retry payment mechanism
- Payment callback handling

### 4. Scheduling & Automation
- Auto-check expired subscriptions
- Notification cho subscription sắp hết hạn
- Auto-renewal processing
- Cleanup old data

## API Endpoints

### Premium Plans
```
GET    /premium/plans              # Danh sách gói Premium
GET    /premium/plans/:id          # Chi tiết gói Premium
POST   /premium/plans              # Tạo gói mới (Admin)
PUT    /premium/plans/:id          # Cập nhật gói (Admin)
DELETE /premium/plans/:id          # Xóa gói (Admin)
```

### User Subscriptions
```
GET    /premium/my-subscription    # Subscription hiện tại
GET    /premium/my-status          # Trạng thái Premium
GET    /premium/my-subscriptions   # Lịch sử subscription
POST   /premium/subscribe          # Đăng ký Premium
PUT    /premium/subscription/:id/cancel # Hủy subscription
```

### Payment Processing
```
GET    /premium/payment-methods    # Phương thức thanh toán
POST   /premium/payment/create     # Tạo giao dịch
POST   /premium/payment/:id/initiate # Khởi tạo thanh toán
GET    /premium/payment/transaction/:code # Thông tin giao dịch
GET    /premium/payment/my-transactions # Lịch sử giao dịch
POST   /premium/payment/callback   # Callback từ gateway
POST   /premium/payment/:id/retry  # Thử lại thanh toán
```

### Statistics & Admin
```
GET    /premium/stats              # Thống kê user
GET    /premium/admin/stats        # Thống kê admin
GET    /premium/admin/expired-subscriptions # Subscription hết hạn
```

## Cách sử dụng

### 1. Khởi chạy Backend
```bash
# Sử dụng yarn với dấu ;
yarn premium:dev

# Hoặc
cd vg_backend; yarn start:dev
```

### 2. Test Premium APIs
```bash
# Lấy danh sách gói Premium
curl -X GET http://localhost:3000/premium/plans

# Đăng ký gói Premium (cần JWT token)
curl -X POST http://localhost:3000/premium/subscribe \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": 1,
    "paymentMethod": "momo",
    "autoRenewal": true
  }'
```

### 3. Frontend Integration
```typescript
// Lấy danh sách gói Premium
const plans = await api.get('/premium/plans');

// Kiểm tra trạng thái Premium
const status = await api.get('/premium/my-status');

// Đăng ký Premium
const subscription = await api.post('/premium/subscribe', {
  planId: 1,
  paymentMethod: 'momo',
  autoRenewal: true
});
```

## Scheduled Tasks

### Auto-renewal
- Chạy lúc 2:00 AM hàng ngày
- Tự động gia hạn subscription có `autoRenewal: true`
- Xử lý thanh toán tự động

### Expiration Check
- Chạy mỗi giờ để check subscription hết hạn
- Gửi thông báo cho user
- Cập nhật trạng thái subscription

### Cleanup
- Chạy hàng tuần để dọn dẹp dữ liệu cũ
- Xóa transaction cũ hơn 1 năm
- Xóa subscription đã hủy cũ hơn 6 tháng

## Security Features

### Guards & Middleware
- `AdminGuard`: Chỉ admin mới truy cập được
- `PremiumGuard`: Kiểm tra trạng thái Premium
- `PaymentRateLimitMiddleware`: Giới hạn số lần tạo giao dịch

### Validation
- Custom validators cho phone, amount, duration
- Whitelist & sanitize input data
- Error handling với thông báo tiếng Việt

## Mock Data

### Premium Plans
1. **Premium Monthly** - 99,000 VND/tháng
2. **Premium Yearly** - 950,000 VND/năm (giảm 20%)

### Payment Methods
- MoMo (90% success rate)
- ZaloPay (85% success rate)
- VNPay (95% success rate)
- Credit Card (80% success rate)

## Environment Variables

```env
API_BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

## Troubleshooting

### Common Issues

1. **Subscription không active sau thanh toán**
   - Check callback từ payment gateway
   - Verify transaction status
   - Check logs trong NotificationService

2. **Auto-renewal không hoạt động**
   - Verify ScheduleModule được import
   - Check cron jobs trong logs
   - Verify subscription có `autoRenewal: true`

3. **Payment timeout**
   - Check transaction expiry time (15 phút)
   - Verify payment gateway configuration
   - Check network connectivity

### Debug Commands
```bash
# Check logs
yarn start:dev | grep -i premium

# Run manual scheduler check
# Tạo endpoint /premium/admin/manual-check để test
```

## Tích hợp với Frontend

### React Native Context
```typescript
// Sử dụng PremiumContext đã có
const { isPremium, subscription, checkPremiumStatus } = usePremium();
```

### Notifications
```typescript
// Lắng nghe notification về Premium
useEffect(() => {
  const handlePremiumNotification = (notification) => {
    if (notification.type.includes('premium')) {
      // Update UI state
      checkPremiumStatus();
    }
  };
  
  // Subscribe to notifications
}, []);
```

## License
MIT © VieGrand Team
