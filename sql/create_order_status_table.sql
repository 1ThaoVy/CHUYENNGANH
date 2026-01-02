-- Tạo bảng trạng thái đơn hàng
USE orianna_shop_db;

CREATE TABLE IF NOT EXISTS `trang_thai_don_hang` (
    `trang_thai_don_hang_id` INT PRIMARY KEY,
    `ten_trang_thai` VARCHAR(50) NOT NULL,
    `mau_sac` VARCHAR(20) DEFAULT '#6b7280'
) COMMENT='Bảng trạng thái đơn hàng';

-- Thêm dữ liệu mẫu
INSERT IGNORE INTO `trang_thai_don_hang` VALUES 
(1, 'Chờ xử lý', '#f59e0b'),
(2, 'Đã xác nhận', '#3b82f6'),
(3, 'Đang giao hàng', '#8b5cf6'),
(4, 'Hoàn thành', '#10b981'),
(5, 'Đã hủy', '#ef4444');

-- Cập nhật bảng đơn hàng nếu chưa có cột trang_thai_don_hang_id
ALTER TABLE `don_hang` 
ADD COLUMN IF NOT EXISTS `trang_thai_don_hang_id` INT DEFAULT 1,
ADD FOREIGN KEY IF NOT EXISTS (`trang_thai_don_hang_id`) REFERENCES `trang_thai_don_hang`(`trang_thai_don_hang_id`);