# Cấu hình Môi trường - Environment Setup

## ⚠️ Bảo mật quan trọng

**KHÔNG BAO GIỜ commit API keys, passwords hoặc thông tin nhạy cảm vào git repository!**

## Cách cấu hình

### 1. Tạo file .env

Tạo file `.env` trong thư mục gốc của project:

```bash
# Copy file example
cp .env.example .env
```

### 2. Cấu hình biến môi trường

Mở file `.env` và điền thông tin thực tế:

```env
# Groq API Key - Lấy từ https://console.groq.com/
GROQ_API_KEY=your_actual_groq_api_key_here

# API Base URLs
API_BASE_URL=https://chat.viegrand.site
BACKEND_API_URL=https://viegrand.site/backend/
```

### 3. Cài đặt react-native-dotenv

```bash
yarn add react-native-dotenv
```

### 4. Cấu hình babel.config.js

Thêm plugin vào `babel.config.js`:

```javascript
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
      blacklist: null,
      whitelist: null,
      safe: false,
      allowUndefined: true
    }]
  ]
};
```

### 5. Cập nhật tsconfig.json

Thêm type definitions:

```json
{
  "compilerOptions": {
    "types": ["react-native-dotenv"]
  }
}
```

## Kiểm tra bảo mật

Trước khi commit, luôn kiểm tra:

1. File `.env` không có trong git status
2. Không có API keys trong code
3. Sử dụng `git secrets --scan` để kiểm tra

## Troubleshooting

Nếu gặp lỗi "secret detected", hãy:

1. Xóa commit chứa secret
2. Cập nhật .gitignore
3. Tạo lại file .env
4. Push lại code

## Liên hệ

Nếu cần hỗ trợ, hãy liên hệ team development.
