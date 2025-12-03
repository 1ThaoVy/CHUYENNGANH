const db = require('../config/database');

// Lấy danh sách sản phẩm (có phân trang, lọc)
exports.getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 12, danh_muc_id, search, sort = 'moi_nhat', giam_gia } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT sp.*, dm.ten_danh_muc, dm.slug as danh_muc_slug
      FROM san_pham sp
      LEFT JOIN danh_muc dm ON sp.danh_muc_id = dm.danh_muc_id
      WHERE sp.trang_thai_hien_thi = 1
    `;
    const params = [];

    // Lọc theo danh mục
    if (danh_muc_id) {
      query += ' AND sp.danh_muc_id = ?';
      params.push(danh_muc_id);
    }

    // Tìm kiếm theo tên
    if (search) {
      query += ' AND sp.ten_san_pham LIKE ?';
      params.push(`%${search}%`);
    }

    // Lọc sản phẩm giảm giá
    if (giam_gia === 'true') {
      query += ' AND sp.phan_tram_giam > 0';
    }

    // Sắp xếp
    if (sort === 'gia_thap') {
      query += ' ORDER BY sp.gia_ban ASC';
    } else if (sort === 'gia_cao') {
      query += ' ORDER BY sp.gia_ban DESC';
    } else if (sort === 'giam_gia') {
      query += ' ORDER BY sp.phan_tram_giam DESC';
    } else {
      query += ' ORDER BY sp.ngay_tao DESC';
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [products] = await db.query(query, params);

    // Đếm tổng số sản phẩm
    let countQuery = 'SELECT COUNT(*) as total FROM san_pham WHERE trang_thai_hien_thi = 1';
    const countParams = [];
    if (danh_muc_id) {
      countQuery += ' AND danh_muc_id = ?';
      countParams.push(danh_muc_id);
    }
    if (search) {
      countQuery += ' AND ten_san_pham LIKE ?';
      countParams.push(`%${search}%`);
    }
    if (giam_gia === 'true') {
      countQuery += ' AND phan_tram_giam > 0';
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// Lấy chi tiết sản phẩm
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await db.query(`
      SELECT sp.*, dm.ten_danh_muc, dm.slug as danh_muc_slug
      FROM san_pham sp
      LEFT JOIN danh_muc dm ON sp.danh_muc_id = dm.danh_muc_id
      WHERE sp.san_pham_id = ?
    `, [id]);

    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    // Lấy đánh giá của sản phẩm
    const [reviews] = await db.query(`
      SELECT dg.*, nd.ho_ten
      FROM danh_gia_san_pham dg
      JOIN nguoi_dung nd ON dg.nguoi_dung_id = nd.nguoi_dung_id
      WHERE dg.san_pham_id = ?
      ORDER BY dg.ngay_tao DESC
    `, [id]);

    res.json({
      success: true,
      data: {
        ...products[0],
        reviews
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// Tạo sản phẩm mới (Admin only)
exports.createProduct = async (req, res) => {
  try {
    const { danh_muc_id, ten_san_pham, mo_ta, gia_ban, so_luong_ton, dung_tich, url_hinh_anh_chinh } = req.body;

    const [result] = await db.query(
      'INSERT INTO san_pham (danh_muc_id, ten_san_pham, mo_ta, gia_ban, so_luong_ton, dung_tich, url_hinh_anh_chinh) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [danh_muc_id, ten_san_pham, mo_ta, gia_ban, so_luong_ton, dung_tich, url_hinh_anh_chinh]
    );

    res.status(201).json({
      success: true,
      message: 'Tạo sản phẩm thành công',
      data: { san_pham_id: result.insertId }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật sản phẩm (Admin only)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];

    await db.query(`UPDATE san_pham SET ${fields} WHERE san_pham_id = ?`, values);

    res.json({ success: true, message: 'Cập nhật sản phẩm thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// Xóa sản phẩm (Admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE san_pham SET trang_thai_hien_thi = 0 WHERE san_pham_id = ?', [id]);
    res.json({ success: true, message: 'Xóa sản phẩm thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};
