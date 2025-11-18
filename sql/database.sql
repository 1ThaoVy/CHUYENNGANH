-- Thiết lập mã hóa ký tự UTF8 cho kết nối
SET NAMES 'utf8mb4';
SET CHARACTER SET 'utf8mb4';
SET FOREIGN_KEY_CHECKS = 0; -- Tắt kiểm tra khóa ngoại tạm thời để tránh lỗi khi tạo/sửa bảng

-- 1. TẠO CƠ SỞ DỮ LIỆU
CREATE DATABASE IF NOT EXISTS `orianna_shop_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `orianna_shop_db`;

-- ----------------------------------------------------
-- 2. TẠO CÁC BẢNG
-- ----------------------------------------------------

-- Bảng 1: NGUOI_DUNG (Khách hàng và Admin)
CREATE TABLE `nguoi_dung` (
    `nguoi_dung_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID Người dùng/Khách hàng',
    `ho_ten` VARCHAR(100) NOT NULL COMMENT 'Họ và tên đầy đủ',
    `email` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Email (Tên đăng nhập)',
    `mat_khau_hash` VARCHAR(255) NOT NULL COMMENT 'Mật khẩu đã được mã hóa',
    `so_dien_thoai` VARCHAR(20) COMMENT 'Số điện thoại',
    `dia_chi` VARCHAR(255) COMMENT 'Địa chỉ giao hàng mặc định',
    `vai_tro` ENUM('khach_hang', 'admin') NOT NULL DEFAULT 'khach_hang' COMMENT 'Phân quyền',
    `trang_thai` ENUM('kich_hoat', 'vo_hieu') NOT NULL DEFAULT 'kich_hoat' COMMENT 'Trạng thái tài khoản',
    `ngay_tao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày giờ đăng ký'
) COMMENT='Bảng thông tin Người dùng/Khách hàng';
CREATE INDEX idx_user_email ON `nguoi_dung`(email);

-- Bảng 2: DANH_MUC (Thương hiệu/Hãng)
CREATE TABLE `danh_muc` (
    `danh_muc_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID Danh mục/Thương hiệu',
    `ten_danh_muc` VARCHAR(100) NOT NULL COMMENT 'Tên Thương hiệu',
    `mo_ta` TEXT COMMENT 'Mô tả về thương hiệu',
    `slug` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Đường dẫn'
) COMMENT='Bảng quản lý Thương hiệu/Hãng nước hoa';

-- Bảng 3: SAN_PHAM (Sản phẩm Nước hoa)
CREATE TABLE `san_pham` (
    `san_pham_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID Sản phẩm',
    `danh_muc_id` INT COMMENT 'ID Danh mục/Thương hiệu',
    `ten_san_pham` VARCHAR(255) NOT NULL COMMENT 'Tên nước hoa',
    `mo_ta` TEXT COMMENT 'Mô tả chi tiết sản phẩm',
    `gia_ban` DECIMAL(10, 2) NOT NULL COMMENT 'Đơn giá bán',
    `so_luong_ton` INT NOT NULL DEFAULT 0 COMMENT 'Số lượng tồn kho',
    `dung_tich` VARCHAR(50) COMMENT 'Dung tích/Phiên bản',
    `url_hinh_anh_chinh` VARCHAR(255) COMMENT 'Đường dẫn đến hình ảnh chính',
    `trang_thai_hien_thi` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Trạng thái hiển thị',
    `ngay_tao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày thêm sản phẩm',
    FOREIGN KEY (`danh_muc_id`) REFERENCES `danh_muc`(`danh_muc_id`)
) COMMENT='Bảng thông tin Sản phẩm nước hoa';

