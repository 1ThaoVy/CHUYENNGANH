-- Tạo bảng cài đặt website
CREATE TABLE IF NOT EXISTS cai_dat_website (
    cai_dat_id INT PRIMARY KEY AUTO_INCREMENT,
    ten_website VARCHAR(255) NOT NULL DEFAULT 'Orianna Shop',
    mo_ta_website TEXT,
    logo_url VARCHAR(500),
    favicon_url VARCHAR(500),
    
    -- Thông tin liên hệ
    dia_chi TEXT,
    so_dien_thoai VARCHAR(20),
    email VARCHAR(100),
    hotline VARCHAR(20),
    
    -- Mạng xã hội
    facebook_url VARCHAR(500),
    instagram_url VARCHAR(500),
    youtube_url VARCHAR(500),
    tiktok_url VARCHAR(500),
    
    -- Thông tin công ty
    ten_cong_ty VARCHAR(255),
    ma_so_thue VARCHAR(50),
    giay_phep_kinh_doanh VARCHAR(100),
    
    -- Chính sách
    chinh_sach_bao_hanh TEXT,
    chinh_sach_doi_tra TEXT,
    chinh_sach_giao_hang TEXT,
    chinh_sach_bao_mat TEXT,
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT,
    
    -- Cài đặt khác
    gio_lam_viec VARCHAR(255),
    phi_ship_toi_thieu DECIMAL(10,2) DEFAULT 2000000,
    tien_te VARCHAR(10) DEFAULT 'VND',
    ngon_ngu VARCHAR(10) DEFAULT 'vi',
    
    -- Thời gian
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Thêm dữ liệu mặc định
INSERT INTO cai_dat_website (
    ten_website, mo_ta_website, dia_chi, so_dien_thoai, email, hotline,
    ten_cong_ty, chinh_sach_bao_hanh, chinh_sach_doi_tra, chinh_sach_giao_hang,
    meta_title, meta_description, gio_lam_viec
) VALUES (
    'Orianna Shop',
    'Cửa hàng nước hoa chính hãng uy tín hàng đầu Việt Nam',
    '123 Đường ABC, Quận 1, TP.HCM',
    '0123456789',
    'contact@orianna.vn',
    '1900-1234',
    'Công ty TNHH Orianna Shop',
    'Bảo hành chính hãng 12 tháng cho tất cả sản phẩm',
    'Đổi trả miễn phí trong vòng 7 ngày nếu sản phẩm lỗi',
    'Miễn phí giao hàng cho đơn hàng từ 2.000.000đ',
    'Orianna Shop - Nước hoa chính hãng',
    'Orianna Shop chuyên cung cấp nước hoa chính hãng từ các thương hiệu nổi tiếng như Chanel, Dior, Gucci với giá tốt nhất',
    'Thứ 2 - Chủ nhật: 8:00 - 22:00'
) ON DUPLICATE KEY UPDATE cai_dat_id = cai_dat_id;