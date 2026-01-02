const db = require('../config/database');

// Lấy tất cả cài đặt
exports.getSettings = async (req, res) => {
    try {
        const [settings] = await db.execute('SELECT * FROM cai_dat_website ORDER BY cai_dat_id DESC LIMIT 1');
        
        if (settings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Chưa có cài đặt nào'
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
                    email, hotline, facebook_url, instagram_url, youtube_url, tiktok_url,
                    ten_cong_ty, ma_so_thue, giay_phep_kinh_doanh, chinh_sach_bao_hanh,
                    chinh_sach_doi_tra, chinh_sach_giao_hang, chinh_sach_bao_mat,
                    meta_title, meta_description, meta_keywords, gio_lam_viec,
                    phi_ship_toi_thieu, tien_te, ngon_ngu,
                    tinh_nang_1_tieu_de, tinh_nang_1_icon, tinh_nang_1_mo_ta,
                    tinh_nang_2_tieu_de, tinh_nang_2_icon, tinh_nang_2_mo_ta,
                    tinh_nang_3_tieu_de, tinh_nang_3_icon, tinh_nang_3_mo_ta,
                    tinh_nang_4_tieu_de, tinh_nang_4_icon, tinh_nang_4_mo_ta
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                ten_website, mo_ta_website, logo_url, favicon_url, dia_chi, so_dien_thoai,
                email, hotline, facebook_url, instagram_url, youtube_url, tiktok_url,
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
                    facebook_url = ?, instagram_url = ?, youtube_url = ?, tiktok_url = ?,
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
                email, hotline, facebook_url, instagram_url, youtube_url, tiktok_url,
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
                   youtube_url, tiktok_url, ten_cong_ty, gio_lam_viec, 
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