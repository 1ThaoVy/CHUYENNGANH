# Orianna Shop Frontend

Frontend website bán nước hoa với HTML, CSS, JavaScript và Tailwind CSS.

## Cấu trúc thư mục

```
frontend/
├── index.html              # Trang chủ
├── products.html           # Danh sách sản phẩm
├── product-detail.html     # Chi tiết sản phẩm
├── login.html              # Đăng nhập
├── register.html           # Đăng ký
├── cart.html               # Giỏ hàng
├── checkout.html           # Thanh toán
├── orders.html             # Danh sách đơn hàng
├── order-detail.html       # Chi tiết đơn hàng
└── js/
    ├── config.js           # Cấu hình API
    ├── auth.js             # Xác thực người dùng
    ├── cart.js             # Quản lý giỏ hàng
    ├── home.js             # Trang chủ
    └── products.js         # Danh sách sản phẩm
```

## Chạy website

### Cách 1: Mở trực tiếp file HTML
Mở file `index.html` bằng trình duyệt

### Cách 2: Dùng Live Server (khuyến nghị)
```bash
# Cài đặt Live Server (nếu chưa có)
npm install -g live-server

# Chạy trong thư mục frontend
live-server
```

### Cách 3: Dùng Python HTTP Server
```bash
# Python 3
python -m http.server 8000

# Mở http://localhost:8000
```

## Tính năng

- ✅ Xem danh sách sản phẩm, lọc theo thương hiệu, sắp xếp
- ✅ Xem chi tiết sản phẩm
- ✅ Đăng ký, đăng nhập
- ✅ Thêm vào giỏ hàng
- ✅ Đặt hàng
- ✅ Xem danh sách đơn hàng
- ✅ Xem chi tiết đơn hàng

## Lưu ý

- Backend API phải chạy ở `http://localhost:3001`
- Dữ liệu giỏ hàng lưu trong localStorage
- Token đăng nhập lưu trong localStorage
