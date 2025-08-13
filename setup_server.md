# Kiểm tra process đang sử dụng cổng 3000
netstat -tulpn | grep :3000

# Kill process đang sử dụng cổng 3000
sudo fuser -k 3000/tcp

# Hoặc tìm PID và kill cụ thể
lsof -ti:3000 | xargs kill -9

# Kiểm tra backend đã chạy chưa
curl http://localhost:3000