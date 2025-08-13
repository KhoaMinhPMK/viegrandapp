# 📱 VieGrand Project - Hướng dẫn Đầy đủ

## 🎯 Tổng quan Project

**VieGrand** là một ứng dụng hỗ trợ người cao tuổi được xây dựng bằng React Native (Frontend) và NestJS (Backend). Ứng dụng tập trung vào việc cung cấp trải nghiệm đơn giản, thân thiện và dễ sử dụng cho người cao tuổi, cùng với các tính năng cao cấp dành cho người thân.

### 🌟 Mục tiêu chính
- **Đơn giản hóa** công nghệ cho người cao tuổi
- **Kết nối** gia đình một cách dễ dàng
- **Theo dõi sức khỏe** thông minh
- **Hỗ trợ khẩn cấp** nhanh chóng
- **Trải nghiệm Premium** với AI và tính năng cao cấp

### 🏗️ Kiến trúc hệ thống
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│     Backend     │────▶│   External APIs │
│  React Native   │     │     NestJS      │     │  Weather, etc.  │
│                 │     │                 │     │                 │
│  • Elderly UI   │     │  • Auth         │     │  • OpenWeather  │
│  • Relative UI  │     │  • Premium      │     │  • Payment      │
│  • Premium      │     │  • Users        │     │  • Others       │
│  • Voice        │     │  • Settings     │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 🚀 Hướng dẫn Setup và Chạy Project

### 📋 Yêu cầu hệ thống
- **Node.js** >= 18
- **Yarn** (sử dụng yarn thay vì npm)
- **React Native CLI**
- **Android Studio** (cho Android)
- **Xcode** (cho iOS - chỉ macOS)

### 🔧 Setup Backend (NestJS)

```bash
# Chuyển vào thư mục backend
cd vg_backend

# Cài đặt dependencies
yarn install

# Tạo file environment (nếu chưa có)
cp .env.example .env

# Chạy development server
yarn start:dev

# Hoặc sử dụng script tùy chỉnh
yarn dev
```

**Backend sẽ chạy tại:** `http://localhost:3000`
**API Documentation:** `http://localhost:3000/api-docs`

### 📱 Setup Frontend (React Native)

```bash
# Chuyển vào thư mục frontend
cd viegrandApp

# Cài đặt dependencies
yarn install

# Cho iOS (chỉ macOS)
cd ios ; pod install ; cd ..

# Chạy Metro bundler
yarn start

# Chạy trên Android (terminal mới)
yarn android

# Chạy trên iOS (terminal mới - chỉ macOS)
yarn ios
```

---

## 🏗️ Cấu trúc Backend (NestJS)

### 📁 Cấu trúc thư mục

```
vg_backend/
├── src/
│   ├── auth/                    # 🔐 Module xác thực
│   │   ├── dto/                 # Data Transfer Objects
│   │   ├── auth.controller.ts   # API endpoints
│   │   ├── auth.service.ts      # Business logic
│   │   ├── jwt.strategy.ts      # JWT strategy
│   │   └── local.strategy.ts    # Local strategy
│   │
│   ├── users/                   # 👥 Module người dùng
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── users.controller.ts
│   │   └── users.service.ts
│   │
│   ├── premium/                 # 💎 Module Premium
│   │   ├── dto/                 # DTOs cho Premium
│   │   ├── entities/            # Database entities
│   │   ├── middleware/          # Premium middlewares
│   │   ├── validators/          # Custom validators
│   │   ├── premium.controller.ts
│   │   ├── premium.service.ts
│   │   ├── payment.service.ts   # Mock payment gateway
│   │   ├── notification.service.ts
│   │   └── scheduler.service.ts # Auto-renewal
│   │
│   ├── settings/                # ⚙️ Module cài đặt
│   ├── app.module.ts           # Root module
│   └── main.ts                 # Entry point
│
├── package.json
├── tsconfig.json
└── nest-cli.json
```

### 🔑 Các API chính

#### Authentication APIs
```
POST /api/auth/login      # Đăng nhập
POST /api/auth/register   # Đăng ký
```

#### Premium APIs
```
GET  /api/premium/plans               # Danh sách gói Premium
GET  /api/premium/my-status          # Trạng thái Premium hiện tại
POST /api/premium/subscribe          # Đăng ký Premium
POST /api/premium/purchase           # Mua gói Premium
GET  /api/premium/payment-methods    # Phương thức thanh toán
```

