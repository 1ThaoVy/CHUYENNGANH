const db = require('../config/database');

// Lấy cài đặt công khai (không cần admin)
exports.getPublicSettings = async (req, res) => {
    try {
        console.log('🔧 Getting public settings...');
        
        const [settings] = await db.execute(`
            SELECT ten_website, mo_ta_website, logo_url, favicon_url, dia_chi, 
                   so_dien_thoai, email, hotline, facebook_url, instagram_url, 
                   youtube_url, tiktok_url, zalo, ten_cong_ty, gio_lam_viec, 
                   phi_ship_toi_thieu, tien_te, ngon_ngu
            FROM cai_dat_website 
            ORDER BY cai_dat_id DESC LIMIT 1
        `);
        
        console.log('🔧 Query result:', settings);
        
        if (settings.length === 0) {
            console.log('🔧 No settings found, returning default');
            return res.json({
                success: true,
                data: {
                    ten_website: 'Orianna Shop',
                    mo_ta_website: 'Cửa hàng nước hoa chính hãng',
                    dia_chi: '43 Nguyễn Chí Thanh, Trà Vinh\ntỉnh Vĩnh Long, Việt Nam',
                    so_dien_thoai: '091 123 4567',
                    email: 'orianna@gmail.com',
                    hotline: '1900 xxxx',
                    gio_lam_viec: 'Thứ 2 - Thứ 6: 8:00 - 20:00\nThứ 7 - CN: 9:00 - 18:00'
                }
            });
        }

        console.log('🔧 Returning settings:', settings[0]);
        res.json({
            success: true,
            data: settings[0]
        });
    } catch (error) {
        console.error('❌ Error getting public settings:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Lấy tất cả cài đặt (admin)
exports.getSettings = async (req, res) => {
    try {
        console.log('🔧 Getting admin settings...');
        
        const [settings] = await db.execute('SELECT * FROM cai_dat_website ORDER BY cai_dat_id DESC LIMIT 1');
        
        console.log('🔧 Admin query result:', settings);
        
        if (settings.length === 0) {
            console.log('🔧 No admin settings found, returning default');
            return res.json({
                success: true,
                data: {
                    ten_website: 'Orianna Shop',
                    mo_ta_website: 'Cửa hàng nước hoa chính hãng',
                    dia_chi: '43 Nguyễn Chí Thanh, Trà Vinh\ntỉnh Vĩnh Long, Việt Nam',
                    so_dien_thoai: '091 123 4567',
                    email: 'orianna@gmail.com',
                    hotline: '1900 xxxx',
                    gio_lam_viec: 'Thứ 2 - Thứ 6: 8:00 - 20:00\nThứ 7 - CN: 9:00 - 18:00'
                }
            });
        }

        console.log('🔧 Returning admin settings:', settings[0]);
        res.json({
            success: true,
            data: settings[0]
        });
    } catch (error) {
        console.error('❌ Error getting admin settings:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Cập nhật cài đặt (đơn giản hóa)
exports.updateSettings = async (req, res) => {
    try {
        console.log('🔧 Updating settings...');
        console.log('🔧 Request body:', req.body);
        
        const updateData = req.body;
        
        // Kiểm tra xem có cài đặt nào chưa
        const [existing] = await db.execute('SELECT cai_dat_id FROM cai_dat_website LIMIT 1');
        console.log('🔧 Existing settings:', existing);

        if (existing.length === 0) {
            console.log('🔧 Creating new settings...');
            // Tạo mới với dữ liệu cơ bản
            const [result] = await db.execute(`
                INSERT INTO cai_dat_website (
                    ten_website, dia_chi, so_dien_thoai, email, hotline, gio_lam_viec
                ) VALUES (?, ?, ?, ?, ?, ?)
            `, [
                updateData.ten_website || 'Orianna Shop',
                updateData.dia_chi || '43 Nguyễn Chí Thanh, Trà Vinh',
                updateData.so_dien_thoai || '091 123 4567',
                updateData.email || 'orianna@gmail.com',
                updateData.hotline || '1900 xxxx',
                updateData.gio_lam_viec || 'Thứ 2 - Thứ 6: 8:00 - 20:00'
            ]);

            console.log('🔧 Created new settings with ID:', result.insertId);
            res.status(201).json({
                success: true,
                message: 'Tạo cài đặt thành công',
                data: { cai_dat_id: result.insertId }
            });
        } else {
            console.log('🔧 Updating existing settings...');
            // Cập nhật chỉ các trường cơ bản
            await db.execute(`
                UPDATE cai_dat_website SET
                    ten_website = ?, dia_chi = ?, so_dien_thoai = ?, 
                    email = ?, hotline = ?, gio_lam_viec = ?
                WHERE cai_dat_id = ?
            `, [
                updateData.ten_website || 'Orianna Shop',
                updateData.dia_chi || '43 Nguyễn Chí Thanh, Trà Vinh',
                updateData.so_dien_thoai || '091 123 4567',
                updateData.email || 'orianna@gmail.com',
                updateData.hotline || '1900 xxxx',
                updateData.gio_lam_viec || 'Thứ 2 - Thứ 6: 8:00 - 20:00',
                existing[0].cai_dat_id
            ]);

            console.log('🔧 Updated existing settings');
            res.json({
                success: true,
                message: 'Cập nhật cài đặt thành công'
            });
        }
    } catch (error) {
        console.error('❌ Error updating settings:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};