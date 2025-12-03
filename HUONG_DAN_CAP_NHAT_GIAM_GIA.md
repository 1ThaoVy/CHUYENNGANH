# Hướng dẫn cập nhật tính năng giảm giá

## Các thay đổi đã thực hiện:

### 1. Database (SQL)
- Thêm 2 cột mới vào bảng `san_pham`:
  - `gia_goc`: Giá gốc trước khi giảm
  - `phan_tram_giam`: Phần trăm giảm giá (0-100)

### 2. Backend API
- Cập nhật `productController.js`:
  - Thêm filter `giam_gia=true` để lọc sản phẩm giảm giá
  - Thêm sort `giam_gia` để sắp xếp theo % giảm giá

### 3. Frontend

#### Trang chủ (index.html + home.js)
- Hiển thị sản phẩm giảm giá theo từng thương hiệu
- Mỗi thương hiệu hiển thị tối đa 4 sản phẩm giảm giá
- Badge đỏ hiển thị % giảm giá
- Hiển thị giá gốc (gạch ngang) và giá giảm (màu đỏ)

#### Trang sản phẩm (products.html + products.js)
- Thêm checkbox "Chỉ sản phẩm giảm giá"
- Thêm option sắp xếp "Giảm giá nhiều nhất"
- Hiển thị badge giảm giá và giá gốc/giá giảm

#### Trang chi tiết (product-detail.html)
- Hiển thị badge giảm giá
- Hiển thị giá gốc (gạch ngang) và giá giảm (màu đỏ)

## Cách chạy:

### Bước 1: Cập nhật Database
```bash
# Chạy script SQL để thêm cột mới và cập nhật dữ liệu mẫu
mysql -u root -p orianna_shop_db < sql/update_discount.sql
```

### Bước 2: Khởi động lại server (nếu đang chạy)
```bash
cd backend
npm start
```

### Bước 3: Mở trình duyệt
- Trang chủ: http://localhost:3001/index.html
- Trang sản phẩm: http://localhost:3001/products.html

## Cách thêm sản phẩm giảm giá mới:

### Qua SQL:
```sql
UPDATE san_pham 
SET gia_goc = 5000000.00, 
    gia_ban = 4000000.00, 
    phan_tram_giam = 20 
WHERE san_pham_id = 10;
```

### Qua Admin Panel:
- Vào trang quản lý sản phẩm
- Chỉnh sửa sản phẩm
- Nhập giá gốc, giá bán và % giảm giá

## Sản phẩm giảm giá mẫu đã thêm:

### Chanel (4 sản phẩm):
- Chanel N°5 Eau de Parfum: 4,500,000đ → 3,150,000đ (-30%)
- Chanel Coco Mademoiselle: 4,200,000đ → 2,940,000đ (-30%)
- Chanel Bleu de Chanel: 3,800,000đ → 2,660,000đ (-30%)
- Chanel Chance Eau Tendre: 3,500,000đ → 2,450,000đ (-30%)

### Dior (4 sản phẩm):
- Dior Sauvage: 3,600,000đ → 2,520,000đ (-30%)
- Miss Dior Blooming Bouquet: 3,300,000đ → 2,310,000đ (-30%)
- Dior Homme Intense: 4,000,000đ → 2,800,000đ (-30%)
- J'adore: 3,700,000đ → 2,590,000đ (-30%)

### Le Labo (4 sản phẩm):
- Santal 33: 4,800,000đ → 3,360,000đ (-30%)
- Rose 31: 4,600,000đ → 3,220,000đ (-30%)
- Another 13: 4,900,000đ → 3,430,000đ (-30%)
- Bergamote 22: 4,500,000đ → 3,150,000đ (-30%)

### Calvin Klein (4 sản phẩm):
- CK One: 1,200,000đ → 840,000đ (-30%)
- Eternity: 1,500,000đ → 1,050,000đ (-30%)
- Euphoria: 1,800,000đ → 1,260,000đ (-30%)
- Obsession: 1,600,000đ → 1,120,000đ (-30%)

### Gucci (4 sản phẩm):
- Bloom: 3,500,000đ → 2,450,000đ (-30%)
- Guilty Pour Homme: 3,200,000đ → 2,240,000đ (-30%)
- Flora: 3,300,000đ → 2,310,000đ (-30%)
- Mémoire d'une Odeur: 3,000,000đ → 2,100,000đ (-30%)

## Ghi chú:
- Tổng cộng 20 sản phẩm giảm giá 30% từ 5 thương hiệu
- Mỗi thương hiệu có 4 sản phẩm giảm giá
- Trang chủ hiển thị tất cả 4 sản phẩm giảm giá của mỗi thương hiệu
