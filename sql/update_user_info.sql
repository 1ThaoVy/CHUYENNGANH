-- Cập nhật thông tin tài khoản Hứa Thảo Vy
UPDATE nguoi_dung 
SET 
    so_dien_thoai = '0911256789',
    dia_chi = 'Trà Vinh'
WHERE ho_ten = 'Hứa Thảo Vy';

-- Kiểm tra kết quả cập nhật
SELECT nguoi_dung_id, ho_ten, email, so_dien_thoai, dia_chi, vai_tro
FROM nguoi_dung 
WHERE ho_ten = 'Hứa Thảo Vy';