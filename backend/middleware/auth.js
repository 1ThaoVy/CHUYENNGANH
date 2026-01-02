const jwt = require('jsonwebtoken');

// Middleware xác thực token
exports.authenticateToken = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Không có quyền truy cập' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token không hợp lệ' });
  }
};

// Middleware kiểm tra quyền admin
exports.requireAdmin = (req, res, next) => {
  if (!req.user || req.user.vai_tro !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Bạn không có quyền thực hiện thao tác này' 
    });
  }
  next();
};

// Middleware xác thực token (alias cũ)
exports.protect = exports.authenticateToken;

// Middleware kiểm tra quyền (alias cũ)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.vai_tro)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Bạn không có quyền thực hiện thao tác này' 
      });
    }
    next();
  };
};
