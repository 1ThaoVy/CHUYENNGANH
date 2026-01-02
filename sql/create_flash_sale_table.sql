-- Tạo bảng flash_sale
CREATE TABLE flash_sale (
    flash_sale_id INT PRIMARY KEY AUTO_INCREMENT,
    tieu_de VARCHAR(255) NOT NULL,
    mo_ta TEXT,
    thoi_gian_bat_dau DATETIME NOT NULL,
    thoi_gian_ket_thuc DATETIME NOT NULL,
    trang_thai ENUM('active', 'inactive') DEFAULT 'active',
    mau_nen VARCHAR(50) DEFAULT 'gradient-to-r from-pink-500 to-purple-600',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tạo bảng flash_sale_san_pham để liên kết sản phẩm với flash sale
CREATE TABLE flash_sale_san_pham (
    id INT PRIMARY KEY AUTO_INCREMENT,
    flash_sale_id INT,
    san_pham_id INT,
    gia_flash_sale DECIMAL(10,2) NOT NULL,
    so_luong_gioi_han INT DEFAULT NULL,
    so_luong_da_ban INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (flash_sale_id) REFERENCES flash_sale(flash_sale_id) ON DELETE CASCADE,
    FOREIGN KEY (san_pham_id) REFERENCES san_pham(san_pham_id) ON DELETE CASCADE
);

-- Thêm dữ liệu mẫu
INSERT INTO flash_sale (tieu_de, mo_ta, thoi_gian_bat_dau, thoi_gian_ket_thuc, mau_nen) VALUES
('🔥 FLASH SALE 9H', 'Giảm giá sốc trong 9 tiếng - Nhanh tay kẻo lỡ!', NOW(), DATE_ADD(NOW(), INTERVAL 9 HOUR), 'gradient-to-r from-red-500 to-pink-600'),
('⚡ SIÊU SALE CUỐI TUẦN', 'Ưu đãi đặc biệt cuối tuần', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 2 DAY), 'gradient-to-r from-purple-500 to-blue-600');