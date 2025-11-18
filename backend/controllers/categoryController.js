const db = require('../config/database');

// Lấy tất cả danh mục
exports.getCategories = async (req, res) => {
  try {
    const [categories] = await db.query('SELECT * FROM danh_muc ORDER BY ten_danh_muc');
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
