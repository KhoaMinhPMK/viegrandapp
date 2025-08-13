---
noteId: "9a1b89505ae211f0b0ec09724aff3663"
tags: []

---

# VieGrand Backend

Backend API cho ứng dụng VieGrand được xây dựng bằng NestJS với Swagger API.

## Mô tả

VieGrand Backend cung cấp các API cần thiết cho ứng dụng VieGrand, bao gồm:
- Quản lý người dùng
- Xác thực và phân quyền
- Quản lý thông báo
- Và nhiều tính năng khác...

## Cài đặt

```bash
# Cài đặt các gói phụ thuộc
yarn install
```

## Chạy ứng dụng

```bash
# Chế độ phát triển
yarn start:dev

# Chế độ sản phẩm
yarn start:prod
```

## API Documentation

Khi ứng dụng đang chạy, bạn có thể truy cập tài liệu API Swagger tại:
```
http://localhost:3000/api-docs
```

## Cấu trúc dự án

```
src/
├── app.controller.ts       # Bộ điều khiển chính
├── app.module.ts           # Module chính
├── app.service.ts          # Dịch vụ chính
├── main.ts                 # Điểm khởi đầu ứng dụng
├── users/                  # Module người dùng
│   ├── dto/                # Các đối tượng truyền dữ liệu
│   ├── entities/           # Các thực thể
│   ├── users.controller.ts # Bộ điều khiển người dùng  
│   ├── users.module.ts     # Module người dùng
│   └── users.service.ts    # Dịch vụ người dùng
└── ... (các module khác)
```

## Các tính năng

- Xác thực JWT
- Swagger API Documentation
- API RESTful
- Xử lý lỗi
- Bảo mật dữ liệu

## Công nghệ sử dụng

- [NestJS](https://nestjs.com/) - Framework Node.js
- [TypeScript](https://www.typescriptlang.org/) - Ngôn ngữ lập trình
- [Swagger](https://swagger.io/) - API Documentation
- [Yarn](https://yarnpkg.com/) - Quản lý gói
