# Hướng dẫn sử dụng tính năng Tin tức và Đánh giá sản phẩm

## 🆕 Tính năng mới đã được thêm

### 1. Hệ thống Tin tức
- **Trang tin tức công khai**: `/news.html`
- **Chi tiết tin tức**: `/news-detail.html?slug=slug-bai-viet`
- **Quản lý tin tức (Admin)**: `/admin/manage-news.html`

### 2. Hệ thống Đánh giá sản phẩm
- **Đánh giá trên trang chi tiết sản phẩm**: `/product-detail.html?id=product_id`
- **Điều kiện đánh giá**: Chỉ khách hàng đã mua và trong vòng 3 ngày sau khi đơn hàng hoàn thành

## 📊 Cập nhật Database

### Bảng mới được thêm:
1. **`tin_tuc`** - Quản lý bài viết tin tức
2. **`danh_gia_san_pham`** - Cập nhật với điều kiện đánh giá mới

### Chạy script SQL:
```sql
-- Chạy file sql/orianna_shop_db.sql để cập nhật database
```

## 🔧 API Endpoints mới

### Tin tức:
- `GET /api/news` - Lấy danh sách tin tức
- `GET /api/news/:slug` - Chi tiết tin tức
- `GET /api/news/admin/all` - Admin: Lấy tất cả tin tức
- `POST /api/news/admin` - Admin: Tạo tin tức mới
- `PUT /api/news/admin/:id` - Admin: Cập nhật tin tức
- `DELETE /api/news/admin/:id` - Admin: Xóa tin tức

### Đánh giá:
- `GET /api/reviews/product/:productId` - Lấy đánh giá sản phẩm
- `GET /api/reviews/can-review/:productId` - Kiểm tra quyền đánh giá
- `POST /api/reviews` - Tạo đánh giá mới
- `PUT /api/reviews/:id` - Cập nhật đánh giá
- `DELETE /api/reviews/:id` - Xóa đánh giá

## 🎯 Tính năng Tin tức

### Cho Admin:
1. **Tạo bài viết mới**:
   - Tiêu đề, slug, tóm tắt, nội dung HTML
   - Hình ảnh đại diện
   - Trạng thái: Bản nháp / Đã xuất bản / Ẩn

2. **Quản lý bài viết**:
   - Xem danh sách tất cả bài viết
   - Lọc theo trạng thái
   - Chỉnh sửa, xóa bài viết
   - Xem trước bài viết

### Cho người dùng:
1. **Xem tin tức**:
   - Danh sách bài viết với phân trang
   - Chi tiết bài viết với tăng lượt xem
   - Bài viết liên quan
   - Sidebar với bài viết phổ biến

## ⭐ Tính năng Đánh giá sản phẩm

### Điều kiện đánh giá:
1. **Phải đăng nhập**
2. **Đã mua sản phẩm** (đơn hàng hoàn thành)
3. **Trong vòng 3 ngày** sau khi đơn hàng hoàn thành
4. **Chưa đánh giá** sản phẩm đó trước đây

### Tính năng:
1. **Thống kê đánh giá**:
   - Điểm trung bình
   - Phân bố theo số sao
   - Tổng số đánh giá

2. **Form đánh giá**:
   - Chọn đơn hàng đã mua
   - Đánh giá 1-5 sao
   - Viết nhận xét

3. **Hiển thị đánh giá**:
   - Danh sách đánh giá với phân trang
   - Thông tin người đánh giá
   - Ngày đánh giá

## 🚀 Cách sử dụng

### 1. Cập nhật Database:
```bash
# Import file SQL mới
mysql -u username -p orianna_shop_db < sql/orianna_shop_db.sql
```

### 2. Khởi động server:
```bash
cd backend
npm start
```

### 3. Truy cập các trang:
- **Tin tức**: http://localhost:3000/news.html
- **Admin tin tức**: http://localhost:3000/admin/manage-news.html
- **Chi tiết sản phẩm với đánh giá**: http://localhost:3000/product-detail.html?id=1

## 📝 Lưu ý quan trọng

### Tin tức:
- Slug phải unique
- Nội dung hỗ trợ HTML
- Hình ảnh lưu trong `/backend/image/news/`

### Đánh giá:
- Mỗi khách hàng chỉ đánh giá 1 lần cho 1 sản phẩm trong 1 đơn hàng
- Thời hạn đánh giá: 3 ngày sau khi đơn hàng hoàn thành
- Trạng thái đơn hàng phải là "Đã hoàn thành" (trang_thai_don_hang_id = 4)

## 🔒 Bảo mật

### Tin tức:
- Chỉ Admin mới có thể tạo/sửa/xóa tin tức
- Kiểm tra quyền truy cập với JWT token

### Đánh giá:
- Kiểm tra quyền sở hữu đơn hàng
- Kiểm tra thời hạn đánh giá
- Chống duplicate đánh giá

## 🎨 Giao diện

### Responsive design:
- Tương thích mobile, tablet, desktop
- Sử dụng Tailwind CSS
- Icons từ Font Awesome

### UX/UI:
- Form validation
- Loading states
- Error handling
- Success messages

Chúc bạn sử dụng thành công! 🎉