#### User APIs
```
GET  /api/users/profile    # Thông tin profile
PUT  /api/users/profile    # Cập nhật profile
```

---

## 📱 Cấu trúc Frontend (React Native)

### 📁 Cấu trúc thư mục

```
viegrandApp/
├── src/
│   ├── screens/                 # 📺 Các màn hình
│   │   ├── Elderly/            # Giao diện cho người cao tuổi
│   │   │   ├── Home/           # Màn hình chính
│   │   │   ├── Phone/          # Cuộc gọi
│   │   │   ├── Message/        # Tin nhắn
│   │   │   ├── Profile/        # Hồ sơ
│   │   │   └── Settings/       # Cài đặt
│   │   │
│   │   ├── Relative/           # Giao diện cho người thân
│   │   ├── Premium/            # Màn hình Premium
│   │   ├── Login/              # Đăng nhập
│   │   ├── Register/           # Đăng ký
│   │   └── ...
│   │
│   ├── navigation/             # 🧭 Điều hướng
│   │   ├── AuthNavigator.tsx   # Navigation cho auth
│   │   ├── ElderlyNavigator.tsx # Navigation cho elderly
│   │   ├── RelativeNavigator.tsx # Navigation cho relative
│   │   ├── PremiumNavigator.tsx # Navigation cho premium
│   │   └── ElderlyBottomTabNavigator.tsx # Tab navigation
│   │
│   ├── contexts/               # 🔄 State Management
│   │   ├── AuthContext.tsx     # Context xác thực
│   │   ├── PremiumContext.tsx  # Context Premium
│   │   ├── VoiceContext.tsx    # Context nhận diện giọng nói
│   │   └── SettingsContext.tsx # Context cài đặt
│   │
│   ├── components/             # 🧩 Components tái sử dụng
│   │   ├── NotificationDropdown.tsx
│   │   ├── VoiceRecognitionModal.tsx
│   │   └── settings/
│   │
│   ├── services/               # 🔧 Dịch vụ
│   │   └── api.ts             # API client
│   │
│   ├── types/                  # 📝 TypeScript types
│   │   ├── navigation.ts
│   │   └── premium.ts
│   │
│   ├── assets/                 # 🖼️ Tài nguyên
│   │   ├── background.png
│   │   ├── logo.png
│   │   └── weather/
│   │
│   └── utils/                  # 🛠️ Utilities
│       └── assetUtils.ts
│
├── android/                    # Android specific
├── ios/                        # iOS specific
├── package.json
└── App.tsx                     # Root component
```

### 🎭 Vai trò người dùng (User Roles)

#### 👴 Elderly (Người cao tuổi)
- **Giao diện đơn giản:** Nút to, chữ rõ, màu sắc tương phản cao
- **Chức năng cơ bản:** Gọi điện, nhắn tin, xem thời tiết
- **Voice control:** Điều khiển bằng giọng nói
- **Bottom Tab Navigation:** Home, Message, Voice (center), Phone, Settings

#### 👥 Relative (Người thân)
- **Giao diện phức tạp hơn:** Nhiều tính năng quản lý
- **Theo dõi:** Giám sát người cao tuổi
- **Cài đặt:** Cấu hình cho tài khoản elderly
- **Stack Navigation:** Các màn hình quản lý khác nhau

---

## 💎 Hệ thống Premium

### 🎯 Tính năng Premium

#### 🆓 Free Features
- Cuộc gọi cơ bản
- Nhắn tin
- Thông báo khẩn cấp
- Giao diện cơ bản

#### 💎 Premium Features
- **Gọi video không giới hạn** (Free: 5 phút)
- **Theo dõi sức khỏe AI** (Free: cơ bản)
- **Nhắc nhở uống thuốc thông minh**
- **Báo cáo sức khỏe hàng tuần**
- **Hỗ trợ ưu tiên 24/7**
- **Tư vấn bác sĩ trực tuyến**
- **Phân tích AI nâng cao**
- **Sao lưu cloud không giới hạn**
- **Chia sẻ với nhiều người thân**

### 📦 Gói Premium

