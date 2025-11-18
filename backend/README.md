# Orianna Shop Backend API

Backend API cho website bán nước hoa Orianna.

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Tạo file `.env` từ `.env.example` và cập nhật thông tin:
```bash
cp .env.example .env
```

3. Import database từ file `sql/database.sql` vào MySQL

4. Chạy server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user (cần token)

### Products
- `GET /api/products` - Lấy danh sách sản phẩm (có phân trang, lọc, tìm kiếm)
- `GET /api/products/:id` - Lấy chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm (Admin)
- `PUT /api/products/:id` - Cập nhật sản phẩm (Admin)
- `DELETE /api/products/:id` - Xóa sản phẩm (Admin)

### Categories
- `GET /api/categories` - Lấy danh sách danh mục
- `GET /api/categories/:id` - Lấy chi tiết danh mục

### Orders
- `POST /api/orders` - Tạo đơn hàng
- `GET /api/orders/my-orders` - Lấy đơn hàng của user
- `GET /api/orders/:id` - Lấy chi tiết đơn hàng
- `PUT /api/orders/:id/status` - Cập nhật trạng thái (Admin)

## Ví dụ sử dụng

### Đăng ký
```bash
POST /api/auth/register
{
  "ho_ten": "Nguyễn Văn A",
  "email": "test@example.com",
  "mat_khau": "123456",
  "so_dien_thoai": "0901234567",
  "dia_chi": "123 Đường ABC, TP.HCM"
}
```

### Đăng nhập
```bash
POST /api/auth/login
{
  "email": "test@example.com",
  "mat_khau": "123456"
}
```

### Lấy sản phẩm
```bash
GET /api/products?page=1&limit=12&danh_muc_id=1&search=chanel&sort=gia_thap
```

### Tạo đơn hàng
```bash
POST /api/orders
Headers: Authorization: Bearer <token>
{
  "ten_nguoi_nhan": "Nguyễn Văn A",
  "sdt_nguoi_nhan": "0901234567",
  "dia_chi_giao_hang": "123 Đường ABC, TP.HCM",
  "phuong_thuc_thanh_toan": "COD",
  "items": [
    { "san_pham_id": 1, "so_luong": 2 },
    { "san_pham_id": 3, "so_luong": 1 }
  ]
}
```
