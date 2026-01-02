-- Tạo bảng tin_tuc
USE orianna_shop_db;

-- Bảng TIN_TUC (Bài viết tin tức)
CREATE TABLE IF NOT EXISTS `tin_tuc` (
    `tin_tuc_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID Tin tức',
    `tieu_de` VARCHAR(255) NOT NULL COMMENT 'Tiêu đề bài viết',
    `slug` VARCHAR(255) NOT NULL UNIQUE COMMENT 'Đường dẫn thân thiện',
    `tom_tat` TEXT COMMENT 'Tóm tắt ngắn',
    `noi_dung` LONGTEXT NOT NULL COMMENT 'Nội dung đầy đủ',
    `hinh_anh_dai_dien` VARCHAR(255) COMMENT 'Ảnh đại diện bài viết',
    `tac_gia_id` INT COMMENT 'ID Admin tạo bài',
    `trang_thai` ENUM('ban_nhap', 'da_xuat_ban', 'an') NOT NULL DEFAULT 'ban_nhap' COMMENT 'Trạng thái bài viết',
    `luot_xem` INT DEFAULT 0 COMMENT 'Số lượt xem',
    `ngay_tao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày tạo',
    `ngay_cap_nhat` DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT 'Ngày cập nhật',
    FOREIGN KEY (`tac_gia_id`) REFERENCES `nguoi_dung`(`nguoi_dung_id`)
) COMMENT='Bảng quản lý tin tức/bài viết';

-- Thêm dữ liệu mẫu
INSERT INTO `tin_tuc` (`tieu_de`, `slug`, `tom_tat`, `noi_dung`, `hinh_anh_dai_dien`, `tac_gia_id`, `trang_thai`, `luot_xem`, `ngay_tao`) VALUES
('Xu hướng nước hoa mùa xuân 2025', 'xu-huong-nuoc-hoa-mua-xuan-2025', 'Khám phá những xu hướng nước hoa hot nhất mùa xuân năm nay với các note hương tươi mát và quyến rũ.', 
'<h2>Xu hướng nước hoa mùa xuân 2025</h2>
<p>Mùa xuân 2025 đang đến gần, và cùng với đó là những xu hướng nước hoa mới đầy thú vị. Năm nay, các nhà chế tác nước hoa tập trung vào việc tạo ra những mùi hương tươi mát, nhẹ nhang nhưng vẫn đầy quyến rũ.</p>

<h3>1. Hương hoa cỏ tươi mát</h3>
<p>Các note hương hoa cỏ như hoa nhài, hoa huệ, và hoa hồng trắng đang trở thành xu hướng chính. Chúng mang lại cảm giác tươi mới, thanh khiết và rất phù hợp với không khí mùa xuân.</p>

<h3>2. Hương trái cây nhiệt đới</h3>
<p>Các note hương trái cây như xoài, dứa, và chanh dây đang được ưa chuộng. Chúng tạo ra sự tươi mát và năng động, hoàn hảo cho những ngày xuân ấm áp.</p>

<h3>3. Hương gỗ nhẹ</h3>
<p>Thay vì những note gỗ nặng nề, mùa xuân 2025 ưa chuộng các loại gỗ nhẹ như gỗ tuyết tùng và gỗ đàn hương trắng, tạo nên sự cân bằng hoàn hảo.</p>

<p>Hãy đến với Orianna Shop để khám phá bộ sưu tập nước hoa mùa xuân 2025 của chúng tôi!</p>', 
'/images/news/spring-2025-trends.jpg', 1, 'da_xuat_ban', 156, '2025-01-15 09:00:00'),

('Cách bảo quản nước hoa đúng cách', 'cach-bao-quan-nuoc-hoa-dung-cach', 'Hướng dẫn chi tiết cách bảo quản nước hoa để giữ được chất lượng và độ bền của hương thơm.', 
'<h2>Cách bảo quản nước hoa đúng cách</h2>
<p>Nước hoa là một khoản đầu tư không nhỏ, vì vậy việc bảo quản đúng cách là rất quan trọng để duy trì chất lượng và độ bền của hương thơm.</p>

<h3>1. Tránh ánh sáng trực tiếp</h3>
<p>Ánh sáng mặt trời có thể phá hủy các phân tử hương thơm. Hãy bảo quản nước hoa ở nơi tối, mát mẻ.</p>

<h3>2. Nhiệt độ ổn định</h3>
<p>Nhiệt độ lý tưởng để bảo quản nước hoa là từ 15-20°C. Tránh để nước hoa ở nơi có nhiệt độ thay đổi đột ngột.</p>

<h3>3. Đậy nắp kín</h3>
<p>Luôn đậy nắp chai nước hoa sau khi sử dụng để tránh bay hơi và oxy hóa.</p>

<h3>4. Không lắc chai</h3>
<p>Việc lắc chai có thể tạo ra bọt khí và làm thay đổi cấu trúc của nước hoa.</p>

<p>Với những mẹo này, nước hoa của bạn sẽ giữ được chất lượng tốt nhất trong thời gian dài nhất!</p>', 
'/images/news/perfume-storage.jpg', 1, 'da_xuat_ban', 89, '2025-01-10 14:30:00'),

('Top 5 nước hoa unisex được yêu thích nhất', 'top-5-nuoc-hoa-unisex-duoc-yeu-thich-nhat', 'Danh sách những chai nước hoa unisex hot nhất hiện nay, phù hợp cho cả nam và nữ.', 
'<h2>Top 5 nước hoa unisex được yêu thích nhất</h2>
<p>Nước hoa unisex đang trở thành xu hướng được nhiều người yêu thích bởi tính linh hoạt và sự độc đáo. Dưới đây là top 5 chai nước hoa unisex hot nhất hiện nay:</p>

<h3>1. Le Labo Santal 33</h3>
<p>Với note hương gỗ đàn hương đặc trưng, Santal 33 là biểu tượng của sự tinh tế và hiện đại.</p>

<h3>2. CK One</h3>
<p>Một trong những chai nước hoa unisex kinh điển, CK One mang hương thơm tươi mát và sạch sẽ.</p>

<h3>3. Gucci Mémoire d''une Odeur</h3>
<p>Hương thơm độc đáo với note hoa cúc La Mã, tạo nên sự bí ẩn và thu hút.</p>

<h3>4. Le Labo Another 13</h3>
<p>Hương ambroxan sạch sẽ và gây nghiện, phù hợp cho mọi dịp.</p>

<h3>5. Calvin Klein Eternity</h3>
<p>Hương hoa cỏ cổ điển, thanh lịch và vượt thời gian.</p>

<p>Tất cả những chai nước hoa này đều có sẵn tại Orianna Shop với giá ưu đãi!</p>', 
'/images/news/top-unisex-perfumes.jpg', 1, 'da_xuat_ban', 234, '2025-01-05 16:45:00');