-- Bảng 4: TRANG_THAI_DON_HANG 
CREATE TABLE `trang_thai_don_hang` (
    `trang_thai_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID Trạng thái',
    `ten_trang_thai` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Tên trạng thái (ví dụ: Đang xử lý)',
    `mo_ta` VARCHAR(255) COMMENT 'Mô tả chi tiết trạng thái',
    `ma_mau_sac` VARCHAR(10) COMMENT 'Mã màu sắc hiển thị'
) COMMENT='Bảng chuẩn hóa các trạng thái của Đơn hàng';

-- Bảng 5: DON_HANG (Đơn hàng)
CREATE TABLE `don_hang` (
    `don_hang_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID Đơn hàng/Mã hóa đơn',
    `nguoi_dung_id` INT COMMENT 'ID Khách hàng đặt',
    `trang_thai_don_hang_id` INT NOT NULL COMMENT 'Trạng thái hiện tại của đơn hàng',
    `ngay_dat_hang` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày giờ đặt hàng',
    `ten_nguoi_nhan` VARCHAR(100) NOT NULL COMMENT 'Tên người nhận',
    `sdt_nguoi_nhan` VARCHAR(20) NOT NULL COMMENT 'SĐT người nhận',
    `dia_chi_giao_hang` VARCHAR(255) NOT NULL COMMENT 'Địa chỉ giao hàng',
    `tong_tien` DECIMAL(10, 2) NOT NULL COMMENT 'Tổng tiền cuối cùng',
    `phuong_thuc_thanh_toan` VARCHAR(50) NOT NULL COMMENT 'Phương thức thanh toán',
    FOREIGN KEY (`nguoi_dung_id`) REFERENCES `nguoi_dung`(`nguoi_dung_id`),
    FOREIGN KEY (`trang_thai_don_hang_id`) REFERENCES `trang_thai_don_hang`(`trang_thai_id`)
) COMMENT='Bảng thông tin Đơn hàng';
CREATE INDEX idx_dh_trang_thai ON `don_hang`(`trang_thai_don_hang_id`);

-- Bảng 6: CHI_TIET_DON_HANG (Chi tiết Đơn hàng)
CREATE TABLE `chi_tiet_don_hang` (
    `chi_tiet_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID Chi tiết đơn hàng',
    `don_hang_id` INT,
    `san_pham_id` INT,
    `so_luong` INT NOT NULL COMMENT 'Số lượng sản phẩm đã mua',
    `don_gia_tai_thoi_diem` DECIMAL(10, 2) NOT NULL COMMENT 'Đơn giá tại thời điểm đặt hàng',
    `thanh_tien` DECIMAL(10, 2) NOT NULL COMMENT 'Thành tiền',
    FOREIGN KEY (`don_hang_id`) REFERENCES `don_hang`(`don_hang_id`),
    FOREIGN KEY (`san_pham_id`) REFERENCES `san_pham`(`san_pham_id`)
) COMMENT='Bảng chi tiết các sản phẩm trong Đơn hàng';

-- Bảng 7: LICH_SU_CHAT (Lịch sử Trò chuyện Chatbot)
CREATE TABLE `lich_su_chat` (
    `log_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID Log chat',
    `nguoi_dung_id` INT COMMENT 'ID Khách hàng (Nếu đã đăng nhập)',
    `session_id` VARCHAR(100) COMMENT 'ID Phiên trò chuyện',
    `loai_nguoi_gui` ENUM('nguoi_dung', 'bot') NOT NULL COMMENT 'Người gửi tin nhắn',
    `noi_dung` TEXT COMMENT 'Nội dung tin nhắn',
    `thoi_gian` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm gửi tin nhắn',
    FOREIGN KEY (`nguoi_dung_id`) REFERENCES `nguoi_dung`(`nguoi_dung_id`)
) COMMENT='Lưu trữ lịch sử trò chuyện với Chatbot';

-- Bảng 8: DANH_GIA_SAN_PHAM (Đánh giá Sản phẩm)
CREATE TABLE `danh_gia_san_pham` (
    `danh_gia_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID Đánh giá',
    `san_pham_id` INT COMMENT 'ID Sản phẩm được đánh giá',
    `nguoi_dung_id` INT COMMENT 'ID Khách hàng đánh giá',
    `xep_hang` TINYINT NOT NULL COMMENT 'Số sao (1 đến 5)',
    `binh_luan` TEXT COMMENT 'Nội dung bình luận',
    `ngay_tao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày giờ tạo đánh giá',
    FOREIGN KEY (`san_pham_id`) REFERENCES `san_pham`(`san_pham_id`),
    FOREIGN KEY (`nguoi_dung_id`) REFERENCES `nguoi_dung`(`nguoi_dung_id`)
) COMMENT='Lưu trữ đánh giá và xếp hạng sản phẩm';

