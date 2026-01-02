const express = require('express');
const router = express.Router();
const { 
  getOverviewStats, 
  getRevenueData, 
  getRecentOrders, 
  getTopProducts, 
  getOrderStats 
} = require('../controllers/dashboardController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Tất cả routes đều yêu cầu admin
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/dashboard/overview - Thống kê tổng quan
router.get('/overview', getOverviewStats);

// GET /api/dashboard/revenue?period=month - Dữ liệu doanh thu
router.get('/revenue', getRevenueData);

// GET /api/dashboard/recent-orders - Đơn hàng gần đây
router.get('/recent-orders', getRecentOrders);

// GET /api/dashboard/top-products - Sản phẩm bán chạy
router.get('/top-products', getTopProducts);

// GET /api/dashboard/order-stats - Thống kê đơn hàng theo trạng thái
router.get('/order-stats', getOrderStats);

module.exports = router;