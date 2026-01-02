const db = require('../config/database');

// Lấy tất cả danh mục
exports.getCategories = async (req, res) => {
  try {
    console.log('Getting categories...');
    const [categories] = await db.execute(`
      SELECT dm.*, COUNT(sp.san_pham_id) as so_luong_san_pham
      FROM danh_muc dm
      LEFT JOIN san_pham sp ON dm.danh_muc_id = sp.danh_muc_id AND sp.trang_thai_hien_thi = 1
      GROUP BY dm.danh_muc_id
      ORDER BY dm.ten_danh_muc
    `);
    console.log('Categories found:', categories.length);
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// Lấy chi tiết danh mục
exports.getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const [categories] = await db.execute('SELECT * FROM danh_muc WHERE danh_muc_id = ?', [id]);
    
    if (categories.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }

    res.json({ success: true, data: categories[0] });
  } catch (error) {
    console.error('Error getting category:', error);
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// Tạo danh mục mới
exports.createCategory = async (req, res) => {
  try {
    const { ten_danh_muc, slug, mo_ta } = req.body;

    if (!ten_danh_muc || !slug) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tên danh mục và slug là bắt buộc' 
      });
    }

    // Kiểm tra slug trùng
    const [existingSlug] = await db.execute(
      'SELECT danh_muc_id FROM danh_muc WHERE slug = ?',
      [slug]
    );

    if (existingSlug.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Slug đã tồn tại' 
      });
    }

    const [result] = await db.execute(
      'INSERT INTO danh_muc (ten_danh_muc, slug, mo_ta) VALUES (?, ?, ?)',
      [ten_danh_muc, slug, mo_ta]
    );

    res.status(201).json({
      success: true,
      message: 'Tạo danh mục thành công',
      data: { danh_muc_id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật danh mục
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { ten_danh_muc, slug, mo_ta } = req.body;

    if (!ten_danh_muc || !slug) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tên danh mục và slug là bắt buộc' 
      });
    }

    // Kiểm tra danh mục tồn tại
    const [existing] = await db.execute(
      'SELECT danh_muc_id FROM danh_muc WHERE danh_muc_id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy danh mục' 
      });
    }

    // Kiểm tra slug trùng (trừ danh mục hiện tại)
    const [existingSlug] = await db.execute(
      'SELECT danh_muc_id FROM danh_muc WHERE slug = ? AND danh_muc_id != ?',
      [slug, id]
    );

    if (existingSlug.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Slug đã tồn tại' 
      });
    }

    await db.execute(
      'UPDATE danh_muc SET ten_danh_muc = ?, slug = ?, mo_ta = ? WHERE danh_muc_id = ?',
      [ten_danh_muc, slug, mo_ta, id]
    );

    res.json({
      success: true,
      message: 'Cập nhật danh mục thành công'
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// Xóa danh mục
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra danh mục tồn tại
    const [existing] = await db.execute(
      'SELECT danh_muc_id FROM danh_muc WHERE danh_muc_id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy danh mục' 
      });
    }

    // Kiểm tra có sản phẩm trong danh mục không
    const [products] = await db.execute(
      'SELECT COUNT(*) as count FROM san_pham WHERE danh_muc_id = ?',
      [id]
    );

    if (products[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Không thể xóa danh mục có sản phẩm. Vui lòng xóa hoặc chuyển sản phẩm sang danh mục khác trước.' 
      });
    }

    await db.execute('DELETE FROM danh_muc WHERE danh_muc_id = ?', [id]);

    res.json({
      success: true,
      message: 'Xóa danh mục thành công'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};
