---
noteId: "ef020f406a2111f0a208d3669e331098"
tags: []

---

# Lộ Trình Triển Khai Chức Năng Thông Báo

Tài liệu này phác thảo các bước cần thiết để xây dựng một hệ thống thông báo toàn diện cho ứng dụng, bao gồm cả thông báo real-time khi người dùng đang mở app và thông báo đẩy (push notification) khi người dùng chạy nền hoặc đã đóng app.

---

## Phần 1: Thông Báo Real-time (Khi App Đang Mở)

**Mục tiêu:** Gửi thông báo ngay lập tức trong ứng dụng (in-app notifications) bằng cách sử dụng server Node.js và Socket.IO hiện có.

### **Bước 1.1: Nâng Cấp Server Node.js (`server.js`)**

1.  **Thêm Middleware để Parse JSON:**
    *   Thêm `app.use(express.json());` để server có thể đọc được dữ liệu JSON gửi từ PHP.

2.  **Tạo Secret Key:**
    *   Định nghĩa một hằng số `NOTIFY_SECRET` để làm khóa bảo mật chung giữa PHP và Node.js.

3.  **Quản lý User-Socket Map:**
    *   Tạo một object `userSockets = {};` để lưu trữ mối quan hệ giữa số điện thoại của người dùng và `socket.id` của họ.

4.  **Triển Khai Logic Đăng Ký (Register):**
    *   Tạo sự kiện `socket.on('register', (phone) => { ... });`.
    *   Khi người dùng kết nối và gửi sự kiện `register`, lưu cặp `phone: socket.id` vào `userSockets`.

5.  **Xử lý Ngắt kết nối:**
    *   Trong sự kiện `socket.on('disconnect', () => { ... });`, tìm và xóa người dùng ra khỏi `userSockets` dựa trên `socket.id`.

6.  **Tạo Endpoint `/notify`:**
    *   Tạo một route `app.post('/notify', (req, res) => { ... });`.
    *   Route này sẽ nhận `to_phone`, `payload`, và `secret` từ PHP.
    *   Kiểm tra `secret` key. Nếu không hợp lệ, trả về lỗi 403.
    *   Tìm `socket.id` tương ứng với `to_phone` trong `userSockets`.
    *   Nếu tìm thấy, dùng `io.to(socketId).emit('notification', payload);` để gửi thông báo đến đúng người dùng.
    *   Nếu không tìm thấy, trả về lỗi 404.

### **Bước 1.2: Tích hợp vào Backend PHP**

1.  **Tạo Hàm Helper `send_socket_notification`:**
    *   Trong `backend/config.php`, viết một hàm chung `send_socket_notification($to_phone, $payload)`.
    *   Hàm này sẽ sử dụng `cURL` để gửi một `POST` request đến `http://<your_node_server_ip>:3000/notify`.
    *   Dữ liệu gửi đi phải là JSON, bao gồm `to_phone`, `payload`, và `secret` key đã định nghĩa ở Bước 1.1.
    *   Thêm ghi log `error_log()` để debug kết quả của cURL request.

2.  **Gọi Hàm Helper từ Logic Nghiệp vụ:**
    *   Trong các file xử lý sự kiện (ví dụ: `backend/request_friend.php`), sau khi một hành động thành công (như `INSERT` vào DB), hãy gọi hàm `send_socket_notification`.
    *   Ví dụ: `send_socket_notification($toPhone, $notification_payload);`.
    *   `$notification_payload` là một mảng PHP chứa các thông tin như `type`, `title`, `body`, `data`.

### **Bước 1.3: Tích hợp vào React Native App**

1.  **Tạo `SocketContext`:**
    *   Tạo file `src/contexts/SocketContext.tsx`.
    *   Provider của context này sẽ quản lý vòng đời của socket connection.

2.  **Kết nối và Đăng ký:**
    *   Trong `SocketProvider`, sử dụng `useEffect` để kết nối đến server Socket.IO khi người dùng đã đăng nhập (lấy thông tin `user.phone` từ `AuthContext`).
    *   Sau khi kết nối thành công (`socket.on('connect', ...)`), `emit` sự kiện `register` với số điện thoại của người dùng.

