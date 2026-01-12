const db = require('../config/database');

// Gửi tin nhắn liên hệ
exports.sendContactMessage = async (req, res) => {
    try {
        // Tạo bảng nếu chưa tồn tại
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
                ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        const { ho_ten, email, so_dien_thoai, chu_de, noi_dung } = req.body;
        
        // Validation
        if (!ho_ten || !email || !noi_dung) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
            });
        }

        // Kiểm tra email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Email không hợp lệ'
            });
        }

        // Lấy user ID nếu đã đăng nhập
        const nguoi_dung_id = req.user ? req.user.nguoi_dung_id : null;

        // Lưu tin nhắn vào database
        const [result] = await db.execute(`
            INSERT INTO lien_he (ho_ten, email, so_dien_thoai, chu_de, noi_dung, nguoi_dung_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [ho_ten, email, so_dien_thoai || null, chu_de || 'Câu hỏi chung', noi_dung, nguoi_dung_id]);

        res.status(201).json({
            success: true,
            message: 'Gửi tin nhắn thành công! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.',
            data: { lien_he_id: result.insertId }
        });

    } catch (error) {
        console.error('Error sending contact message:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Lấy danh sách tin nhắn liên hệ (Admin) - Version đơn giản nhất
exports.getContactMessages = async (req, res) => {
    try {
        console.log('🔧 Getting contact messages...');
        
        // Tạo bảng nếu chưa tồn tại
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
                ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        console.log('🔧 Table created/checked');

        // Query đơn giản - lấy tin nhắn thực (không có test data)
        const [messages] = await db.execute(`
            SELECT * FROM lien_he 
            WHERE ho_ten NOT LIKE '%Test%' 
            AND ho_ten NOT LIKE '%test%'
            AND email NOT LIKE '%test%'
            AND email NOT LIKE '%example.com%'
            ORDER BY ngay_tao DESC 
            LIMIT 20
        `);
        
        console.log('🔧 Real messages fetched:', messages.length);

        // Đếm tổng số tin nhắn thực
        const [countResult] = await db.execute(`
            SELECT COUNT(*) as total FROM lien_he 
            WHERE ho_ten NOT LIKE '%Test%' 
            AND ho_ten NOT LIKE '%test%'
            AND email NOT LIKE '%test%'
            AND email NOT LIKE '%example.com%'
        `);
        
        console.log('🔧 Total real messages:', countResult[0].total);

        res.json({
            success: true,
            data: {
                messages,
                pagination: {
                    page: 1,
                    limit: 20,
                    total: countResult[0].total,
                    totalPages: Math.ceil(countResult[0].total / 20)
                }
            }
        });

    } catch (error) {
        console.error('❌ Error getting contact messages:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Lấy chi tiết tin nhắn liên hệ (Admin)
exports.getContactMessageDetail = async (req, res) => {
    try {
        const { id } = req.params;

        // Lấy thông tin tin nhắn
        const [messages] = await db.execute(`
            SELECT lh.*
            FROM lien_he lh
            WHERE lh.lien_he_id = ?
        `, [id]);

        if (messages.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tin nhắn'
            });
        }

        // Lấy danh sách phản hồi
        const [replies] = await db.execute(`
            SELECT 
                phlh.*,
                nd.ho_ten as ten_admin
            FROM phan_hoi_lien_he phlh
            JOIN nguoi_dung nd ON phlh.admin_id = nd.nguoi_dung_id
            WHERE phlh.lien_he_id = ?
            ORDER BY phlh.ngay_phan_hoi ASC
        `, [id]);

        // Đánh dấu đã đọc
        await db.execute(`
            UPDATE lien_he SET trang_thai = 'da_doc' 
            WHERE lien_he_id = ? AND trang_thai = 'moi'
        `, [id]);

        res.json({
            success: true,
            data: {
                message: messages[0],
                replies
            }
        });

    } catch (error) {
        console.error('Error getting contact message detail:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Phản hồi tin nhắn liên hệ (Admin)
exports.replyContactMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { noi_dung_phan_hoi } = req.body;
        const admin_id = req.user.nguoi_dung_id;

        if (!noi_dung_phan_hoi) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập nội dung phản hồi'
            });
        }

        // Kiểm tra tin nhắn tồn tại
        const [messages] = await db.execute(`
            SELECT lh.* 
            FROM lien_he lh
            WHERE lh.lien_he_id = ?
        `, [id]);

        if (messages.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tin nhắn'
            });
        }

        const message = messages[0];

        // Lưu phản hồi
        await db.execute(`
            INSERT INTO phan_hoi_lien_he (lien_he_id, noi_dung_phan_hoi, admin_id)
            VALUES (?, ?, ?)
        `, [id, noi_dung_phan_hoi, admin_id]);

        // Cập nhật trạng thái tin nhắn
        await db.execute(`
            UPDATE lien_he SET trang_thai = 'da_phan_hoi' WHERE lien_he_id = ?
        `, [id]);

        // Tạo thông báo cho người dùng (nếu có tài khoản)
        if (message.nguoi_dung_id) {
            // Tạo bảng thông báo nếu chưa có
            await db.execute(`
                CREATE TABLE IF NOT EXISTS thong_bao (
                    thong_bao_id INT PRIMARY KEY AUTO_INCREMENT,
                    nguoi_dung_id INT NOT NULL,
                    tieu_de VARCHAR(200) NOT NULL,
                    noi_dung TEXT NOT NULL,
                    loai_thong_bao ENUM('lien_he', 'don_hang', 'he_thong') DEFAULT 'he_thong',
                    da_doc BOOLEAN DEFAULT FALSE,
                    lien_he_id INT NULL,
                    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await db.execute(`
                INSERT INTO thong_bao (nguoi_dung_id, tieu_de, noi_dung, loai_thong_bao, lien_he_id)
                VALUES (?, ?, ?, 'lien_he', ?)
            `, [
                message.nguoi_dung_id,
                'Phản hồi liên hệ',
                `Chúng tôi đã phản hồi tin nhắn "${message.chu_de || 'Câu hỏi chung'}" của bạn. Vui lòng kiểm tra.`,
                id
            ]);
            
            console.log('✅ Notification created for user:', message.nguoi_dung_id);
        } else {
            console.log('ℹ️ No user ID found, notification not created (anonymous message)');
        }

        res.json({
            success: true,
            message: 'Phản hồi thành công'
        });

    } catch (error) {
        console.error('Error replying contact message:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Lấy thống kê tin nhắn liên hệ (Admin)
exports.getContactStats = async (req, res) => {
    try {
        // Tạo bảng nếu chưa tồn tại
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
                ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Thống kê theo trạng thái (loại bỏ test data)
        const [statusStats] = await db.execute(`
            SELECT 
                trang_thai,
                COUNT(*) as so_luong
            FROM lien_he
            WHERE ho_ten NOT LIKE '%Test%' 
            AND ho_ten NOT LIKE '%test%'
            AND email NOT LIKE '%test%'
            AND email NOT LIKE '%example.com%'
            AND chu_de NOT LIKE '%Test%'
            AND chu_de NOT LIKE '%test%'
            AND noi_dung NOT LIKE '%test%'
            AND noi_dung NOT LIKE '%Test%'
            GROUP BY trang_thai
        `);

        // Thống kê theo tháng (6 tháng gần nhất, loại bỏ test data)
        const [monthlyStats] = await db.execute(`
            SELECT 
                DATE_FORMAT(ngay_tao, '%Y-%m') as thang,
                COUNT(*) as so_luong
            FROM lien_he
            WHERE ngay_tao >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            AND ho_ten NOT LIKE '%Test%' 
            AND ho_ten NOT LIKE '%test%'
            AND email NOT LIKE '%test%'
            AND email NOT LIKE '%example.com%'
            AND chu_de NOT LIKE '%Test%'
            AND chu_de NOT LIKE '%test%'
            AND noi_dung NOT LIKE '%test%'
            AND noi_dung NOT LIKE '%Test%'
            GROUP BY DATE_FORMAT(ngay_tao, '%Y-%m')
            ORDER BY thang DESC
        `);

        // Tin nhắn mới nhất (loại bỏ test data)
        const [recentMessages] = await db.execute(`
            SELECT lien_he_id, ho_ten, chu_de, ngay_tao, trang_thai
            FROM lien_he
            WHERE ho_ten NOT LIKE '%Test%' 
            AND ho_ten NOT LIKE '%test%'
            AND email NOT LIKE '%test%'
            AND email NOT LIKE '%example.com%'
            AND chu_de NOT LIKE '%Test%'
            AND chu_de NOT LIKE '%test%'
            AND noi_dung NOT LIKE '%test%'
            AND noi_dung NOT LIKE '%Test%'
            ORDER BY ngay_tao DESC
            LIMIT 5
        `);

        res.json({
            success: true,
            data: {
                statusStats,
                monthlyStats,
                recentMessages
            }
        });

    } catch (error) {
        console.error('Error getting contact stats:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};