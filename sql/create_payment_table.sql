-- Tạo bảng thanh toán online
CREATE TABLE IF NOT EXISTS thanh_toan_online (
    thanh_toan_id INT PRIMARY KEY AUTO_INCREMENT,
    don_hang_id INT NOT NULL,
    bank_code VARCHAR(10) NOT NULL,
    so_tien DECIMAL(10,2) NOT NULL,
    noi_dung VARCHAR(255) NOT NULL,
    ma_giao_dich VARCHAR(100) NULL,
    trang_thai ENUM('pending', 'completed', 'failed', 'expired') DEFAULT 'pending',
    ghi_chu TEXT NULL,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (don_hang_id) REFERENCES don_hang(don_hang_id),
    UNIQUE KEY unique_order_payment (don_hang_id)
) COMMENT='Bảng quản lý thanh toán online';

-- Thêm index để tối ưu truy vấn
CREATE INDEX idx_payment_status ON thanh_toan_online(trang_thai);
CREATE INDEX idx_payment_date ON thanh_toan_online(ngay_tao);