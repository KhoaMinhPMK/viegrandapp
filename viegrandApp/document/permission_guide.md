# Hướng dẫn cấp quyền gọi điện

## Vấn đề thường gặp

Khi sử dụng tính năng gọi khẩn cấp, bạn có thể gặp thông báo "Quyền gọi điện bị từ chối". Đây là hướng dẫn chi tiết để cấp quyền.

## Cách cấp quyền trên Android

### Phương pháp 1: Thông qua ứng dụng
1. Khi thấy thông báo "Quyền gọi điện bị từ chối"
2. Nhấn "Mở Cài đặt"
3. Tìm và chọn "ViegrandApp"
4. Chọn "Quyền" hoặc "Permissions"
5. Bật "Gọi điện thoại" hoặc "Phone"
6. Bật "Trả lời cuộc gọi" hoặc "Answer phone calls"

### Phương pháp 2: Thủ công
1. Mở **Cài đặt** trên điện thoại
2. Tìm **Ứng dụng** hoặc **Apps**
3. Tìm và chọn **ViegrandApp**
4. Chọn **Quyền** hoặc **Permissions**
5. Tìm **Gọi điện thoại** hoặc **Phone** và bật
6. Tìm **Trả lời cuộc gọi** hoặc **Answer phone calls** và bật

### Phương pháp 3: Tìm kiếm
1. Mở **Cài đặt**
2. Nhấn vào ô tìm kiếm (biểu tượng kính lúp)
3. Gõ "ViegrandApp"
4. Chọn ứng dụng
5. Chọn **Quyền**
6. Bật **Gọi điện thoại** và **Trả lời cuộc gọi**

## Cách cấp quyền trên iOS

Trên iOS, quyền gọi điện được cấp tự động khi bạn nhấn nút gọi. Không cần cấu hình thêm.

## Kiểm tra trạng thái quyền

### Trong ứng dụng
1. Vào **Cài đặt** trong app
2. Chọn **Khẩn cấp**
3. Xem trạng thái hiển thị:
   - ✅ **Quyền gọi điện đã được cấp** (màu xanh)
   - ⚠️ **Cần cấp quyền gọi điện** (màu cam)

### Trong hệ thống Android
1. Mở **Cài đặt** > **Ứng dụng** > **ViegrandApp**
2. Chọn **Quyền**
3. Kiểm tra **Gọi điện thoại** có được bật không

## Troubleshooting

### Không thấy quyền "Gọi điện thoại"
- Đây là quyền "dangerous permission" trong Android
- Chỉ xuất hiện khi app đã request quyền này
- Nếu không thấy, hãy thử gọi khẩn cấp một lần để trigger request

### Quyền bị từ chối vĩnh viễn
1. Vào **Cài đặt** > **Ứng dụng** > **ViegrandApp**
2. Chọn **Quyền**
3. Tìm **Gọi điện thoại**
4. Nếu thấy "Không hỏi lại", hãy:
   - Gỡ cài đặt app
   - Cài đặt lại app
   - Hoặc reset quyền trong Developer Options

### App không thể gọi điện
1. Kiểm tra thiết bị có SIM không
2. Kiểm tra mạng di động có hoạt động không
3. Thử gọi thủ công để kiểm tra
4. Kiểm tra quyền đã được cấp chưa

## Lưu ý bảo mật

### Quyền này được sử dụng để:
- Gọi khẩn cấp khi cần thiết
- Không gọi tự động
- Không gọi đến số lạ
- Chỉ gọi đến số đã cài đặt

### Bạn có thể:
- Tắt quyền bất cứ lúc nào
- Thay đổi số khẩn cấp
- Kiểm tra lịch sử cuộc gọi

## Hỗ trợ

Nếu vẫn gặp vấn đề, hãy:
1. Kiểm tra phiên bản Android/iOS
2. Thử khởi động lại thiết bị
3. Liên hệ hỗ trợ kỹ thuật

## Các quyền khác của app

### Quyền đã cấp:
- **Internet**: Kết nối mạng
- **Camera**: Chụp ảnh (nếu có)
- **Microphone**: Ghi âm (nếu có)
- **Storage**: Lưu trữ dữ liệu

### Quyền không cần thiết:
- **Vị trí**: Chưa sử dụng
- **Danh bạ**: Chưa sử dụng
- **SMS**: Chưa sử dụng 