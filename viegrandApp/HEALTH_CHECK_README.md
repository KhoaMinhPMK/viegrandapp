# 🏥 Health Check Feature

## Tính năng mới: Kiểm tra sức khỏe bằng AI

### Mô tả
Tính năng cho phép người dùng chụp ảnh mới hoặc chọn ảnh có sẵn từ thư viện của máy đo huyết áp/nhịp tim và nhận kết quả phân tích tự động từ AI Groq.

### Cách sử dụng

#### 1. Truy cập tính năng
- Mở app → Màn hình chính
- Nhấn nút **"Sức khỏe"** trong FunctionGrid

#### 2. Chụp hoặc chọn ảnh
- **📸 Chụp ảnh mới:** Nhấn "Chụp ảnh" để chụp ảnh máy đo huyết áp/nhịp tim
- **🖼️ Chọn ảnh có sẵn:** Nhấn "Chọn ảnh" để chọn ảnh từ thư viện
- Đảm bảo ảnh rõ nét, đầy đủ thông tin

#### 3. Nhận kết quả
- AI sẽ phân tích và trả về 3 chỉ số:
  - 💓 **Huyết áp tâm thu** (mmHg)
  - 💔 **Huyết áp tâm trương** (mmHg)  
  - ❤️ **Nhịp tim** (bpm)

### Cấu trúc code

#### Files chính:
- `src/screens/Elderly/Health/HealthCheckScreen.tsx` - Màn hình chính
- `src/services/groqApi.ts` - API service gọi Groq
- `src/config/env.ts` - Cấu hình environment variables
- `src/navigation/ElderlyNavigator.tsx` - Navigation route

#### Permissions:
- **Android:** Camera, Storage permissions (READ_EXTERNAL_STORAGE)
- **iOS:** Camera, Photo Library permissions

### API Integration

#### Groq API Endpoint:
```
POST /api/groq-image-chat
Content-Type: application/json

{
  "apiKey": "gsk_...",
  "image": "base64_image_data"
}
```

#### Response Format:
```json
{
  "success": true,
  "data": {
    "huyet_ap_tam_thu": "120 mmHg",
    "huyet_ap_tam_truong": "80 mmHg", 
    "nhip_tim": "72 bpm"
  }
}
```

### Prompt AI:
```
Liệt kê các chỉ số trong máy đo huyết áp/nhịp tim. 
Trả về kết quả dưới dạng JSON với format chính xác như sau:
{
  "huyet_ap_tam_thu": "số lượng mmHg",
  "huyet_ap_tam_truong": "số lượng mmHg", 
  "nhip_tim": "số lượng bpm"
}
Chỉ trả về JSON, không có text khác.
```

### Dependencies:
- `react-native-image-picker` - Chụp ảnh và chọn từ thư viện
- `@react-native-async-storage/async-storage` - Lưu trữ

### Troubleshooting

#### Lỗi thường gặp:
1. **"Không thể mở camera"** → Kiểm tra camera permissions
2. **"Không thể mở thư viện ảnh"** → Kiểm tra storage permissions
2. **"Lỗi kết nối"** → Kiểm tra server và API key
3. **"Invalid API key"** → Cập nhật API key trong config

#### Debug:
- Xem log trong Metro bundler
- Kiểm tra network requests
- Verify API key format (phải bắt đầu bằng `gsk_`)

### Future Enhancements:
- [ ] Lưu lịch sử đo
- [ ] Export kết quả PDF
- [ ] Gửi kết quả cho bác sĩ
- [ ] Cảnh báo khi chỉ số bất thường
- [ ] Tích hợp với wearable devices 