-- Bảng 9: MA_GIAM_GIA (Mã Giảm giá)
CREATE TABLE `ma_giam_gia` (
    `ma_giam_gia_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID Mã giảm giá',
    `ma_code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Mã Code',
    `loai_giam_gia` ENUM('phan_tram', 'tien_mat') NOT NULL COMMENT 'Loại giảm giá',
    `gia_tri` DECIMAL(10, 2) NOT NULL COMMENT 'Giá trị giảm',
    `ap_dung_toi_thieu` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Giá trị đơn hàng tối thiểu',
    `so_luong_con_lai` INT DEFAULT NULL COMMENT 'Số lần sử dụng còn lại',
    `ngay_bat_dau` DATETIME NOT NULL,
    `ngay_ket_thuc` DATETIME,
    `trang_thai` ENUM('active', 'inactive') NOT NULL DEFAULT 'active' COMMENT 'Trạng thái mã giảm giá'
) COMMENT='Quản lý các mã giảm giá, khuyến mãi';

-- Bảng 10: LICH_SU_SU_DUNG_MA_GIAM_GIA
CREATE TABLE `lich_su_su_dung_ma_giam_gia` (
    `ls_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID Lịch sử',
    `don_hang_id` INT NOT NULL UNIQUE COMMENT 'Đơn hàng đã sử dụng mã',
    `ma_giam_gia_id` INT NOT NULL COMMENT 'Mã giảm giá đã dùng',
    `gia_tri_giam_thuc_te` DECIMAL(10, 2) NOT NULL COMMENT 'Số tiền thực tế được giảm',
    `ngay_su_dung` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`don_hang_id`) REFERENCES `don_hang`(`don_hang_id`),
    FOREIGN KEY (`ma_giam_gia_id`) REFERENCES `ma_giam_gia`(`ma_giam_gia_id`)
) COMMENT='Lưu trữ lịch sử sử dụng Mã giảm giá';

-- Bảng 11: ALBUM_ANH (Quản lý Album Ảnh)
CREATE TABLE `album_anh` (
    `album_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID Album',
    `ten_album` VARCHAR(100) NOT NULL COMMENT 'Tên Album',
    `slug` VARCHAR(100) NOT NULL UNIQUE,
    `mo_ta` TEXT COMMENT 'Mô tả mục đích của Album'
) COMMENT='Quản lý các nhóm ảnh trên hệ thống';