```typescript
// Premium Plans
const plans = [
  {
    id: 1,
    name: 'Premium Monthly',
    price: 99000,        // VND
    duration: 30,        // days
    type: 'monthly',
    discountPercent: 0
  },
  {
    id: 2,
    name: 'Premium Yearly',
    price: 950000,       // VND
    duration: 365,       // days
    type: 'yearly',
    discountPercent: 20  // 20% discount
  }
];
```

### 💳 Payment Flow

1. **Plan Selection** → Chọn gói Premium
2. **Payment Method** → Chọn phương thức thanh toán (MoMo, ZaloPay, VNPay)
3. **Payment Processing** → Xử lý thanh toán (Mock)
4. **Result** → Success/Failed screen
5. **Activation** → Kích hoạt Premium

---

## 🎤 Tính năng Voice Recognition

### 🔧 Cấu hình
- **Library:** `@react-native-voice/voice`
- **Language:** `vi-VN` (Tiếng Việt)
- **Permissions:** RECORD_AUDIO

### 🎯 Cách hoạt động

```typescript
// VoiceContext.tsx
const VoiceContext = {
  isListening: boolean,
  startListening: () => Promise<void>,
  stopListening: () => Promise<void>,
  results: string[],
  error: string | null,
  clearResults: () => void
};
```

### 📱 UI Components
- **Center Button** trong Bottom Tab (Elderly)
- **VoiceRecognitionModal** cho popup
- **Transcript Container** hiển thị kết quả

---

## 🌤️ Tính năng Weather

### 🔧 Cấu hình
- **API:** OpenWeatherMap
- **City:** Ho Chi Minh City
- **Language:** vi (Tiếng Việt)
- **Units:** metric (°C)

### 📊 Dữ liệu hiển thị
- Nhiệt độ hiện tại
- Min/Max nhiệt độ
- Mô tả thời tiết
- Dự báo 3 ngày
- Icons thời tiết tùy chỉnh

---

## 🔐 Authentication & Security

### 🎫 JWT Authentication
- **Strategy:** Passport JWT
- **Expiry:** 30 days
- **Header:** `Authorization: Bearer <token>`

### 🔒 User Roles
```typescript
type UserRole = 'admin' | 'user' | 'elderly' | 'relative';
```

### 🛡️ Security Features
- Password hashing (bcrypt)
- JWT token validation
- Role-based access control
- Premium middleware/guards

---

## 📊 State Management

### 🔄 Context Pattern

#### AuthContext
```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials) => Promise<boolean>;
  register: (userData) => Promise<boolean>;
  logout: () => Promise<void>;
}
```

#### PremiumContext
```typescript
interface PremiumContextType {
  plans: PremiumPlan[];
  premiumStatus: PremiumStatus | null;
  selectedPlan: PremiumPlan | null;
  purchasePremium: (planId, paymentMethod) => Promise<any>;
  fetchPremiumStatus: () => Promise<void>;
}
```

#### VoiceContext
```typescript
interface VoiceContextType {
  isListening: boolean;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  results: string[];
  error: string | null;
}
```

---

## 🎨 UI/UX Design Principles

### 🎯 Apple-like Design Philosophy

#### 1. **Tối giản (Minimalism)**
- Loại bỏ các elements không cần thiết
- Focus vào content chính
- Clean và spacious layout

#### 2. **Intuitive Navigation**
- Clear navigation hierarchy
- Consistent behavior patterns
- Gesture-friendly interactions

#### 3. **Premium Feel**
- Gradient backgrounds
- Subtle shadows và elevation
- Smooth animations
- High-quality icons

#### 4. **Accessibility for Elderly**
- Large buttons (min 60px)
- High contrast colors
- Simple language
- Voice control support

### 🎨 Color Scheme
```css
/* Primary Colors */
--primary-blue: #007AFF
--primary-gradient: linear-gradient(135deg, #007AFF, #5856D6)

/* Status Colors */
--success: #34C759
--warning: #FF9500
--error: #FF3B30

/* Neutral Colors */
--background: #F2F2F7
--surface: #FFFFFF
--text-primary: #1C1C1E
--text-secondary: #8E8E93
```

---

## 🚀 Development Workflow

