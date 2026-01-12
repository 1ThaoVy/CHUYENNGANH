const db = require('./config/database');

async function createContactTables() {
    try {
        console.log('🔧 Creating contact system tables...');

        // Tạo bảng tin nhắn liên hệ
        await db.execute(`
            CREATE TABLE IF NOT EXISTS lien_he (
                lien_he_id INT PRIMARY KEY AUTO_INCREMENT,
                ho_ten VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                so_dien_thoai VARCHAR(20),
                chu_de VARCHAR(200),
                noi_dung TEXT NOT NULL,
                trang_thai ENUM('moi', 'da_doc', 'da_phan_hoi') DEFAULT 'moi',
                nguoi_dung_id INT NULL,
                ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_lien_he_trang_thai (trang_thai),
                INDEX idx_lien_he_ngay_tao (ngay_tao)
            )
        `);
        console.log('✅ Table lien_he created');

        // Tạo bảng phản hồi liên hệ
        await db.execute(`
            CREATE TABLE IF NOT EXISTS phan_hoi_lien_he (
                phan_hoi_id INT PRIMARY KEY AUTO_INCREMENT,
                lien_he_id INT NOT NULL,
                noi_dung_phan_hoi TEXT NOT NULL,
                admin_id INT NOT NULL,
                ngay_phan_hoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (lien_he_id) REFERENCES lien_he(lien_he_id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Table phan_hoi_lien_he created');

        // Tạo bảng thông báo cho người dùng
        await db.execute(`
            CREATE TABLE IF NOT EXISTS thong_bao (
                thong_bao_id INT PRIMARY KEY AUTO_INCREMENT,
                nguoi_dung_id INT NOT NULL,
                tieu_de VARCHAR(200) NOT NULL,
                noi_dung TEXT NOT NULL,
                loai_thong_bao ENUM('lien_he', 'don_hang', 'he_thong') DEFAULT 'he_thong',
                da_doc BOOLEAN DEFAULT FALSE,
                lien_he_id INT NULL,
                ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_thong_bao_nguoi_dung (nguoi_dung_id, da_doc),
                INDEX idx_thong_bao_ngay_tao (ngay_tao)
            )
        `);
        console.log('✅ Table thong_bao created');

        console.log('🎉 All contact system tables created successfully!');
        
    } catch (error) {
        console.error('❌ Error creating tables:', error);
    } finally {
        process.exit(0);
    }
}

createContactTables();