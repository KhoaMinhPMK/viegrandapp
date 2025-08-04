# Tính năng Gọi Khẩn cấp

## Tổng quan
Tính năng gọi khẩn cấp cho phép người dùng cao tuổi nhanh chóng gọi điện đến số khẩn cấp đã được cài đặt sẵn trong trường hợp cần thiết.

## Các thành phần chính

### 1. EmergencyCallService (`src/services/emergencyCall.ts`)
- **Chức năng**: Quản lý logic gọi khẩn cấp
- **Tính năng**:
  - Kiểm tra quyền gọi điện (Android)
  - Gọi trực tiếp bằng native module (Android)
  - Xác nhận trước khi gọi
  - Lưu trữ và cập nhật số khẩn cấp
  - Xử lý lỗi

### 2. EmergencyCallButton (`src/components/elderly-home/EmergencyCallButton.tsx`)
- **Chức năng**: Nút gọi khẩn cấp trong grid chức năng
- **Thiết kế**: Màu đỏ nổi bật, kích thước lớn hơn các nút khác

### 3. FloatingEmergencyButton (`src/components/elderly-home/FloatingEmergencyButton.tsx`)
- **Chức năng**: Nút gọi khẩn cấp nổi trên màn hình chính
- **Vị trí**: Góc dưới bên phải màn hình
- **Thiết kế**: Hình tròn, màu đỏ, shadow nổi bật

### 4. EmergencyCallSettingsScreen (`src/screens/Elderly/Settings/EmergencyCallSettingsScreen.tsx`)
- **Chức năng**: Màn hình cài đặt số khẩn cấp
- **Tính năng**:
  - Thay đổi số điện thoại khẩn cấp
  - Thay đổi tên liên hệ
  - Thử gọi để kiểm tra
  - Lưu cài đặt vào AsyncStorage

## Luồng hoạt động

### 1. Khởi tạo
```typescript
// Trong Home screen
useEffect(() => {
  emergencyCallService.initialize(); // Load cài đặt từ AsyncStorage
}, []);
```

### 2. Gọi khẩn cấp
1. Người dùng nhấn nút gọi khẩn cấp
2. Kiểm tra quyền gọi điện (Android)
3. Hiển thị dialog xác nhận với thông tin số
4. Nếu xác nhận → Gọi trực tiếp (Android) hoặc mở app gọi (iOS)
5. Nếu từ chối → Hủy bỏ

### 3. Cài đặt số khẩn cấp
1. Vào Settings → Khẩn cấp → Cài đặt số khẩn cấp
2. Nhập tên liên hệ và số điện thoại
3. Có thể thử gọi để kiểm tra
4. Lưu cài đặt

## Cấu hình

### Android Permissions
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.CALL_PHONE" />
<uses-permission android:name="android.permission.ANSWER_PHONE_CALLS" />
```

### Số mặc định
- **Số khẩn cấp mặc định**: `0902716951`
- **Tên mặc định**: "Số khẩn cấp"

## Lưu trữ dữ liệu

### AsyncStorage Keys
- `emergency_number`: Số điện thoại khẩn cấp
- `emergency_name`: Tên liên hệ khẩn cấp

## UX/UI Considerations

### Thiết kế nút khẩn cấp
- **Màu sắc**: Đỏ (#FF3B30) để dễ nhận biết
- **Kích thước**: Lớn hơn các nút thông thường
- **Vị trí**: Dễ tiếp cận, không bị che khuất
- **Shadow**: Tạo hiệu ứng nổi bật

### Xác nhận trước khi gọi
- Hiển thị tên liên hệ và số điện thoại
- Nút "Hủy" và "Gọi ngay" rõ ràng
- Màu đỏ cho nút "Gọi ngay" để nhấn mạnh

### Xử lý lỗi
- Kiểm tra quyền trước khi gọi
- Thông báo lỗi rõ ràng
- Hướng dẫn cấp quyền nếu cần

## Tính năng nâng cao (Có thể phát triển thêm)

### 1. Gửi vị trí tự động
```typescript
const sendLocationWithCall = async (phoneNumber: string) => {
  Geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;
      Linking.openURL(`sms:${phoneNumber}?body=Vị trí khẩn cấp: ${latitude},${longitude}`);
    }
  );
};
```

### 2. Danh sách số khẩn cấp
- Nhiều số khẩn cấp khác nhau
- Phân loại: Gia đình, Y tế, Công cộng
- Chọn số mặc định

### 3. Lịch sử cuộc gọi khẩn cấp
- Lưu lại các cuộc gọi khẩn cấp
- Thời gian, số điện thoại, kết quả

### 4. Tự động gọi sau SMS
- Gửi SMS với vị trí trước
- Tự động gọi sau 2-3 giây

## Testing

### Test Cases
1. **Gọi thành công**: Nhấn nút → Xác nhận → Gọi
2. **Từ chối quyền**: Hiển thị thông báo hướng dẫn
3. **Thiết bị không hỗ trợ**: Hiển thị thông báo lỗi
4. **Cài đặt số**: Thay đổi số → Lưu → Test gọi
5. **Thử gọi**: Chức năng test trong màn hình cài đặt

### Test Scenarios
- Thiết bị có SIM/không có SIM
- Thiết bị có quyền/không có quyền
- Mạng yếu/không có mạng
- App background/foreground

## Bảo mật và Quyền riêng tư

### Quyền cần thiết
- `CALL_PHONE`: Chỉ cho Android
- iOS không cần quyền đặc biệt

### Dữ liệu lưu trữ
- Số điện thoại khẩn cấp: Lưu local
- Không gửi lên server
- Chỉ người dùng có thể thay đổi

## Troubleshooting

### Lỗi thường gặp
1. **"Không thể thực hiện cuộc gọi"**
   - Kiểm tra quyền CALL_PHONE
   - Kiểm tra thiết bị có hỗ trợ gọi không

2. **"Quyền bị từ chối"**
   - Hướng dẫn vào Settings → Apps → Permissions
   - Hoặc mở Settings app trực tiếp

3. **Số không đúng định dạng**
   - Kiểm tra format số điện thoại
   - Thêm mã quốc gia nếu cần

### Debug
```typescript
// Kiểm tra quyền
const hasPermission = await PermissionsAndroid.request(
  PermissionsAndroid.PERMISSIONS.CALL_PHONE
);

// Kiểm tra hỗ trợ gọi
const canCall = await Linking.canOpenURL(`tel:${phoneNumber}`);
``` 