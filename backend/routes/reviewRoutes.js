const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Lấy đánh giá của sản phẩm
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [reviews] = await db.execute(`
      SELECT d.*, n.ho_ten as ten_khach_hang,
             DATE_FORMAT(d.ngay_tao, '%d/%m/%Y %H:%i') as ngay_tao_formatted
      FROM danh_gia_san_pham d
      JOIN nguoi_dung n ON d.nguoi_dung_id = n.nguoi_dung_id
      WHERE d.san_pham_id = ? AND d.trang_thai = 'hien_thi'
      ORDER BY d.ngay_tao DESC
      LIMIT ? OFFSET ?
    `, [productId, limit, offset]);

    const [countResult] = await db.execute(`
      SELECT COUNT(*) as total 
      FROM danh_gia_san_pham 
      WHERE san_pham_id = ? AND trang_thai = 'hien_thi'
    `, [productId]);

    // Tính thống kê đánh giá
    const [stats] = await db.execute(`
      SELECT 
        AVG(xep_hang) as diem_trung_binh,
        COUNT(*) as tong_danh_gia,
        SUM(CASE WHEN xep_hang = 5 THEN 1 ELSE 0 END) as sao_5,
        SUM(CASE WHEN xep_hang = 4 THEN 1 ELSE 0 END) as sao_4,
        SUM(CASE WHEN xep_hang = 3 THEN 1 ELSE 0 END) as sao_3,
        SUM(CASE WHEN xep_hang = 2 THEN 1 ELSE 0 END) as sao_2,
        SUM(CASE WHEN xep_hang = 1 THEN 1 ELSE 0 END) as sao_1
      FROM danh_gia_san_pham 
      WHERE san_pham_id = ? AND trang_thai = 'hien_thi'
    `, [productId]);

    res.json({
      success: true,
      data: {
        reviews,
        stats: stats[0],
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Kiểm tra quyền đánh giá sản phẩm
router.get('/can-review/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.nguoi_dung_id;

    // Kiểm tra đã mua sản phẩm và đơn hàng đã hoàn thành
    const [orders] = await db.execute(`
      SELECT dh.don_hang_id, dh.ngay_dat_hang,
             DATEDIFF(NOW(), dh.ngay_dat_hang) as ngay_da_qua
      FROM don_hang dh
      JOIN chi_tiet_don_hang ct ON dh.don_hang_id = ct.don_hang_id
      WHERE dh.nguoi_dung_id = ? 
        AND ct.san_pham_id = ? 
        AND dh.trang_thai_don_hang_id = 4
        AND DATEDIFF(NOW(), dh.ngay_dat_hang) <= 3
    `, [userId, productId]);

    if (orders.length === 0) {
      return res.json({
        success: true,
        canReview: false,
        message: 'Bạn chỉ có thể đánh giá sản phẩm đã mua và trong vòng 3 ngày sau khi đơn hàng hoàn thành'
      });
    }

    // Kiểm tra đã đánh giá chưa
    const [existingReviews] = await db.execute(`
      SELECT danh_gia_id 
      FROM danh_gia_san_pham 
      WHERE nguoi_dung_id = ? AND san_pham_id = ?
    `, [userId, productId]);

    if (existingReviews.length > 0) {
      return res.json({
        success: true,
        canReview: false,
        message: 'Bạn đã đánh giá sản phẩm này rồi'
      });
    }

    res.json({
      success: true,
      canReview: true,
      availableOrders: orders
    });
  } catch (error) {
    console.error('Error checking review permission:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Tạo đánh giá mới
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { san_pham_id, don_hang_id, xep_hang, binh_luan } = req.body;
    const userId = req.user.nguoi_dung_id;

    if (!san_pham_id || !don_hang_id || !xep_hang) {
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu thông tin bắt buộc' 
      });
    }

    if (xep_hang < 1 || xep_hang > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Xếp hạng phải từ 1 đến 5 sao' 
      });
    }

    // Kiểm tra quyền đánh giá
    const [orderCheck] = await db.execute(`
      SELECT dh.don_hang_id
      FROM don_hang dh
      JOIN chi_tiet_don_hang ct ON dh.don_hang_id = ct.don_hang_id
      WHERE dh.nguoi_dung_id = ? 
        AND ct.san_pham_id = ? 
        AND dh.don_hang_id = ?
        AND dh.trang_thai_don_hang_id = 4
        AND DATEDIFF(NOW(), dh.ngay_dat_hang) <= 3
    `, [userId, san_pham_id, don_hang_id]);

    if (orderCheck.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'Bạn không có quyền đánh giá sản phẩm này' 
      });
    }

    // Kiểm tra đã đánh giá chưa
    const [existingReview] = await db.execute(`
      SELECT danh_gia_id 
      FROM danh_gia_san_pham 
      WHERE nguoi_dung_id = ? AND san_pham_id = ? AND don_hang_id = ?
    `, [userId, san_pham_id, don_hang_id]);

    if (existingReview.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bạn đã đánh giá sản phẩm này rồi' 
      });
    }

    const [result] = await db.execute(`
      INSERT INTO danh_gia_san_pham (san_pham_id, nguoi_dung_id, don_hang_id, xep_hang, binh_luan, trang_thai) 
      VALUES (?, ?, ?, ?, ?, 'hien_thi')
    `, [san_pham_id, userId, don_hang_id, xep_hang, binh_luan]);

    res.status(201).json({
      success: true,
      message: 'Đánh giá thành công',
      data: { danh_gia_id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating review:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false, 
        message: 'Bạn đã đánh giá sản phẩm này rồi' 
      });
    }
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Cập nhật đánh giá
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { xep_hang, binh_luan } = req.body;
    const userId = req.user.nguoi_dung_id;

    if (xep_hang < 1 || xep_hang > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Xếp hạng phải từ 1 đến 5 sao' 
      });
    }

    // Kiểm tra quyền sở hữu
    const [review] = await db.execute(`
      SELECT danh_gia_id 
      FROM danh_gia_san_pham 
      WHERE danh_gia_id = ? AND nguoi_dung_id = ?
    `, [id, userId]);

    if (review.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'Bạn không có quyền chỉnh sửa đánh giá này' 
      });
    }

    await db.execute(`
      UPDATE danh_gia_san_pham 
      SET xep_hang = ?, binh_luan = ?
      WHERE danh_gia_id = ?
    `, [xep_hang, binh_luan, id]);

    res.json({
      success: true,
      message: 'Cập nhật đánh giá thành công'
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Xóa đánh giá
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.nguoi_dung_id;

    // Kiểm tra quyền sở hữu
    const [review] = await db.execute(`
      SELECT danh_gia_id 
      FROM danh_gia_san_pham 
      WHERE danh_gia_id = ? AND nguoi_dung_id = ?
    `, [id, userId]);

    if (review.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'Bạn không có quyền xóa đánh giá này' 
      });
    }

    await db.execute('DELETE FROM danh_gia_san_pham WHERE danh_gia_id = ?', [id]);

    res.json({
      success: true,
      message: 'Xóa đánh giá thành công'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

module.exports = router;