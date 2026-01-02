const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Lấy flash sale đang hoạt động
router.get('/active', async (req, res) => {
    try {
        const query = `
            SELECT mg.*, 
                   COUNT(fsp.san_pham_id) as so_luong_san_pham
            FROM ma_giam_gia mg
            LEFT JOIN flash_sale_san_pham fsp ON mg.ma_giam_gia_id = fsp.ma_giam_gia_id
            WHERE mg.loai_khuyen_mai = 'flash_sale'
            AND mg.trang_thai = 'active' 
            AND mg.hien_thi_banner = TRUE
            AND mg.ngay_bat_dau <= NOW() 
            AND mg.ngay_ket_thuc > NOW()
            GROUP BY mg.ma_giam_gia_id
            ORDER BY mg.ngay_ket_thuc ASC
            LIMIT 1
        `;
        
        const [results] = await db.execute(query);
        
        if (results.length > 0) {
            const flashSale = results[0];
            
            // Lấy sản phẩm trong flash sale
            const productQuery = `
                SELECT sp.*, fsp.gia_flash_sale, fsp.so_luong_gioi_han, fsp.so_luong_da_ban,
                       dm.ten_danh_muc,
                       ROUND(((sp.gia_ban - fsp.gia_flash_sale) / sp.gia_ban) * 100) as phan_tram_giam_gia_flash
                FROM flash_sale_san_pham fsp
                JOIN san_pham sp ON fsp.san_pham_id = sp.san_pham_id
                LEFT JOIN danh_muc dm ON sp.danh_muc_id = dm.danh_muc_id
                WHERE fsp.ma_giam_gia_id = ? AND sp.trang_thai_hien_thi = TRUE
                ORDER BY fsp.created_at DESC
                LIMIT 8
            `;
            
            const [products] = await db.execute(productQuery, [flashSale.ma_giam_gia_id]);
            
            flashSale.san_pham = products;
            res.json({ success: true, data: flashSale });
        } else {
            res.json({ success: true, data: null });
        }
    } catch (error) {
        console.error('Error getting active flash sale:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// Lấy tất cả flash sale (admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const query = `
            SELECT mg.*, 
                   COUNT(fsp.san_pham_id) as so_luong_san_pham
            FROM ma_giam_gia mg
            LEFT JOIN flash_sale_san_pham fsp ON mg.ma_giam_gia_id = fsp.ma_giam_gia_id
            WHERE mg.loai_khuyen_mai = 'flash_sale'
            GROUP BY mg.ma_giam_gia_id
            ORDER BY mg.ngay_bat_dau DESC
        `;
        
        const [results] = await db.execute(query);
        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Error getting flash sales:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// Tạo flash sale mới (admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { 
            ma_code, 
            tieu_de_flash_sale, 
            mo_ta_flash_sale, 
            ngay_bat_dau, 
            ngay_ket_thuc, 
            mau_nen_flash_sale, 
            hien_thi_banner,
            san_pham 
        } = req.body;
        
        // Tạo flash sale
        const insertQuery = `
            INSERT INTO ma_giam_gia (
                ma_code, loai_giam_gia, gia_tri, ap_dung_toi_thieu, 
                ngay_bat_dau, ngay_ket_thuc, trang_thai, loai_khuyen_mai,
                tieu_de_flash_sale, mo_ta_flash_sale, mau_nen_flash_sale, hien_thi_banner
            ) VALUES (?, 'phan_tram', 0, 0, ?, ?, 'active', 'flash_sale', ?, ?, ?, ?)
        `;
        
        const [result] = await db.execute(insertQuery, [
            ma_code, ngay_bat_dau, ngay_ket_thuc, tieu_de_flash_sale, 
            mo_ta_flash_sale, mau_nen_flash_sale || 'gradient-to-r from-red-500 to-pink-600', 
            hien_thi_banner || false
        ]);
        
        const flashSaleId = result.insertId;
        
        // Thêm sản phẩm vào flash sale
        if (san_pham && san_pham.length > 0) {
            const productInsertQuery = `
                INSERT INTO flash_sale_san_pham (ma_giam_gia_id, san_pham_id, gia_flash_sale, so_luong_gioi_han)
                VALUES (?, ?, ?, ?)
            `;
            
            for (const product of san_pham) {
                await db.execute(productInsertQuery, [
                    flashSaleId, product.san_pham_id, product.gia_flash_sale, product.so_luong_gioi_han
                ]);
            }
        }
        
        res.json({ success: true, message: 'Tạo flash sale thành công', flash_sale_id: flashSaleId });
    } catch (error) {
        console.error('Error creating flash sale:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// Cập nhật flash sale (admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            ma_code, 
            tieu_de_flash_sale, 
            mo_ta_flash_sale, 
            ngay_bat_dau, 
            ngay_ket_thuc, 
            mau_nen_flash_sale, 
            hien_thi_banner,
            trang_thai 
        } = req.body;
        
        const updateQuery = `
            UPDATE ma_giam_gia 
            SET ma_code = ?, tieu_de_flash_sale = ?, mo_ta_flash_sale = ?, 
                ngay_bat_dau = ?, ngay_ket_thuc = ?, mau_nen_flash_sale = ?, 
                hien_thi_banner = ?, trang_thai = ?
            WHERE ma_giam_gia_id = ? AND loai_khuyen_mai = 'flash_sale'
        `;
        
        await db.execute(updateQuery, [
            ma_code, tieu_de_flash_sale, mo_ta_flash_sale, ngay_bat_dau, ngay_ket_thuc, 
            mau_nen_flash_sale, hien_thi_banner, trang_thai, id
        ]);
        
        res.json({ success: true, message: 'Cập nhật flash sale thành công' });
    } catch (error) {
        console.error('Error updating flash sale:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// Xóa flash sale (admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        await db.execute('DELETE FROM ma_giam_gia WHERE ma_giam_gia_id = ? AND loai_khuyen_mai = "flash_sale"', [id]);
        
        res.json({ success: true, message: 'Xóa flash sale thành công' });
    } catch (error) {
        console.error('Error deleting flash sale:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// Thêm sản phẩm vào flash sale (admin)
router.post('/:id/products', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { san_pham_id, gia_flash_sale, so_luong_gioi_han } = req.body;
        
        const insertQuery = `
            INSERT INTO flash_sale_san_pham (ma_giam_gia_id, san_pham_id, gia_flash_sale, so_luong_gioi_han)
            VALUES (?, ?, ?, ?)
        `;
        
        await db.execute(insertQuery, [id, san_pham_id, gia_flash_sale, so_luong_gioi_han]);
        
        res.json({ success: true, message: 'Thêm sản phẩm vào flash sale thành công' });
    } catch (error) {
        console.error('Error adding product to flash sale:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// Xóa sản phẩm khỏi flash sale (admin)
router.delete('/:flashSaleId/products/:productId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { flashSaleId, productId } = req.params;
        
        await db.execute(
            'DELETE FROM flash_sale_san_pham WHERE ma_giam_gia_id = ? AND san_pham_id = ?',
            [flashSaleId, productId]
        );
        
        res.json({ success: true, message: 'Xóa sản phẩm khỏi flash sale thành công' });
    } catch (error) {
        console.error('Error removing product from flash sale:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

module.exports = router;