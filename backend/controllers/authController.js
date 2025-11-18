const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Đăng ký tài khoản mới
exports.register = async (req, res) => {
  try {
    const { ho_ten, email, mat_khau, so_dien_thoai, dia_chi } = req.body;

    // Kiểm tra email đã tồn tại
    const [existing] = await db.query('SELECT * FROM nguoi_dung WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email đã được sử dụng' });
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const mat_khau_hash = await bcrypt.hash(mat_khau, salt);

    // Thêm user mới
    const [result] = await db.query(
      'INSERT INTO nguoi_dung (ho_ten, email, mat_khau_hash, so_dien_thoai, dia_chi) VALUES (?, ?, ?, ?, ?)',
      [ho_ten, email, mat_khau_hash, so_dien_thoai, dia_chi]
    );

    // Tạo JWT token
    const token = jwt.sign(
      { nguoi_dung_id: result.insertId, vai_tro: 'khach_hang' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      token,
      user: { nguoi_dung_id: result.insertId, ho_ten, email, vai_tro: 'khach_hang' }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, mat_khau } = req.body;

    // Tìm user
    const [users] = await db.query('SELECT * FROM nguoi_dung WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    const user = users[0];

    // Kiểm tra tài khoản có bị vô hiệu hóa
    if (user.trang_thai === 'vo_hieu') {
      return res.status(403).json({ success: false, message: 'Tài khoản đã bị vô hiệu hóa' });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(mat_khau, user.mat_khau_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    // Tạo token
    const token = jwt.sign(
      { nguoi_dung_id: user.nguoi_dung_id, vai_tro: user.vai_tro },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        nguoi_dung_id: user.nguoi_dung_id,
        ho_ten: user.ho_ten,
        email: user.email,
        vai_tro: user.vai_tro
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// Lấy thông tin user hiện tại
exports.getMe = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT nguoi_dung_id, ho_ten, email, so_dien_thoai, dia_chi, vai_tro, trang_thai, ngay_tao FROM nguoi_dung WHERE nguoi_dung_id = ?',
      [req.user.nguoi_dung_id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    res.json({ success: true, data: users[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};
