# 🚀 Orianna Shop - Admin Guide

## 📋 Tình trạng dự án

### ✅ **Đã hoàn thành và hoạt động:**
- ✅ Server Backend (Node.js + Express)
- ✅ Database Connection (MySQL)
- ✅ API Products (GET/POST/PUT/DELETE)
- ✅ API Categories (GET/POST/PUT/DELETE) 
- ✅ API News (GET/POST/PUT/DELETE)
- ✅ API Flash Sale (GET/POST/PUT/DELETE)
- ✅ Admin Authentication
- ✅ Admin CRUD Functions

## 🌐 **URLs quan trọng:**

### **Main Dashboard:**
- **Admin Dashboard**: http://localhost:3001/admin-dashboard.html
- **Trang chủ**: http://localhost:3001/index.html

### **Admin Pages:**
- **Quản lý Sản phẩm**: http://localhost:3001/admin/manage-products.html
- **Quản lý Danh mục**: http://localhost:3001/admin/manage-categories.html  
- **Quản lý Tin tức**: http://localhost:3001/admin/manage-news.html
- **Quản lý Flash Sale**: http://localhost:3001/admin/manage-flash-sale.html

### **Test Pages:**
- **Test Admin Products**: http://localhost:3001/test-admin-products.html
- **Test All CRUD**: http://localhost:3001/test-admin.html
- **Simple API Test**: http://localhost:3001/test-simple.html

## 🔐 **Thông tin đăng nhập Admin:**
- **Email**: admin@orianna.com
- **Password**: admin123

## 🛠 **Cách khởi động dự án:**

### 1. **Khởi động Server:**
```bash
cd backend
node server.js
```

### 2. **Kiểm tra Server:**
- Server sẽ chạy tại: http://localhost:3001
- Kiểm tra health: http://localhost:3001/api/health

### 3. **Truy cập Admin:**
- Mở: http://localhost:3001/admin-dashboard.html
- Đăng nhập với thông tin admin ở trên

## 📊 **API Endpoints:**

### **Products:**
- `GET /api/products` - Lấy danh sách sản phẩm
- `POST /api/products` - Tạo sản phẩm mới (Admin)
- `PUT /api/products/:id` - Cập nhật sản phẩm (Admin)
- `DELETE /api/products/:id` - Xóa sản phẩm (Admin)

### **Categories:**
- `GET /api/categories` - Lấy danh sách danh mục
- `POST /api/categories` - Tạo danh mục mới (Admin)
- `PUT /api/categories/:id` - Cập nhật danh mục (Admin)
- `DELETE /api/categories/:id` - Xóa danh mục (Admin)

### **News:**
- `GET /api/news` - Lấy tin tức công khai
- `GET /api/news/admin/all` - Lấy tất cả tin tức (Admin)
- `POST /api/news/admin` - Tạo tin tức mới (Admin)
- `PUT /api/news/admin/:id` - Cập nhật tin tức (Admin)
- `DELETE /api/news/admin/:id` - Xóa tin tức (Admin)

### **Flash Sale:**
- `GET /api/flash-sale` - Lấy flash sale (Admin)
- `POST /api/flash-sale` - Tạo flash sale (Admin)
- `PUT /api/flash-sale/:id` - Cập nhật flash sale (Admin)
- `DELETE /api/flash-sale/:id` - Xóa flash sale (Admin)

## 🔧 **Troubleshooting:**

### **Nếu Server không chạy:**
1. Kiểm tra port 3001 có bị chiếm không:
   ```bash
   netstat -ano | findstr :3001
   ```
2. Dừng process nếu cần:
   ```bash
   taskkill /PID [PID_NUMBER] /F
   ```
3. Khởi động lại server

### **Nếu Database lỗi:**
1. Kiểm tra MySQL đang chạy
2. Kiểm tra thông tin kết nối trong `backend/.env`
3. Test connection:
   ```bash
   cd backend
   node test_db_connection.js
   ```

### **Nếu API lỗi:**
1. Kiểm tra server logs
2. Test API bằng test pages
3. Kiểm tra admin token (đăng nhập lại)

## 📝 **Ghi chú:**
- Tất cả chức năng CRUD đã được test và hoạt động
- Admin cần đăng nhập để sử dụng các chức năng POST/PUT/DELETE
- Database có sẵn 75 sản phẩm và 5 danh mục để test
- Các lỗi SQL đã được sửa và API hoạt động ổn định

## 🎯 **Next Steps:**
- Có thể thêm upload ảnh cho sản phẩm
- Thêm quản lý đơn hàng
- Thêm thống kê dashboard
- Cải thiện UI/UX admin panel