### 📝 Git Workflow
```bash
# Feature development
git checkout -b feature/premium-payment
git add .
git commit -m "feat: add premium payment flow"
git push origin feature/premium-payment

# Code review & merge to main
git checkout main
git pull origin main
git merge feature/premium-payment
git push origin main
```

### 🧪 Testing Strategy
```bash
# Backend testing
cd vg_backend
yarn test                    # Unit tests
yarn test:e2e               # E2E tests
yarn premium:check          # Lint + Format + Test

# Frontend testing
cd viegrandApp
yarn test                   # Jest tests
yarn lint                   # ESLint
```

### 📦 Build & Deployment

#### Backend Production
```bash
cd vg_backend
yarn build
yarn start:prod
```

#### Frontend Build
```bash
cd viegrandApp

# Android Release
yarn android --mode=release

# iOS Release (macOS only)
yarn ios --mode=Release
```

---

## 🔧 Troubleshooting

### 🚨 Common Issues

#### Backend Issues
```bash
# Port already in use
lsof -ti:3000 | xargs kill -9

# Dependencies issues
rm -rf node_modules yarn.lock
yarn install

# Environment variables
cp .env.example .env
# Cấu hình API keys và secrets
```

#### Frontend Issues
```bash
# Metro bundler cache
yarn start --reset-cache

# Android build issues
cd android
./gradlew clean
cd ..
yarn android

# iOS build issues (macOS)
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
yarn ios
```

#### Common React Native Issues
```bash
# Flipper issues
yarn android --no-flipper

# Voice permission issues
# Kiểm tra AndroidManifest.xml và Info.plist
# Đảm bảo có RECORD_AUDIO permission
```

---

## 📈 Performance Optimization

### ⚡ Frontend Optimization
- **React.memo()** cho components static
- **useCallback/useMemo** cho expensive operations
- **FlatList optimization** với getItemLayout
- **Image optimization** với react-native-fast-image
- **Bundle splitting** với dynamic imports

### 🚀 Backend Optimization
- **Database indexing** (khi implement real DB)
- **Caching strategy** với Redis
- **API rate limiting**
- **Compression middleware**
- **Health checks** và monitoring

---

## 🎯 Roadmap & Future Features

### 🔜 Phase 1 (Completed ✅)
- [x] Basic authentication
- [x] Premium subscription system
- [x] Payment flow (mock)
- [x] Voice recognition
- [x] Weather integration
- [x] Multi-role navigation

### 🚧 Phase 2 (In Progress)
- [ ] Real payment gateway integration
- [ ] Push notifications
- [ ] Offline support
- [ ] Health tracking features
- [ ] Video calling

### 🎯 Phase 3 (Planned)
- [ ] AI health assistant
- [ ] Medication reminders
- [ ] Emergency contacts
- [ ] Family dashboard
- [ ] Analytics và reporting

---

## 📚 References & Documentation

### 🔗 Official Documentation
- [React Native](https://reactnative.dev/docs/getting-started)
- [NestJS](https://docs.nestjs.com/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [React Native Voice](https://github.com/react-native-voice/voice)

### 🎨 Design Resources
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design](https://material.io/design)
- [React Native Elements](https://reactnativeelements.com/)

### 🛠️ Development Tools
- [Flipper](https://fbflipper.com/) - Mobile app debugger
- [Postman](https://www.postman.com/) - API testing
- [VS Code](https://code.visualstudio.com/) - Code editor
- [Android Studio](https://developer.android.com/studio) - Android development

---

## 👥 Team & Contribution

### 📝 Code Style Guidelines
- **TypeScript strict mode**
- **ESLint + Prettier** formatting
- **Conventional commits** pattern
- **Component-based architecture**
- **Clean code principles**

### 🤝 Contribution Process
1. Fork repository
2. Create feature branch
3. Implement changes
4. Write tests
5. Submit pull request
6. Code review
7. Merge to main

---

## 📞 Support & Contact

### 🆘 Getting Help
- **Issues:** GitHub Issues
- **Documentation:** Này file README
- **API Docs:** http://localhost:3000/api-docs

### 📧 Contact Information
- **Project:** VieGrand App
- **Version:** 1.0.0
- **Last Updated:** 2024

---

*📝 Ghi chú: File documentation này được cập nhật liên tục. Vui lòng kiểm tra version mới nhất trên repository.* 