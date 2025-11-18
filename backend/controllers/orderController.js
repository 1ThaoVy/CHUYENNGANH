const db = require('../config/database');

// Tạo đơn hàng mới
exports.createOrder = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { ten_nguoi_nhan, sdt_nguoi_nhan, dia_chi_giao_hang, phuong_thuc_thanh_toan, items } = req.body;
    const nguoi_dung_id = req.user.nguoi_dung_id;

    // Tính tổng tiền
    let tong_tien = 0;
    for (const item of items) {
      const [products] = await connection.query('SELECT gia_ban, so_luong_ton FROM san_pham WHERE san_pham_id = ?', [item.san_pham_id]);
      
      if (products.length === 0) {
        throw new Error(`Sản phẩm ID ${item.san_pham_id} không tồn tại`);
      }

      if (products[0].so_luong_ton < item.so_luong) {
        throw new Error(`Sản phẩm ID ${item.san_pham_id} không đủ số lượng`);
      }

      tong_tien += products[0].gia_ban * item.so_luong;
    }

    // Tạo đơn hàng
    const [orderResult] = await connection.query(
      'INSERT INTO don_hang (nguoi_dung_id, trang_thai_don_hang_id, ten_nguoi_nhan, sdt_nguoi_nhan, dia_chi_giao_hang, tong_tien, phuong_thuc_thanh_toan) VALUES (?, 1, ?, ?, ?, ?, ?)',
      [nguoi_dung_id, ten_nguoi_nhan, sdt_nguoi_nhan, dia_chi_giao_hang, tong_tien, phuong_thuc_thanh_toan]
    );

    const don_hang_id = orderResult.insertId;

    // Thêm chi tiết đơn hàng và cập nhật tồn kho
    for (const item of items) {
      const [products] = await connection.query('SELECT gia_ban FROM san_pham WHERE san_pham_id = ?', [item.san_pham_id]);
      const don_gia = products[0].gia_ban;
      const thanh_tien = don_gia * item.so_luong;

      await connection.query(
        'INSERT INTO chi_tiet_don_hang (don_hang_id, san_pham_id, so_luong, don_gia_tai_thoi_diem, thanh_tien) VALUES (?, ?, ?, ?, ?)',
        [don_hang_id, item.san_pham_id, item.so_luong, don_gia, thanh_tien]
      );

      await connection.query(
        'UPDATE san_pham SET so_luong_ton = so_luong_ton - ? WHERE san_pham_id = ?',
        [item.so_luong, item.san_pham_id]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công',
      data: { don_hang_id, tong_tien }
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

// Lấy danh sách đơn hàng của user
exports.getMyOrders = async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT dh.*, ttdh.ten_trang_thai, ttdh.ma_mau_sac
      FROM don_hang dh
      JOIN trang_thai_don_hang ttdh ON dh.trang_thai_don_hang_id = ttdh.trang_thai_id
      WHERE dh.nguoi_dung_id = ?
      ORDER BY dh.ngay_dat_hang DESC
    `, [req.user.nguoi_dung_id]);

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// Lấy chi tiết đơn hàng
exports.getOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const [orders] = await db.query(`
      SELECT dh.*, ttdh.ten_trang_thai, ttdh.ma_mau_sac
      FROM don_hang dh
      JOIN trang_thai_don_hang ttdh ON dh.trang_thai_don_hang_id = ttdh.trang_thai_id
      WHERE dh.don_hang_id = ?
    `, [id]);

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    // Kiểm tra quyền xem đơn hàng
    if (orders[0].nguoi_dung_id !== req.user.nguoi_dung_id && req.user.vai_tro !== 'admin') {
      return res.status(403).json({ success: false, message: 'Không có quyền xem đơn hàng này' });
    }

    // Lấy chi tiết sản phẩm trong đơn hàng
    const [items] = await db.query(`
      SELECT ct.*, sp.ten_san_pham, sp.url_hinh_anh_chinh
      FROM chi_tiet_don_hang ct
      JOIN san_pham sp ON ct.san_pham_id = sp.san_pham_id
      WHERE ct.don_hang_id = ?
    `, [id]);

    res.json({
      success: true,
      data: {
        ...orders[0],
        items
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật trạng thái đơn hàng (Admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { trang_thai_don_hang_id } = req.body;

    await db.query('UPDATE don_hang SET trang_thai_don_hang_id = ? WHERE don_hang_id = ?', [trang_thai_don_hang_id, id]);

    res.json({ success: true, message: 'Cập nhật trạng thái đơn hàng thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};