3.  **Lắng nghe Thông báo:**
    *   Tạo một listener `socket.on('notification', (data) => { ... });`.
    *   Khi nhận được thông báo, cập nhật vào một state toàn cục (ví dụ: `notifications` array).

4.  **Bọc Ứng dụng:**
    *   Trong `App.tsx`, bọc `NavigationContainer` hoặc toàn bộ app bên trong `<SocketProvider>`.

5.  **Hiển thị Thông báo:**
    *   Tạo một custom hook `useSocket()` để các component khác có thể truy cập `notifications` và `notificationCount`.
    *   Sử dụng hook này trong các component UI (như Tab Bar, icon chuông) để hiển thị badge thông báo.

---

## Phần 2: Thông Báo Đẩy (Khi App Chạy Nền/Đóng)

**Mục tiêu:** Đảm bảo người dùng vẫn nhận được thông báo quan trọng ngay cả khi không mở ứng dụng, sử dụng dịch vụ của Apple (APNs) và Google (FCM).

### **Bước 2.1: Cấu hình Dịch vụ Bên ngoài**

1.  **Firebase (cho Android):**
    *   Tạo một project mới trên Firebase Console.
    *   Thêm một "Android App" vào project, cung cấp package name `com.viegrandapp`.
    *   Tải file `google-services.json` về và đặt vào thư mục `android/app/`.
    *   Làm theo hướng dẫn của Firebase để thêm các dòng cấu hình vào file `build.gradle` (cấp project và cấp app).

2.  **Apple Developer (cho iOS):**
    *   Trong mục "Certificates, Identifiers & Profiles", tạo một "Key" mới cho dịch vụ APNs.
    *   Tải về file key có đuôi `.p8`.
    *   Trong Xcode, mở project, vào tab "Signing & Capabilities", nhấn `+ Capability` và thêm "Push Notifications".

### **Bước 2.2: Cập nhật Backend PHP**

1.  **Lưu Device Token:**
    *   Thêm một cột `device_token` (VARCHAR 255) vào bảng `user`.
    *   (Tùy chọn nâng cao: Tạo bảng `devices` riêng để một user có thể có nhiều thiết bị).

2.  **Tạo Endpoint Lưu Token:**
    *   Tạo một file API mới, ví dụ: `backend/update_device_token.php`.
    *   API này nhận `email` và `token`, sau đó cập nhật token vào bảng `user`.

3.  **Tạo Hàm Helper `send_push_notification`:**
    *   Trong `config.php`, tạo hàm `send_push_notification($to_phone, $title, $body, $data)`.
    *   Bên trong hàm này:
        *   Query database để lấy `device_token` của `$to_phone`.
        *   Sử dụng một thư viện PHP (ví dụ: `kreait/firebase-php` cho FCM) hoặc viết cURL request trực tiếp đến API của FCM/APNs để gửi thông báo.

4.  **Cập nhật Logic Nghiệp vụ:**
    *   Trong các file như `request_friend.php`, gọi đồng thời cả `send_socket_notification` và `send_push_notification`.

### **Bước 2.3: Cập nhật React Native App**

1.  **Cài đặt Thư viện:**
    *   Chọn và cài đặt một thư viện push notification. Đề xuất: `@notifee/react-native` và `@react-native-firebase/app`, `@react-native-firebase/messaging`.
    *   Chạy `pod install` cho iOS.

2.  **Xin quyền và Lấy Token:**
    *   Trong `App.tsx` hoặc một file khởi tạo, viết logic để xin quyền nhận thông báo từ người dùng.
    *   Sau khi được cấp quyền, lấy device token từ Firebase/APNs.
    *   Gọi API `update_device_token.php` để gửi token này về server lưu trữ.

3.  **Xử lý Thông báo:**
    *   **Foreground Handler:** Cấu hình listener để xử lý thông báo khi app đang mở. Có thể chọn hiển thị một banner custom thay vì thông báo hệ thống.
    *   **Background Handler:** Cấu hình một hàm đặc biệt (thường ở file `index.js`) để xử lý thông báo khi app đang ở chế độ nền hoặc đã đóng.
    *   **Notification Tapped Handler:** Cấu hình sự kiện khi người dùng bấm vào thông báo để mở app và điều hướng đến màn hình tương ứng.

