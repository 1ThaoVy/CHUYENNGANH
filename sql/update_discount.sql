-- Script cập nhật thêm cột giảm giá cho bảng san_pham
-- Chạy script này để cập nhật database hiện tại
-- Sửa lỗi
ALTER TABLE san_pham DROP COLUMN gia_goc;
SELECT DATABASE();
SHOW COLUMNS FROM san_pham;
SELECT COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'san_pham'
  AND COLUMN_NAME LIKE '%gia%';
SHOW COLUMNS FROM san_pham;

-- Thêm cột gia_goc và phan_tram_giam
ALTER TABLE san_pham
ADD COLUMN gia_goc DECIMAL(10,2) COMMENT 'Giá gốc trước khi giảm' AFTER gia_ban;

-- Cập nhật một số sản phẩm giảm giá 30%

-- Chanel (giảm giá 4 sản phẩm - 30%)
UPDATE `san_pham` SET gia_goc = 4500000.00, gia_ban = 3150000.00, phan_tram_giam = 30 WHERE san_pham_id = 1; -- Chanel N°5
UPDATE `san_pham` SET gia_goc = 4200000.00, gia_ban = 2940000.00, phan_tram_giam = 30 WHERE san_pham_id = 2; -- Coco Mademoiselle
UPDATE `san_pham` SET gia_goc = 3800000.00, gia_ban = 2660000.00, phan_tram_giam = 30 WHERE san_pham_id = 3; -- Bleu de Chanel
UPDATE `san_pham` SET gia_goc = 3500000.00, gia_ban = 2450000.00, phan_tram_giam = 30 WHERE san_pham_id = 4; -- Chance Eau Tendre

-- Dior (giảm giá 4 sản phẩm - 30%)
UPDATE `san_pham` SET gia_goc = 3600000.00, gia_ban = 2520000.00, phan_tram_giam = 30 WHERE san_pham_id = 16; -- Sauvage
UPDATE `san_pham` SET gia_goc = 3300000.00, gia_ban = 2310000.00, phan_tram_giam = 30 WHERE san_pham_id = 17; -- Miss Dior Blooming
UPDATE `san_pham` SET gia_goc = 4000000.00, gia_ban = 2800000.00, phan_tram_giam = 30 WHERE san_pham_id = 18; -- Dior Homme Intense
UPDATE `san_pham` SET gia_goc = 3700000.00, gia_ban = 2590000.00, phan_tram_giam = 30 WHERE san_pham_id = 19; -- J'adore

-- Le Labo (giảm giá 4 sản phẩm - 30%)
UPDATE `san_pham` SET gia_goc = 4800000.00, gia_ban = 3360000.00, phan_tram_giam = 30 WHERE san_pham_id = 31; -- Santal 33
UPDATE `san_pham` SET gia_goc = 4600000.00, gia_ban = 3220000.00, phan_tram_giam = 30 WHERE san_pham_id = 32; -- Rose 31
UPDATE `san_pham` SET gia_goc = 4900000.00, gia_ban = 3430000.00, phan_tram_giam = 30 WHERE san_pham_id = 33; -- Another 13
UPDATE `san_pham` SET gia_goc = 4500000.00, gia_ban = 3150000.00, phan_tram_giam = 30 WHERE san_pham_id = 34; -- Bergamote 22

-- Calvin Klein (giảm giá 4 sản phẩm - 30%)
UPDATE `san_pham` SET gia_goc = 1200000.00, gia_ban = 840000.00, phan_tram_giam = 30 WHERE san_pham_id = 46; -- CK One
UPDATE `san_pham` SET gia_goc = 1500000.00, gia_ban = 1050000.00, phan_tram_giam = 30 WHERE san_pham_id = 47; -- Eternity
UPDATE `san_pham` SET gia_goc = 1800000.00, gia_ban = 1260000.00, phan_tram_giam = 30 WHERE san_pham_id = 48; -- Euphoria
UPDATE `san_pham` SET gia_goc = 1600000.00, gia_ban = 1120000.00, phan_tram_giam = 30 WHERE san_pham_id = 49; -- Obsession

-- Gucci (giảm giá 4 sản phẩm - 30%)
UPDATE `san_pham` SET gia_goc = 3500000.00, gia_ban = 2450000.00, phan_tram_giam = 30 WHERE san_pham_id = 61; -- Bloom
UPDATE `san_pham` SET gia_goc = 3200000.00, gia_ban = 2240000.00, phan_tram_giam = 30 WHERE san_pham_id = 62; -- Guilty Pour Homme
UPDATE `san_pham` SET gia_goc = 3300000.00, gia_ban = 2310000.00, phan_tram_giam = 30 WHERE san_pham_id = 63; -- Flora
UPDATE `san_pham` SET gia_goc = 3000000.00, gia_ban = 2100000.00, phan_tram_giam = 30 WHERE san_pham_id = 64; -- Mémoire d'une Odeur
