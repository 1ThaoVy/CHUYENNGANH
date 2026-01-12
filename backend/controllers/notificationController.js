const db = require('../config/database');

// Lấy danh sách thông báo của người dùng
exports.getUserNotifications = async (req, res) => {
    try {
        // Tạo bảng thông báo nếu chưa có
        await db.query(`
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

        const nguoi_dung_id = req.user.nguoi_dung_id;
        const { page = 1, limit = 10, da_doc } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = 'WHERE tb.nguoi_dung_id = ?';
        let params = [nguoi_dung_id];

        if (da_doc !== undefined) {
            whereClause += ' AND tb.da_doc = ?';
            params.push(da_doc === 'true');
        }

        // Lấy danh sách thông báo
        const [notifications] = await db.query(`
            SELECT * FROM thong_bao 
            WHERE nguoi_dung_id = ?
            ORDER BY ngay_tao DESC
            LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
        `, [nguoi_dung_id]);

        // Đếm tổng số thông báo
        const [countResult] = await db.query(`
            SELECT COUNT(*) as total FROM thong_bao 
            WHERE nguoi_dung_id = ?
        `, [nguoi_dung_id]);

        // Đếm số thông báo chưa đọc
        const [unreadCount] = await db.query(`
            SELECT COUNT(*) as unread FROM thong_bao 
            WHERE nguoi_dung_id = ? AND da_doc = FALSE
        `, [nguoi_dung_id]);

        res.json({
            success: true,
            data: {
                notifications,
                unreadCount: unreadCount[0].unread,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: countResult[0].total,
                    totalPages: Math.ceil(countResult[0].total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Error getting user notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Đánh dấu thông báo đã đọc
exports.markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const nguoi_dung_id = req.user.nguoi_dung_id;

        // Kiểm tra thông báo thuộc về người dùng
        const [notifications] = await db.query(`
            SELECT * FROM thong_bao WHERE thong_bao_id = ? AND nguoi_dung_id = ?
        `, [id, nguoi_dung_id]);

        if (notifications.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông báo'
            });
        }

        // Đánh dấu đã đọc
        await db.query(`
            UPDATE thong_bao SET da_doc = TRUE WHERE thong_bao_id = ?
        `, [id]);

        res.json({
            success: true,
            message: 'Đã đánh dấu thông báo đã đọc'
        });

    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Đánh dấu tất cả thông báo đã đọc
exports.markAllNotificationsAsRead = async (req, res) => {
    try {
        const nguoi_dung_id = req.user.nguoi_dung_id;

        await db.query(`
            UPDATE thong_bao SET da_doc = TRUE WHERE nguoi_dung_id = ? AND da_doc = FALSE
        `, [nguoi_dung_id]);

        res.json({
            success: true,
            message: 'Đã đánh dấu tất cả thông báo đã đọc'
        });

    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Xóa thông báo
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const nguoi_dung_id = req.user.nguoi_dung_id;

        // Kiểm tra thông báo thuộc về người dùng
        const [notifications] = await db.query(`
            SELECT * FROM thong_bao WHERE thong_bao_id = ? AND nguoi_dung_id = ?
        `, [id, nguoi_dung_id]);

        if (notifications.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông báo'
            });
        }

        // Xóa thông báo
        await db.query(`
            DELETE FROM thong_bao WHERE thong_bao_id = ?
        `, [id]);

        res.json({
            success: true,
            message: 'Đã xóa thông báo'
        });

    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Lấy chi tiết phản hồi liên hệ
exports.getContactReplyDetail = async (req, res) => {
    try {
        const { lien_he_id } = req.params;
        const nguoi_dung_id = req.user.nguoi_dung_id;

        // Kiểm tra tin nhắn thuộc về người dùng
        const [messages] = await db.query(`
            SELECT * FROM lien_he WHERE lien_he_id = ? AND nguoi_dung_id = ?
        `, [lien_he_id, nguoi_dung_id]);

        if (messages.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tin nhắn'
            });
        }

        // Lấy danh sách phản hồi
        const [replies] = await db.query(`
            SELECT 
                phlh.*,
                nd.ho_ten as ten_admin
            FROM phan_hoi_lien_he phlh
            JOIN nguoi_dung nd ON phlh.admin_id = nd.nguoi_dung_id
            WHERE phlh.lien_he_id = ?
            ORDER BY phlh.ngay_phan_hoi ASC
        `, [lien_he_id]);

        res.json({
            success: true,
            data: {
                message: messages[0],
                replies
            }
        });

    } catch (error) {
        console.error('Error getting contact reply detail:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};