const db = require('../config/database');

// Lấy tất cả cài đặt
exports.getSettings = async (req, res) => {
    try {
        // Kiểm tra và tạo bảng nếu chưa tồn tại
        await db.execute(`
            CREATE TABLE IF NOT EXISTS cai_dat_website (
                cai_dat_id INT PRIMARY KEY AUTO_INCREMENT,
                ten_website VARCHAR(255) NOT NULL DEFAULT 'Orianna Shop',
                mo_ta_website TEXT,
                logo_url VARCHAR(500),
                favicon_url VARCHAR(500),
                dia_chi TEXT,
                so_dien_thoai VARCHAR(20),
                email VARCHAR(100),
                hotline VARCHAR(20),
                facebook_url VARCHAR(500),
                instagram_url VARCHAR(500),
                youtube_url VARCHAR(500),
                tiktok_url VARCHAR(500),
                zalo VARCHAR(20),
                ten_cong_ty VARCHAR(255),
                ma_so_thue VARCHAR(50),
                giay_phep_kinh_doanh VARCHAR(100),
                chinh_sach_bao_hanh TEXT,
                chinh_sach_doi_tra TEXT,
                chinh_sach_giao_hang TEXT,
                chinh_sach_bao_mat TEXT,
                tinh_nang_1_icon VARCHAR(10),
                tinh_nang_1_tieu_de VARCHAR(100),
                tinh_nang_1_mo_ta TEXT,
                tinh_nang_2_icon VARCHAR(10),
                tinh_nang_2_tieu_de VARCHAR(100),
                tinh_nang_2_mo_ta TEXT,
                tinh_nang_3_icon VARCHAR(10),
                tinh_nang_3_tieu_de VARCHAR(100),
                tinh_nang_3_mo_ta TEXT,
                tinh_nang_4_icon VARCHAR(10),
                tinh_nang_4_tieu_de VARCHAR(100),
                tinh_nang_4_mo_ta TEXT,
                meta_title VARCHAR(255),
                meta_description TEXT,
                meta_keywords TEXT,
                gio_lam_viec TEXT,
                phi_ship_toi_thieu DECIMAL(10,2) DEFAULT 25000,
                tien_te VARCHAR(10) DEFAULT 'VND',
                ngon_ngu VARCHAR(10) DEFAULT 'vi',
                ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        const [settings] = await db.execute('SELECT * FROM cai_dat_website ORDER BY cai_dat_id DESC LIMIT 1');
        
        if (settings.length === 0) {
            // Tạo dữ liệu mặc định
            await db.execute(`
                INSERT INTO cai_dat_website (
                    ten_website, mo_ta_website, dia_chi, so_dien_thoai, email, hotline,
                    ten_cong_ty, ma_so_thue, giay_phep_kinh_doanh,
                    facebook_url, instagram_url, zalo,
                    chinh_sach_bao_hanh, chinh_sach_doi_tra, chinh_sach_giao_hang, chinh_sach_bao_mat,
                    tinh_nang_1_icon, tinh_nang_1_tieu_de, tinh_nang_1_mo_ta,
                    tinh_nang_2_icon, tinh_nang_2_tieu_de, tinh_nang_2_mo_ta,
                    tinh_nang_3_icon, tinh_nang_3_tieu_de, tinh_nang_3_mo_ta,
                    tinh_nang_4_icon, tinh_nang_4_tieu_de, tinh_nang_4_mo_ta,
                    meta_title, meta_description, gio_lam_viec, phi_ship_toi_thieu
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                'Orianna Perfume Store',
                'Cửa hàng nước hoa chính hãng uy tín',
                'Nguyễn Thiện Thành, Phường Hòa Thuận\nTỉnh Vĩnh Long',
                '0388853044',
                'nguyenhuynhkitthuat94tv@gmail.com',
                '078 747 2078',
                'Cửa hàng nước hoa Orianna',
                '0123456789',
                'Đang cập nhật',
                'https://facebook.com/orianna.perfume.vinhlong',
                'https://instagram.com/orianna_perfume_vl',
                '0388853044',
                'Sản phẩm nước hoa chính hãng được bảo hành về chất lượng. Đổi trả nếu phát hiện hàng giả hoặc không đúng mô tả.',
                'Đổi trả sản phẩm trong 3 ngày nếu sản phẩm bị lỗi hoặc không đúng mô tả. Sản phẩm phải còn nguyên seal.',
                'Giao hàng tận nơi trong khu vực Vĩnh Long. Phí ship 25,000 VND. Miễn phí ship cho đơn hàng từ 500,000 VND.',
                'Cam kết bảo mật thông tin cá nhân của khách hàng. Không chia sẻ thông tin cho bên thứ ba khi chưa có sự đồng ý.',
                '🚚', 'Giao hàng tận nơi', 'Giao hàng tận nơi trong khu vực Vĩnh Long',
                '💯', 'Nước hoa chính hãng', '100% nước hoa chính hãng từ các thương hiệu uy tín',
                '👨‍💼', 'Tư vấn chuyên nghiệp', 'Đội ngũ tư vấn am hiểu về nước hoa',
                '💰', 'Giá cả hợp lý', 'Giá cả cạnh tranh, nhiều ưu đãi hấp dẫn',
                'Orianna Perfume Store - Nước hoa chính hãng',
                'Orianna Shop chuyên cung cấp nước hoa chính hãng từ các thương hiệu nổi tiếng với giá tốt nhất',
                'Thứ 2 - Thứ 6: 8:00 - 17:00\nThứ 7 - CN: 8:00 - 16:00',
                25000
            ]);

            // Lấy lại dữ liệu vừa tạo
            const [newSettings] = await db.execute('SELECT * FROM cai_dat_website ORDER BY cai_dat_id DESC LIMIT 1');
            return res.json({
                success: true,
                data: newSettings[0]
            });
        }

        res.json({
            success: true,
            data: settings[0]
        });
    } catch (error) {
        console.error('Error getting settings:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Cập nhật cài đặt
exports.updateSettings = async (req, res) => {
    try {
        const {
            ten_website,
            mo_ta_website,
            logo_url,
            favicon_url,
            dia_chi,
            so_dien_thoai,
            email,
            hotline,
            facebook_url,
            instagram_url,
            youtube_url,
            tiktok_url,
            zalo,
            ten_cong_ty,
            ma_so_thue,
            giay_phep_kinh_doanh,
            chinh_sach_bao_hanh,
            chinh_sach_doi_tra,
            chinh_sach_giao_hang,
            chinh_sach_bao_mat,
            meta_title,
            meta_description,
            meta_keywords,
            gio_lam_viec,
            phi_ship_toi_thieu,
            tien_te,
            ngon_ngu,
            tinh_nang_1_tieu_de,
            tinh_nang_1_icon,
            tinh_nang_1_mo_ta,
            tinh_nang_2_tieu_de,
            tinh_nang_2_icon,
            tinh_nang_2_mo_ta,
            tinh_nang_3_tieu_de,
            tinh_nang_3_icon,
            tinh_nang_3_mo_ta,
            tinh_nang_4_tieu_de,
            tinh_nang_4_icon,
            tinh_nang_4_mo_ta
        } = req.body;

        // Kiểm tra xem có cài đặt nào chưa
        const [existing] = await db.execute('SELECT cai_dat_id FROM cai_dat_website LIMIT 1');

        if (existing.length === 0) {
            // Tạo mới
            const [result] = await db.execute(`
                INSERT INTO cai_dat_website (
                    ten_website, mo_ta_website, logo_url, favicon_url, dia_chi, so_dien_thoai, 
                    email, hotline, facebook_url, instagram_url, youtube_url, tiktok_url, zalo,
                    ten_cong_ty, ma_so_thue, giay_phep_kinh_doanh, chinh_sach_bao_hanh,
                    chinh_sach_doi_tra, chinh_sach_giao_hang, chinh_sach_bao_mat,
                    meta_title, meta_description, meta_keywords, gio_lam_viec,
                    phi_ship_toi_thieu, tien_te, ngon_ngu,
                    tinh_nang_1_tieu_de, tinh_nang_1_icon, tinh_nang_1_mo_ta,
                    tinh_nang_2_tieu_de, tinh_nang_2_icon, tinh_nang_2_mo_ta,
                    tinh_nang_3_tieu_de, tinh_nang_3_icon, tinh_nang_3_mo_ta,
                    tinh_nang_4_tieu_de, tinh_nang_4_icon, tinh_nang_4_mo_ta
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                ten_website, mo_ta_website, logo_url, favicon_url, dia_chi, so_dien_thoai,
                email, hotline, facebook_url, instagram_url, youtube_url, tiktok_url, zalo,
                ten_cong_ty, ma_so_thue, giay_phep_kinh_doanh, chinh_sach_bao_hanh,
                chinh_sach_doi_tra, chinh_sach_giao_hang, chinh_sach_bao_mat,
                meta_title, meta_description, meta_keywords, gio_lam_viec,
                phi_ship_toi_thieu, tien_te, ngon_ngu,
                tinh_nang_1_tieu_de, tinh_nang_1_icon, tinh_nang_1_mo_ta,
                tinh_nang_2_tieu_de, tinh_nang_2_icon, tinh_nang_2_mo_ta,
                tinh_nang_3_tieu_de, tinh_nang_3_icon, tinh_nang_3_mo_ta,
                tinh_nang_4_tieu_de, tinh_nang_4_icon, tinh_nang_4_mo_ta
            ]);

            res.status(201).json({
                success: true,
                message: 'Tạo cài đặt thành công',
                data: { cai_dat_id: result.insertId }
            });
        } else {
            // Cập nhật
            await db.execute(`
                UPDATE cai_dat_website SET
                    ten_website = ?, mo_ta_website = ?, logo_url = ?, favicon_url = ?,
                    dia_chi = ?, so_dien_thoai = ?, email = ?, hotline = ?,
                    facebook_url = ?, instagram_url = ?, youtube_url = ?, tiktok_url = ?, zalo = ?,
                    ten_cong_ty = ?, ma_so_thue = ?, giay_phep_kinh_doanh = ?,
                    chinh_sach_bao_hanh = ?, chinh_sach_doi_tra = ?, chinh_sach_giao_hang = ?,
                    chinh_sach_bao_mat = ?, meta_title = ?, meta_description = ?, meta_keywords = ?,
                    gio_lam_viec = ?, phi_ship_toi_thieu = ?, tien_te = ?, ngon_ngu = ?,
                    tinh_nang_1_tieu_de = ?, tinh_nang_1_icon = ?, tinh_nang_1_mo_ta = ?,
                    tinh_nang_2_tieu_de = ?, tinh_nang_2_icon = ?, tinh_nang_2_mo_ta = ?,
                    tinh_nang_3_tieu_de = ?, tinh_nang_3_icon = ?, tinh_nang_3_mo_ta = ?,
                    tinh_nang_4_tieu_de = ?, tinh_nang_4_icon = ?, tinh_nang_4_mo_ta = ?
                WHERE cai_dat_id = ?
            `, [
                ten_website, mo_ta_website, logo_url, favicon_url, dia_chi, so_dien_thoai,
                email, hotline, facebook_url, instagram_url, youtube_url, tiktok_url, zalo,
                ten_cong_ty, ma_so_thue, giay_phep_kinh_doanh, chinh_sach_bao_hanh,
                chinh_sach_doi_tra, chinh_sach_giao_hang, chinh_sach_bao_mat,
                meta_title, meta_description, meta_keywords, gio_lam_viec,
                phi_ship_toi_thieu, tien_te, ngon_ngu,
                tinh_nang_1_tieu_de, tinh_nang_1_icon, tinh_nang_1_mo_ta,
                tinh_nang_2_tieu_de, tinh_nang_2_icon, tinh_nang_2_mo_ta,
                tinh_nang_3_tieu_de, tinh_nang_3_icon, tinh_nang_3_mo_ta,
                tinh_nang_4_tieu_de, tinh_nang_4_icon, tinh_nang_4_mo_ta,
                existing[0].cai_dat_id
            ]);

            res.json({
                success: true,
                message: 'Cập nhật cài đặt thành công'
            });
        }
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Lấy cài đặt công khai (không cần admin)
exports.getPublicSettings = async (req, res) => {
    try {
        const [settings] = await db.execute(`
            SELECT ten_website, mo_ta_website, logo_url, favicon_url, dia_chi, 
                   so_dien_thoai, email, hotline, facebook_url, instagram_url, 
                   youtube_url, tiktok_url, zalo, ten_cong_ty, gio_lam_viec, 
                   phi_ship_toi_thieu, tien_te, ngon_ngu
            FROM cai_dat_website 
            ORDER BY cai_dat_id DESC LIMIT 1
        `);
        
        if (settings.length === 0) {
            return res.json({
                success: true,
                data: {
                    ten_website: 'Orianna Shop',
                    mo_ta_website: 'Cửa hàng nước hoa chính hãng',
                    dia_chi: '123 Đường ABC, Quận 1, TP.HCM',
                    so_dien_thoai: '0123456789',
                    email: 'contact@orianna.vn',
                    hotline: '1900-1234'
                }
            });
        }

        res.json({
            success: true,
            data: settings[0]
        });
    } catch (error) {
        console.error('Error getting public settings:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};