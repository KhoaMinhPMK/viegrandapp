---
noteId: "eb53c890567e11f091a517b9db91ae54"
tags: []

---

# Cấu trúc thư mục src - VieGrand App

## Tổng quan
Dự án React Native này sử dụng cấu trúc thư mục rõ ràng và có tổ chức để dễ dàng bảo trì và phát triển.

## Cấu trúc thư mục

```
src/
├── assets/          # Hình ảnh, fonts, icons và các tài nguyên tĩnh
├── common/          # Các file dùng chung, config chung
├── components/      # Các component tái sử dụng được
├── constants/       # Các hằng số của ứng dụng
├── contexts/        # React Context providers
├── hooks/           # Custom React hooks
├── navigation/      # Cấu hình navigation/routing
├── screens/         # Các màn hình của ứng dụng
├── services/        # API calls, external services
├── styles/          # Styling chung, themes
├── types/           # TypeScript type definitions
└── utils/           # Utility functions, helpers
```

## Hướng dẫn sử dụng

### Components
- Đặt các component tái sử dụng được vào thư mục `components/`
- Mỗi component nên có thư mục riêng với file index.ts

### Screens
- Mỗi màn hình của ứng dụng được đặt trong `screens/`
- Có thể tổ chức theo modules/features

### Services
- API calls và các dịch vụ bên ngoài
- HTTP client configuration

### Utils
- Các hàm tiện ích, helpers
- Validation functions
- Date/time utilities

### Types
- TypeScript type definitions
- Interface definitions
- API response types 



đây là project chính của tôi@package.json , còn đây là project phụ @package.json , đầu tiên tiên bạn hãy đọc  @/src của appviegrand, tôi đã copy folder đó sang project react native voice rồi, bây giờ bạn hãy làm đường dẫn và navigation đồ các kiểu cho nó chạy đươc src đó, và bỏ cái chức năng giọng nói cũ đi, sau đó thêm cái chức năng giọng nói của project chính vào cái UI giọng nói của project cũ, bạn hiểu chứ . lưu ý không đụng tới folder android những cái liên quan đến phiên bảng này nọ, chỉ bổ sung những cái còn thiếu, còn những phiên bản nào đã có ở project chính rồi là không sửa nữa"# viegrandapp" 
"# viegrandapp" 
