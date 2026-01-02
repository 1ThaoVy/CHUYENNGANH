const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Lấy danh sách tin tức (public)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Query với LIMIT và OFFSET cố định trong string
    const [articles] = await db.execute(`
      SELECT t.*, n.ho_ten as tac_gia_ten 
      FROM tin_tuc t 
      LEFT JOIN nguoi_dung n ON t.tac_gia_id = n.nguoi_dung_id 
      WHERE t.trang_thai = ? 
      ORDER BY t.ngay_tao DESC 
      LIMIT ${limit} OFFSET ${offset}
    `, ['da_xuat_ban']);

    const [countResult] = await db.execute(`
      SELECT COUNT(*) as total 
      FROM tin_tuc 
      WHERE trang_thai = ?
    `, ['da_xuat_ban']);

    res.json({
      success: true,
      data: articles,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
});

// Lấy chi tiết tin tức
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const [articles] = await db.execute(`
      SELECT t.*, n.ho_ten as tac_gia_ten 
      FROM tin_tuc t 
      LEFT JOIN nguoi_dung n ON t.tac_gia_id = n.nguoi_dung_id 
      WHERE t.slug = ? AND t.trang_thai = 'da_xuat_ban'
    `, [slug]);

    if (articles.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
    }

    // Tăng lượt xem
    await db.execute(`
      UPDATE tin_tuc 
      SET luot_xem = luot_xem + 1 
      WHERE tin_tuc_id = ?
    `, [articles[0].tin_tuc_id]);

    articles[0].luot_xem += 1;

    res.json({
      success: true,
      data: articles[0]
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Admin: Lấy tất cả tin tức
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status || '';

    let query = `
      SELECT t.*, n.ho_ten as tac_gia_ten 
      FROM tin_tuc t 
      LEFT JOIN nguoi_dung n ON t.tac_gia_id = n.nguoi_dung_id 
    `;
    
    let countQuery = `SELECT COUNT(*) as total FROM tin_tuc t`;
    let queryParams = [];
    let countParams = [];

    if (status) {
      query += ` WHERE t.trang_thai = ?`;
      countQuery += ` WHERE t.trang_thai = ?`;
      queryParams.push(status);
      countParams.push(status);
    }

    query += ` ORDER BY t.ngay_tao DESC LIMIT ${limit} OFFSET ${offset}`;

    const [articles] = await db.execute(query, queryParams);
    const [countResult] = await db.execute(countQuery, countParams);

    res.json({
      success: true,
      data: articles,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching admin news:', error);
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
});

// Admin: Tạo tin tức mới
router.post('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { tieu_de, slug, tom_tat, noi_dung, hinh_anh_dai_dien, trang_thai } = req.body;

    if (!tieu_de || !slug || !noi_dung) {
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu thông tin bắt buộc' 
      });
    }

    // Kiểm tra slug trùng
    const [existingSlug] = await db.execute(
      'SELECT tin_tuc_id FROM tin_tuc WHERE slug = ?',
      [slug]
    );

    if (existingSlug.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Slug đã tồn tại' 
      });
    }

    const [result] = await db.execute(`
      INSERT INTO tin_tuc (tieu_de, slug, tom_tat, noi_dung, hinh_anh_dai_dien, tac_gia_id, trang_thai) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [tieu_de, slug, tom_tat, noi_dung, hinh_anh_dai_dien, req.user.nguoi_dung_id, trang_thai || 'ban_nhap']);

    res.status(201).json({
      success: true,
      message: 'Tạo tin tức thành công',
      data: { tin_tuc_id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Admin: Cập nhật tin tức
router.put('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { tieu_de, slug, tom_tat, noi_dung, hinh_anh_dai_dien, trang_thai } = req.body;

    // Kiểm tra slug trùng (trừ bài viết hiện tại)
    const [existingSlug] = await db.execute(
      'SELECT tin_tuc_id FROM tin_tuc WHERE slug = ? AND tin_tuc_id != ?',
      [slug, id]
    );

    if (existingSlug.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Slug đã tồn tại' 
      });
    }

    await db.execute(`
      UPDATE tin_tuc 
      SET tieu_de = ?, slug = ?, tom_tat = ?, noi_dung = ?, 
          hinh_anh_dai_dien = ?, trang_thai = ?, ngay_cap_nhat = NOW()
      WHERE tin_tuc_id = ?
    `, [tieu_de, slug, tom_tat, noi_dung, hinh_anh_dai_dien, trang_thai, id]);

    res.json({
      success: true,
      message: 'Cập nhật tin tức thành công'
    });
  } catch (error) {
    console.error('Error updating news:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Admin: Xóa tin tức
router.delete('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await db.execute('DELETE FROM tin_tuc WHERE tin_tuc_id = ?', [id]);

    res.json({
      success: true,
      message: 'Xóa tin tức thành công'
    });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

module.exports = router;