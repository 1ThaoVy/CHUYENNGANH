-- Tạo bảng tin nhắn liên hệ
CREATE TABLE IF NOT EXISTS lien_he (
    lien_he_id INT PRIMARY KEY AUTO_INCREMENT,
    ho_ten VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    so_dien_thoai VARCHAR(20),
    chu_de VARCHAR(200),
    noi_dung TEXT NOT NULL,
    trang_thai ENUM('moi', 'da_doc', 'da_phan_hoi') DEFAULT 'moi',
    nguoi_dung_id INT NULL, -- Nếu người dùng đã đăng nhập
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE SET NULL
);

-- Tạo bảng phản hồi liên hệ
CREATE TABLE IF NOT EXISTS phan_hoi_lien_he (
    phan_hoi_id INT PRIMARY KEY AUTO_INCREMENT,
    lien_he_id INT NOT NULL,
    noi_dung_phan_hoi TEXT NOT NULL,
    admin_id INT NOT NULL,
    ngay_phan_hoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lien_he_id) REFERENCES lien_he(lien_he_id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE CASCADE
);

-- Tạo bảng thông báo cho người dùng
CREATE TABLE IF NOT EXISTS thong_bao (
    thong_bao_id INT PRIMARY KEY AUTO_INCREMENT,
    nguoi_dung_id INT NOT NULL,
    tieu_de VARCHAR(200) NOT NULL,
    noi_dung TEXT NOT NULL,
    loai_thong_bao ENUM('lien_he', 'don_hang', 'he_thong') DEFAULT 'he_thong',
    da_doc BOOLEAN DEFAULT FALSE,
    lien_he_id INT NULL, -- Liên kết với tin nhắn liên hệ nếu có
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE CASCADE,
    FOREIGN KEY (lien_he_id) REFERENCES lien_he(lien_he_id) ON DELETE SET NULL
);

-- Tạo index để tối ưu truy vấn
CREATE INDEX idx_lien_he_trang_thai ON lien_he(trang_thai);
CREATE INDEX idx_lien_he_ngay_tao ON lien_he(ngay_tao);
CREATE INDEX idx_thong_bao_nguoi_dung ON thong_bao(nguoi_dung_id, da_doc);
CREATE INDEX idx_thong_bao_ngay_tao ON thong_bao(ngay_tao);