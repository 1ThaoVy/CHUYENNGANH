const db = require('../config/database');

// Lấy tất cả danh mục
exports.getCategories = async (req, res) => {
  try {
    const [categories] = await db.query(`
      SELECT dm.*, COUNT(sp.san_pham_id) as so_luong_san_pham
      FROM danh_muc dm
      LEFT JOIN san_pham sp ON dm.danh_muc_id = sp.danh_muc_id AND sp.trang_thai_hien_thi = 1
      GROUP BY dm.danh_muc_id
      ORDER BY dm.ten_danh_muc
    `);
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// Lấy chi tiết danh mục
exports.getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const [categories] = await db.query('SELECT * FROM danh_muc WHERE danh_muc_id = ?', [id]);
    
    if (categories.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }

    res.json({ success: true, data: categories[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};