-- Bảng 12: CHI_TIET_ANH (Chi tiết Ảnh)
CREATE TABLE `chi_tiet_anh` (
    `anh_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID Ảnh',
    `album_id` INT COMMENT 'ID Album chứa ảnh',
    `tieu_de` VARCHAR(150) COMMENT 'Tiêu đề ảnh',
    `url_day_du` VARCHAR(255) NOT NULL COMMENT 'Đường dẫn tuyệt đối của ảnh',
    `vi_tri` INT COMMENT 'Thứ tự hiển thị',
    `trang_thai_hien_thi` BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (`album_id`) REFERENCES `album_anh`(`album_id`)
) COMMENT='Chi tiết từng hình ảnh trong Album';

-- ----------------------------------------------------
-- 4. CHÈN DỮ LIỆU MẪU BAN ĐẦU
-- ----------------------------------------------------

-- 4.1. Chèn dữ liệu vào DANH_MUC
INSERT INTO `danh_muc` (`danh_muc_id`, `ten_danh_muc`, `mo_ta`, `slug`) VALUES
(1, 'Chanel', 'Thương hiệu nước hoa Pháp cổ điển và sang trọng.', 'chanel'),
(2, 'Dior', 'Thương hiệu nước hoa với phong cách quyến rũ và thanh lịch.', 'dior'),
(3, 'Le Labo', 'Thương hiệu nước hoa thủ công, tập trung vào các nốt hương tối giản và chất lượng cao.', 'le-labo'),
(4, 'Calvin Klein', 'Thương hiệu nước hoa hiện đại, trẻ trung và unisex.', 'calvin-klein'),
(5, 'Gucci', 'Thương hiệu nước hoa Ý với thiết kế độc đáo và hương thơm thời thượng.', 'gucci');

-- 4.2. Chèn dữ liệu vào TRANG_THAI_DON_HANG
INSERT INTO `trang_thai_don_hang` (`trang_thai_id`, `ten_trang_thai`, `mo_ta`, `ma_mau_sac`) VALUES
(1, 'Chờ xử lý', 'Đơn hàng mới tạo, chờ Admin kiểm tra.', '#FFCC00'),
(2, 'Đã xác nhận', 'Admin đã xác nhận đơn hàng, chờ giao cho Vận chuyển.', '#0099CC'),
(3, 'Đang giao hàng', 'Đơn hàng đang trên đường giao đến khách hàng.', '#66CCFF'),
(4, 'Đã hoàn thành', 'Đơn hàng đã giao thành công và thanh toán xong.', '#33CC33'),
(5, 'Đã hủy', 'Đơn hàng bị hủy.', '#CC3300');

-- 4.3. Chèn dữ liệu vào NGUOI_DUNG
INSERT INTO `nguoi_dung` (`ho_ten`, `email`, `mat_khau_hash`, `so_dien_thoai`, `dia_chi`, `vai_tro`) VALUES
('Admin Orianna', 'admin@orianna.vn', 'HASH_CUA_MAT_KHAU_ADMIN_123456', '0901112222', '123 Đường Quản Trị, TP.HCM', 'admin'),
('Khách Hàng Thân Thiết', 'khachhang@gmail.com', 'HASH_CUA_MAT_KHAU_KH', '0919998888', '456 Lê Lợi, Hà Nội', 'khach_hang');

-- 4.4. Chèn dữ liệu vào SAN_PHAM (75 sản phẩm)
INSERT INTO `san_pham` (`danh_muc_id`, `ten_san_pham`, `mo_ta`, `gia_ban`, `so_luong_ton`, `dung_tich`, `url_hinh_anh_chinh`) VALUES
-- Chanel (ID: 1)
(1, 'Chanel N°5 Eau de Parfum', 'Hương thơm biểu tượng, cổ điển và sang trọng.', 4500000.00, 50, '100ml EDP', '/images/chanel_no5.jpg'),
(1, 'Chanel Coco Mademoiselle', 'Hương hoa cỏ phương Đông, tươi mát và gợi cảm.', 4200000.00, 45, '100ml EDP', '/images/chanel_coco.jpg'),
(1, 'Chanel Bleu de Chanel', 'Hương gỗ thơm, mạnh mẽ, nam tính và tinh tế.', 3800000.00, 60, '150ml EDP', '/images/chanel_bleu.jpg'),
(1, 'Chanel Chance Eau Tendre', 'Hương hoa quả tươi tắn, nhẹ nhàng và nữ tính.', 3500000.00, 55, '50ml EDT', '/images/chanel_chance.jpg'),
(1, 'Chanel Allure Homme Sport', 'Hương tươi mát, năng động và quyến rũ.', 3900000.00, 40, '100ml EDT', '/images/chanel_allure.jpg'),
(1, 'Chanel Gabrielle Essence', 'Hương hoa trắng rạng rỡ và lấp lánh.', 4300000.00, 35, '50ml EDP', '/images/chanel_gabrielle.jpg'),
(1, 'Chanel Paris-Biarritz', 'Hương thơm tươi mới, cảm hứng từ bờ biển.', 3100000.00, 30, '125ml EDT', '/images/chanel_biarritz.jpg'),
(1, 'Chanel Platinum Egoiste', 'Hương thơm dương xỉ và gỗ, thanh lịch.', 3600000.00, 25, '75ml EDT', '/images/chanel_egoiste.jpg'),
(1, 'Chanel N°19 Poudré', 'Hương phấn, xanh mát, sang trọng và quý phái.', 4100000.00, 20, '100ml EDP', '/images/chanel_no19.jpg'),
(1, 'Chanel Coromandel', 'Hương gỗ phương Đông, sâu lắng và bí ẩn.', 5000000.00, 15, '75ml EDP', '/images/chanel_coromandel.jpg'),
(1, 'Chanel N°5 L’Eau', 'Phiên bản hiện đại, nhẹ nhàng hơn của N°5.', 4000000.00, 40, '50ml EDT', '/images/chanel_n5leau.jpg'),
(1, 'Chanel Misia', 'Hương phấn son, gợi nhớ không khí nhà hát.', 4800000.00, 10, '75ml EDP', '/images/chanel_misia.jpg'),
(1, 'Chanel Sycomore', 'Hương cỏ Vetiver khói, mạnh mẽ và tinh tế.', 5100000.00, 12, '100ml EDP', '/images/chanel_sycomore.jpg'),
(1, 'Chanel Chance Eau Fraîche', 'Hương hoa cỏ Chype, tươi mát và tràn đầy sức sống.', 3700000.00, 33, '100ml EDT', '/images/chanel_fresh.jpg'),
(1, 'Chanel Pour Monsieur', 'Hương cam chanh Chype, cổ điển và nam tính.', 4600000.00, 18, '75ml EDT', '/images/chanel_pm.jpg'),

-- Dior (ID: 2)
(2, 'Dior Sauvage Eau de Parfum', 'Hương cam chanh và ambroxan, nam tính và hoang dã.', 3600000.00, 70, '100ml EDP', '/images/dior_sauvage.jpg'),
(2, 'Miss Dior Blooming Bouquet', 'Hương hoa cỏ nhẹ nhàng, tinh tế và lãng mạn.', 3300000.00, 65, '50ml EDT', '/images/dior_missdior.jpg'),
(2, 'Dior Homme Intense', 'Hương hoa diên vĩ (Iris) và gỗ, ấm áp và quyến rũ.', 4000000.00, 50, '100ml EDP', '/images/dior_homme.jpg'),
(2, 'Jadore Eau de Parfum', 'Hương hoa trắng lộng lẫy, nữ tính và sang trọng.', 3700000.00, 48, '75ml EDP', '/images/dior_jadore.jpg'),
(2, 'Dior Fève Délicieuse', 'Hương đậu Tonka, vani và hổ phách, ngọt ngào và ấm cúng.', 5500000.00, 20, '125ml EDP', '/images/dior_feve.jpg'),
(2, 'Dior Hypnotic Poison', 'Hương hạnh nhân, vani, bí ẩn và cực kỳ gợi cảm.', 3400000.00, 38, '50ml EDT', '/images/dior_poison.jpg'),
(2, 'Dior Cologne Royale', 'Hương cam chanh, tươi mát và quý tộc.', 4500000.00, 25, '125ml Cologne', '/images/dior_cologne.jpg'),
(2, 'Dior Spice Blend', 'Hương gia vị ấm áp, mạnh mẽ và độc đáo.', 5200000.00, 15, '75ml EDP', '/images/dior_spice.jpg'),
(2, 'Dior Joy Eau de Parfum', 'Hương hoa cỏ và xạ hương, tươi sáng và hạnh phúc.', 3200000.00, 42, '90ml EDP', '/images/dior_joy.jpg'),
(2, 'Dior Bois D’Argent', 'Hương diên vĩ, xạ hương và gỗ, thanh thoát và tao nhã.', 6000000.00, 10, '250ml EDP', '/images/dior_bois.jpg'),
(2, 'Dior Eau Sauvage', 'Hương cam chanh Chype, cổ điển và nam tính.', 3500000.00, 30, '100ml EDT', '/images/dior_eausauvage.jpg'),
(2, 'Dior Ambre Nuit', 'Hương hổ phách và hoa hồng, phương Đông nồng nàn.', 5800000.00, 8, '75ml EDP', '/images/dior_ambrenuit.jpg'),
(2, 'Miss Dior Eau de Parfum (2021)', 'Hương hoa hồng Centifolia, mới mẻ và rực rỡ.', 3800000.00, 52, '50ml EDP', '/images/dior_missdior2021.jpg'),
(2, 'Dior Balade Sauvage', 'Hương sung, tươi mát và thư giãn.', 4700000.00, 18, '125ml EDP', '/images/dior_balade.jpg'),
(2, 'Dior Vanilla Diorama', 'Hương vani, cacao và cam, ấm áp và gourmand.', 5900000.00, 5, '100ml EDP', '/images/dior_vanilla.jpg'),

-- Le Labo (ID: 3)
(3, 'Le Labo Santal 33', 'Hương gỗ đàn hương, bạch đậu khấu, khói và da thuộc.', 4800000.00, 80, '100ml EDP', '/images/lelabo_santal33.jpg'),
(3, 'Le Labo Rose 31', 'Hương hoa hồng, gỗ tuyết tùng và thì là, unisex độc đáo.', 4600000.00, 75, '50ml EDP', '/images/lelabo_rose31.jpg'),
(3, 'Le Labo Another 13', 'Hương ambroxan, xạ hương, sạch sẽ và gây nghiện.', 4900000.00, 60, '100ml EDP', '/images/lelabo_another13.jpg'),
(3, 'Le Labo Bergamote 22', 'Hương cam bergamot, bưởi, tươi mát và sống động.', 4500000.00, 55, '50ml EDP', '/images/lelabo_bergamote.jpg'),
(3, 'Le Labo Thé Noir 29', 'Hương trà đen, lá sung và thuốc lá khô.', 4700000.00, 50, '100ml EDP', '/images/lelabo_thenoir.jpg'),
(3, 'Le Labo Vetiver 46', 'Hương cỏ vetiver, gỗ tuyết tùng và gia vị.', 4400000.00, 40, '50ml EDP', '/images/lelabo_vetiver46.jpg'),
(3, 'Le Labo Patchouli 24', 'Hương hoắc hương, khói và vani, bí ẩn.', 5100000.00, 30, '100ml EDP', '/images/lelabo_patchouli24.jpg'),
(3, 'Le Labo Lys 41', 'Hương hoa huệ, hoa nhài và vani, nữ tính.', 4600000.00, 35, '50ml EDP', '/images/lelabo_lys41.jpg'),
(3, 'Le Labo Ambre 8', 'Hương hổ phách ấm áp và sâu lắng.', 5000000.00, 25, '100ml EDP', '/images/lelabo_ambre8.jpg'),
(3, 'Le Labo Baie Rose 26 (City Exclusive)', 'Hương tiêu hồng và hoa hồng.', 8000000.00, 10, '50ml EDP', '/images/lelabo_baierose.jpg'),
(3, 'Le Labo Tonka 25', 'Hương đậu tonka, gỗ tuyết tùng và xạ hương.', 4900000.00, 20, '100ml EDP', '/images/lelabo_tonka25.jpg'),
(3, 'Le Labo Ylang 49', 'Hương hoa Ylang-Ylang, rêu sồi và hoắc hương.', 4700000.00, 15, '50ml EDP', '/images/lelabo_ylang49.jpg'),
(3, 'Le Labo Iris 39', 'Hương hoa diên vĩ, hoắc hương và xạ hương.', 4850000.00, 18, '100ml EDP', '/images/lelabo_iris39.jpg'),
(3, 'Le Labo Fleur D’Oranger 27', 'Hương hoa cam, chanh và xạ hương.', 4550000.00, 22, '50ml EDP', '/images/lelabo_fleur.jpg'),
(3, 'Le Labo Cedrat 37 (City Exclusive)', 'Hương chanh, gừng và hổ phách.', 8200000.00, 7, '100ml EDP', '/images/lelabo_cedrat37.jpg'),

-- Calvin Klein (ID: 4)
(4, 'CK One', 'Hương cam chanh aromatic, unisex, sạch sẽ và tươi mát.', 1200000.00, 100, '200ml EDT', '/images/ck_one.jpg'),
(4, 'CK Eternity For Men', 'Hương hoa cỏ tươi mát, nam tính và cổ điển.', 1500000.00, 90, '100ml EDT', '/images/ck_eternitym.jpg'),
(4, 'CK Euphoria For Women', 'Hương hoa quả phương Đông, gợi cảm và bí ẩn.', 1800000.00, 85, '100ml EDP', '/images/ck_euphoria.jpg'),
(4, 'CK Obsession For Men', 'Hương hổ phách ấm, cay và phương Đông.', 1600000.00, 70, '125ml EDT', '/images/ck_obsessionm.jpg'),
(4, 'CK Be', 'Hương hoa cỏ xạ hương, unisex, nhẹ nhàng và thư giãn.', 1100000.00, 95, '200ml EDT', '/images/ck_be.jpg'),
(4, 'CK Downtown', 'Hương hoa cỏ gỗ xạ hương, hiện đại và nữ tính.', 1400000.00, 65, '90ml EDP', '/images/ck_downtown.jpg'),
(4, 'CK Escape For Women', 'Hương biển, hoa cúc, tươi mát và tự do.', 1350000.00, 50, '100ml EDP', '/images/ck_escape.jpg'),
(4, 'CK Free For Men', 'Hương gỗ aromatic, tươi mới và giản dị.', 1450000.00, 45, '100ml EDT', '/images/ck_free.jpg'),
(4, 'CK Eternity Air For Women', 'Hương ozonic, hoa cỏ, nhẹ nhàng như không khí.', 1700000.00, 35, '50ml EDP', '/images/ck_airw.jpg'),
(4, 'CK Truth For Men', 'Hương gỗ aromatic, xanh mát và tự nhiên.', 1550000.00, 30, '100ml EDT', '/images/ck_truth.jpg'),
(4, 'CK Reveal For Women', 'Hương muối, gỗ đàn hương, gợi cảm và ấm áp.', 1900000.00, 25, '100ml EDP', '/images/ck_reveal.jpg'),
(4, 'CK Contradiction For Men', 'Hương cam chanh, gia vị, nam tính và mạnh mẽ.', 1750000.00, 20, '100ml EDT', '/images/ck_contradiction.jpg'),
(4, 'CK IN2U For Her', 'Hương cam chanh phương Đông, trẻ trung và năng động.', 1250000.00, 75, '150ml EDT', '/images/ck_in2u.jpg'),
(4, 'CK Deep Euphoria', 'Hương hoa hồng đen, gợi cảm và sâu lắng.', 1850000.00, 40, '75ml EDP', '/images/ck_deepeuphoria.jpg'),
(4, 'CK Eternity Summer Daze', 'Phiên bản mùa hè, tươi mát và rực rỡ.', 1400000.00, 60, '100ml EDT', '/images/ck_sumdaze.jpg'),

-- Gucci (ID: 5)
(5, 'Gucci Bloom Eau de Parfum', 'Hương hoa huệ, hoa nhài, trắng và rực rỡ.', 3500000.00, 60, '100ml EDP', '/images/gucci_bloom.jpg'),
(5, 'Gucci Guilty Pour Homme', 'Hương gỗ aromatic, nam tính, hiện đại và quyến rũ.', 3200000.00, 55, '90ml EDP', '/images/gucci_guiltym.jpg'),
(5, 'Gucci Flora Gorgeous Gardenia', 'Hương hoa dành dành, lê, ngọt ngào và nữ tính.', 3300000.00, 70, '50ml EDP', '/images/gucci_flora.jpg'),
(5, 'Gucci Mémoire d''une Odeur', 'Hương hoa cúc La Mã, khoáng chất, unisex.', 3000000.00, 45, '100ml EDP', '/images/gucci_memoire.jpg'),
(5, 'Gucci The Alchemist’s Garden A Midnight Stroll', 'Hương khói, gỗ tuyết tùng, bí ẩn và sang trọng.', 7500000.00, 10, '100ml EDP', '/images/gucci_midnight.jpg'),
(5, 'Gucci Guilty Pour Femme', 'Hương hoa cỏ phương Đông, quyến rũ và lãng mạn.', 3400000.00, 40, '50ml EDP', '/images/gucci_guiltyw.jpg'),
(5, 'Gucci Pour Homme II', 'Hương trà đen, gỗ và gia vị, ấm áp và thanh lịch.', 3600000.00, 30, '100ml EDT', '/images/gucci_ph2.jpg'),
(5, 'Gucci Envy Me', 'Hương hoa quả tươi mát, nữ tính và rạng rỡ.', 2900000.00, 25, '50ml EDT', '/images/gucci_envyme.jpg'),
(5, 'Gucci Rush', 'Hương hoa cỏ phương Đông, ấn tượng và táo bạo.', 3100000.00, 20, '75ml EDT', '/images/gucci_rush.jpg'),
(5, 'Gucci The Voice of the Snake', 'Hương da thuộc, hoắc hương, mạnh mẽ và hoang dã.', 7800000.00, 8, '100ml EDP', '/images/gucci_snake.jpg'),
(5, 'Gucci Made to Measure', 'Hương gia vị, hổ phách, nam tính và tinh tế.', 3300000.00, 35, '90ml EDT', '/images/gucci_mtm.jpg'),
(5, 'Gucci Bloom Ambrosia Di Fiori', 'Phiên bản Intense của Bloom, hương hoa huệ nồng nàn hơn.', 3700000.00, 28, '50ml EDP', '/images/gucci_ambrosia.jpg'),
(5, 'Gucci Acqua di Fiori', 'Hương lá Galbanum, xanh mát và tươi mới.', 3050000.00, 38, '100ml EDT', '/images/gucci_acquadifiori.jpg'),
(5, 'Gucci Guilty Black Pour Homme', 'Hương Lavender và hoắc hương, mãnh liệt.', 3150000.00, 42, '90ml EDT', '/images/gucci_blackm.jpg'),
(5, 'Gucci Guilty Absolute Pour Homme', 'Hương da thuộc và gỗ, hiện đại và khô ráo.', 3800000.00, 15, '50ml EDP', '/images/gucci_absolute.jpg');

-- Bật lại kiểm tra khóa ngoại
SET FOREIGN_KEY_CHECKS = 1;