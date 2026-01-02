const db = require('../config/database');

// Lấy thống kê tổng quan
exports.getOverviewStats = async (req, res) => {
  try {
    // Tổng số sản phẩm
    const [productsCount] = await db.query(
      'SELECT COUNT(*) as total FROM san_pham WHERE trang_thai_hien_thi = 1'
    );

    // Tổng số đơn hàng mới (chờ xử lý)
    const [newOrdersCount] = await db.query(
      'SELECT COUNT(*) as total FROM don_hang WHERE trang_thai_don_hang_id = 1'
    );

    // Tổng doanh thu tháng này
    const [monthlyRevenue] = await db.query(`
      SELECT COALESCE(SUM(tong_tien), 0) as total 
      FROM don_hang 
      WHERE MONTH(ngay_dat_hang) = MONTH(CURDATE()) 
      AND YEAR(ngay_dat_hang) = YEAR(CURDATE())
      AND trang_thai_don_hang_id IN (2, 3, 4)
    `);

    // Tổng số khách hàng
    const [customersCount] = await db.query(
      'SELECT COUNT(*) as total FROM nguoi_dung WHERE vai_tro = "khach_hang"'
    );

    res.json({
      success: true,
      data: {
        totalProducts: productsCount[0].total,
        newOrders: newOrdersCount[0].total,
        monthlyRevenue: monthlyRevenue[0].total,
        totalCustomers: customersCount[0].total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// Lấy dữ liệu doanh thu theo thời gian
exports.getRevenueData = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    let query = '';
    let labels = [];
    
    switch(period) {
      case 'day':
        // 7 ngày qua
        query = `
          SELECT 
            DATE(ngay_dat_hang) as period_date,
            DAYNAME(ngay_dat_hang) as period_label,
            COALESCE(SUM(tong_tien), 0) as revenue
          FROM don_hang 
          WHERE ngay_dat_hang >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
          AND trang_thai_don_hang_id IN (2, 3, 4)
          GROUP BY DATE(ngay_dat_hang), DAYNAME(ngay_dat_hang)
          ORDER BY period_date
        `;
        labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        break;
        
      case 'week':
        // 4 tuần qua
        query = `
          SELECT 
            WEEK(ngay_dat_hang) as period_week,
            CONCAT('Tuần ', WEEK(ngay_dat_hang) - WEEK(CURDATE()) + 4) as period_label,
            COALESCE(SUM(tong_tien), 0) as revenue
          FROM don_hang 
          WHERE ngay_dat_hang >= DATE_SUB(CURDATE(), INTERVAL 4 WEEK)
          AND trang_thai_don_hang_id IN (2, 3, 4)
          GROUP BY WEEK(ngay_dat_hang)
          ORDER BY period_week
        `;
        break;
        
      case 'month':
        // 12 tháng qua
        query = `
          SELECT 
            MONTH(ngay_dat_hang) as period_month,
            MONTHNAME(ngay_dat_hang) as period_label,
            COALESCE(SUM(tong_tien), 0) as revenue
          FROM don_hang 
          WHERE ngay_dat_hang >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
          AND trang_thai_don_hang_id IN (2, 3, 4)
          GROUP BY MONTH(ngay_dat_hang), YEAR(ngay_dat_hang)
          ORDER BY YEAR(ngay_dat_hang), MONTH(ngay_dat_hang)
        `;
        break;
        
      case 'year':
        // 5 năm qua
        query = `
          SELECT 
            YEAR(ngay_dat_hang) as period_year,
            YEAR(ngay_dat_hang) as period_label,
            COALESCE(SUM(tong_tien), 0) as revenue
          FROM don_hang 
          WHERE ngay_dat_hang >= DATE_SUB(CURDATE(), INTERVAL 5 YEAR)
          AND trang_thai_don_hang_id IN (2, 3, 4)
          GROUP BY YEAR(ngay_dat_hang)
          ORDER BY YEAR(ngay_dat_hang)
        `;
        break;
    }

    const [revenueData] = await db.query(query);
    
    // Chuyển đổi dữ liệu thành format phù hợp cho frontend
    const chartData = {
      labels: [],
      data: [],
      period: period
    };

    if (period === 'day') {
      // Tạo mảng 7 ngày với dữ liệu 0 mặc định
      const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
      const dayNamesEn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      
      chartData.labels = dayNames;
      chartData.data = new Array(7).fill(0);
      
      revenueData.forEach(row => {
        const dayIndex = dayNamesEn.indexOf(row.period_label);
        if (dayIndex !== -1) {
          chartData.data[dayIndex] = Math.round(row.revenue / 1000000); // Convert to millions
        }
      });
    } else {
      revenueData.forEach(row => {
        if (period === 'month') {
          chartData.labels.push(`T${row.period_month}`);
        } else {
          chartData.labels.push(row.period_label);
        }
        chartData.data.push(Math.round(row.revenue / 1000000)); // Convert to millions
      });
    }

    res.json({
      success: true,
      data: chartData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// Lấy đơn hàng gần đây
exports.getRecentOrders = async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT 
        dh.don_hang_id,
        nd.ho_ten,
        dh.tong_tien,
        dh.ngay_dat_hang,
        ttdh.ten_trang_thai,
        ttdh.mau_sac
      FROM don_hang dh
      JOIN nguoi_dung nd ON dh.nguoi_dung_id = nd.nguoi_dung_id
      JOIN trang_thai_don_hang ttdh ON dh.trang_thai_don_hang_id = ttdh.trang_thai_don_hang_id
      ORDER BY dh.ngay_dat_hang DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// Lấy sản phẩm bán chạy
exports.getTopProducts = async (req, res) => {
  try {
    const [products] = await db.query(`
      SELECT 
        sp.san_pham_id,
        sp.ten_san_pham,
        sp.gia_ban,
        sp.url_hinh_anh_chinh,
        dm.ten_danh_muc,
        COALESCE(SUM(ctdh.so_luong), 0) as total_sold
      FROM san_pham sp
      LEFT JOIN chi_tiet_don_hang ctdh ON sp.san_pham_id = ctdh.san_pham_id
      LEFT JOIN don_hang dh ON ctdh.don_hang_id = dh.don_hang_id AND dh.trang_thai_don_hang_id IN (2, 3, 4)
      LEFT JOIN danh_muc dm ON sp.danh_muc_id = dm.danh_muc_id
      WHERE sp.trang_thai_hien_thi = 1
      GROUP BY sp.san_pham_id
      ORDER BY total_sold DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// Lấy thống kê đơn hàng theo trạng thái
exports.getOrderStats = async (req, res) => {
  try {
    const [orderStats] = await db.query(`
      SELECT 
        ttdh.ten_trang_thai,
        ttdh.mau_sac,
        COUNT(dh.don_hang_id) as count
      FROM trang_thai_don_hang ttdh
      LEFT JOIN don_hang dh ON ttdh.trang_thai_don_hang_id = dh.trang_thai_don_hang_id
      GROUP BY ttdh.trang_thai_don_hang_id
      ORDER BY ttdh.trang_thai_don_hang_id
    `);

    res.json({
      success: true,
      data: orderStats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};