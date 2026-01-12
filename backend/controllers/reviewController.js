const db = require('../config/database');

// Lấy đánh giá của sản phẩm
exports.getProductReviews = async (req, res) => {
    try {
        const { san_pham_id } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        // Lấy danh sách đánh giá
        const [reviews] = await db.query(`
            SELECT 
                dg.*,
                nd.ho_ten as ten_khach_hang
            FROM danh_gia_san_pham dg
            JOIN nguoi_dung nd ON dg.nguoi_dung_id = nd.nguoi_dung_id
            WHERE dg.san_pham_id = ? AND dg.trang_thai = 'hien_thi'
            ORDER BY dg.ngay_tao DESC
            LIMIT ? OFFSET ?
        `, [san_pham_id, parseInt(limit), parseInt(offset)]);

        // Đếm tổng số đánh giá
        const [countResult] = await db.query(`
            SELECT COUNT(*) as total FROM danh_gia_san_pham 
            WHERE san_pham_id = ? AND trang_thai = 'hien_thi'
        `, [san_pham_id]);

        // Tính điểm trung bình
        const [avgResult] = await db.query(`
            SELECT AVG(xep_hang) as avg_rating, COUNT(*) as total_reviews
            FROM danh_gia_san_pham 
            WHERE san_pham_id = ? AND trang_thai = 'hien_thi'
        `, [san_pham_id]);

        res.json({
            success: true,
            data: {
                reviews,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: countResult[0].total,
                    totalPages: Math.ceil(countResult[0].total / limit)
                },
                stats: {
                    average_rating: parseFloat(avgResult[0].avg_rating || 0).toFixed(1),
                    total_reviews: avgResult[0].total_reviews
                }
            }
        });

    } catch (error) {
        console.error('Error getting product reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Kiểm tra xem user có thể đánh giá sản phẩm không
exports.canUserReview = async (req, res) => {
    try {
        const { san_pham_id } = req.params;
        const nguoi_dung_id = req.user.nguoi_dung_id;

        // Kiểm tra xem user đã mua sản phẩm này chưa (trong đơn hàng đã hoàn thành)
        const [orders] = await db.query(`
            SELECT DISTINCT dh.don_hang_id
            FROM don_hang dh
            JOIN chi_tiet_don_hang ctdh ON dh.don_hang_id = ctdh.don_hang_id
            WHERE dh.nguoi_dung_id = ? 
            AND ctdh.san_pham_id = ? 
            AND dh.trang_thai_don_hang_id = 4
        `, [nguoi_dung_id, san_pham_id]);

        if (orders.length === 0) {
            return res.json({
                success: true,
                data: {
                    can_review: false,
                    reason: 'Bạn cần mua sản phẩm này để có thể đánh giá'
                }
            });
        }

        // Kiểm tra xem đã đánh giá chưa
        const [existingReviews] = await db.query(`
            SELECT * FROM danh_gia_san_pham 
            WHERE nguoi_dung_id = ? AND san_pham_id = ?
        `, [nguoi_dung_id, san_pham_id]);

        if (existingReviews.length > 0) {
            return res.json({
                success: true,
                data: {
                    can_review: false,
                    reason: 'Bạn đã đánh giá sản phẩm này rồi',
                    existing_review: existingReviews[0]
                }
            });
        }

        res.json({
            success: true,
            data: {
                can_review: true,
                available_orders: orders
            }
        });

    } catch (error) {
        console.error('Error checking review permission:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Tạo đánh giá mới
exports.createReview = async (req, res) => {
    try {
        const { san_pham_id, don_hang_id, xep_hang, binh_luan } = req.body;
        const nguoi_dung_id = req.user.nguoi_dung_id;

        // Validate input
        if (!san_pham_id || !don_hang_id || !xep_hang) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc'
            });
        }

        if (xep_hang < 1 || xep_hang > 5) {
            return res.status(400).json({
                success: false,
                message: 'Điểm đánh giá phải từ 1 đến 5 sao'
            });
        }

        // Kiểm tra quyền đánh giá
        const [orderCheck] = await db.query(`
            SELECT dh.don_hang_id
            FROM don_hang dh
            JOIN chi_tiet_don_hang ctdh ON dh.don_hang_id = ctdh.don_hang_id
            WHERE dh.nguoi_dung_id = ? 
            AND dh.don_hang_id = ?
            AND ctdh.san_pham_id = ? 
            AND dh.trang_thai_don_hang_id = 4
        `, [nguoi_dung_id, don_hang_id, san_pham_id]);

        if (orderCheck.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền đánh giá sản phẩm này'
            });
        }

        // Kiểm tra đã đánh giá chưa
        const [existingReview] = await db.query(`
            SELECT * FROM danh_gia_san_pham 
            WHERE nguoi_dung_id = ? AND san_pham_id = ? AND don_hang_id = ?
        `, [nguoi_dung_id, san_pham_id, don_hang_id]);

        if (existingReview.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi'
            });
        }

        // Tạo đánh giá mới
        const [result] = await db.query(`
            INSERT INTO danh_gia_san_pham (san_pham_id, nguoi_dung_id, don_hang_id, xep_hang, binh_luan)
            VALUES (?, ?, ?, ?, ?)
        `, [san_pham_id, nguoi_dung_id, don_hang_id, xep_hang, binh_luan || null]);

        res.status(201).json({
            success: true,
            message: 'Đánh giá thành công',
            data: {
                danh_gia_id: result.insertId
            }
        });

    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Lấy đánh giá của user cho đơn hàng
exports.getUserOrderReviews = async (req, res) => {
    try {
        const { don_hang_id } = req.params;
        const nguoi_dung_id = req.user.nguoi_dung_id;

        // Kiểm tra quyền truy cập đơn hàng
        const [orderCheck] = await db.query(`
            SELECT * FROM don_hang WHERE don_hang_id = ? AND nguoi_dung_id = ?
        `, [don_hang_id, nguoi_dung_id]);

        if (orderCheck.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        // Lấy danh sách sản phẩm trong đơn hàng và trạng thái đánh giá
        const [items] = await db.query(`
            SELECT 
                ctdh.*,
                sp.ten_san_pham,
                sp.url_hinh_anh_chinh,
                dg.danh_gia_id,
                dg.xep_hang,
                dg.binh_luan,
                dg.ngay_tao as ngay_danh_gia
            FROM chi_tiet_don_hang ctdh
            JOIN san_pham sp ON ctdh.san_pham_id = sp.san_pham_id
            LEFT JOIN danh_gia_san_pham dg ON (
                dg.san_pham_id = ctdh.san_pham_id 
                AND dg.don_hang_id = ctdh.don_hang_id 
                AND dg.nguoi_dung_id = ?
            )
            WHERE ctdh.don_hang_id = ?
        `, [nguoi_dung_id, don_hang_id]);

        res.json({
            success: true,
            data: {
                order_status: orderCheck[0].trang_thai_don_hang_id,
                items: items
            }
        });

    } catch (error) {
        console.error('Error getting user order reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};