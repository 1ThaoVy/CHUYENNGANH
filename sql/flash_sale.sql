-- Mở rộng bảng ma_giam_gia để hỗ trợ Flash Sale
ALTER TABLE `ma_giam_gia` 
ADD COLUMN `loai_khuyen_mai` ENUM('ma_giam_gia', 'flash_sale') NOT NULL DEFAULT 'ma_giam_gia' COMMENT 'Loại khuyến mãi',
ADD COLUMN `tieu_de_flash_sale` VARCHAR(255) NULL COMMENT 'Tiêu đề Flash Sale',
ADD COLUMN `mo_ta_flash_sale` TEXT NULL COMMENT 'Mô tả Flash Sale',
ADD COLUMN `mau_nen_flash_sale` VARCHAR(100) NULL COMMENT 'Màu nền Flash Sale',
ADD COLUMN `hien_thi_banner` BOOLEAN DEFAULT FALSE COMMENT 'Hiển thị banner trên trang chủ';

-- Tạo bảng liên kết Flash Sale với sản phẩm
CREATE TABLE `flash_sale_san_pham` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `ma_giam_gia_id` INT NOT NULL COMMENT 'ID Flash Sale',
    `san_pham_id` INT NOT NULL COMMENT 'ID Sản phẩm',
    `gia_flash_sale` DECIMAL(10,2) NOT NULL COMMENT 'Giá Flash Sale',
    `so_luong_gioi_han` INT DEFAULT NULL COMMENT 'Số lượng giới hạn',
    `so_luong_da_ban` INT DEFAULT 0 COMMENT 'Số lượng đã bán',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`ma_giam_gia_id`) REFERENCES `ma_giam_gia`(`ma_giam_gia_id`) ON DELETE CASCADE,
    FOREIGN KEY (`san_pham_id`) REFERENCES `san_pham`(`san_pham_id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_flash_sale_product` (`ma_giam_gia_id`, `san_pham_id`)
) COMMENT='Liên kết Flash Sale với sản phẩm';

-- Thêm dữ liệu Flash Sale mẫu
INSERT INTO `ma_giam_gia` (
    `ma_code`, 
    `loai_giam_gia`, 
    `gia_tri`, 
    `ap_dung_toi_thieu`, 
    `so_luong_con_lai`, 
    `ngay_bat_dau`, 
    `ngay_ket_thuc`, 
    `trang_thai`,
    `loai_khuyen_mai`,
    `tieu_de_flash_sale`,
    `mo_ta_flash_sale`,
    `mau_nen_flash_sale`,
    `hien_thi_banner`
) VALUES (
    'FLASH9H', 
    'phan_tram', 
    30.00, 
    0.00, 
    NULL, 
    NOW(), 
    DATE_ADD(NOW(), INTERVAL 9 HOUR), 
    'active',
    'flash_sale',
    '🔥 FLASH SALE 9H',
    'Giảm giá sốc trong 9 tiếng - Nhanh tay kẻo lỡ!',
    'gradient-to-r from-red-500 to-pink-600',
    TRUE
);

-- Lấy ID của Flash Sale vừa tạo và thêm sản phẩm
SET @flash_sale_id = LAST_INSERT_ID();

-- Thêm một số sản phẩm vào Flash Sale (các sản phẩm đang giảm giá 30%)
INSERT INTO `flash_sale_san_pham` (`ma_giam_gia_id`, `san_pham_id`, `gia_flash_sale`, `so_luong_gioi_han`) VALUES
(@flash_sale_id, 1, 2450000, 20),  -- Chanel N°5
(@flash_sale_id, 2, 2240000, 15),  -- Chanel Coco Mademoiselle  
(@flash_sale_id, 3, 2100000, 25),  -- Chanel Bleu de Chanel
(@flash_sale_id, 4, 1890000, 18),  -- Chanel Chance Eau Tendre
(@flash_sale_id, 16, 2100000, 22), -- Dior Sauvage
(@flash_sale_id, 17, 1890000, 20), -- Miss Dior Blooming Bouquet
(@flash_sale_id, 18, 2240000, 15), -- Dior Homme Intense
(@flash_sale_id, 19, 2100000, 18); -- J'adore Eau de Parfum