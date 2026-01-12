const db = require('../config/database');

// Helper function
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
    }).format(amount);
}

// Tạo QR code thanh toán
exports.createPaymentQR = async (req, res) => {
    try {
        const { don_hang_id, bank_code = 'MB' } = req.body;
        const nguoi_dung_id = req.user.nguoi_dung_id;

        // Lấy thông tin đơn hàng
        const [orders] = await db.query(`
            SELECT * FROM don_hang 
            WHERE don_hang_id = ? AND nguoi_dung_id = ?
        `, [don_hang_id, nguoi_dung_id]);

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        const order = orders[0];

        // Thông tin ngân hàng (demo cho báo cáo)
        const bankInfo = {
            'MB': {
                name: 'MB Bank',
                accountNumber: '0123456789',
                accountName: 'ORIANNA SHOP DEMO'
            },
            'VCB': {
                name: 'Vietcombank',
                accountNumber: '9876543210',
                accountName: 'ORIANNA SHOP DEMO'
            },
            'TCB': {
                name: 'Techcombank',
                accountNumber: '1122334455',
                accountName: 'ORIANNA SHOP DEMO'
            }
        };

        const selectedBank = bankInfo[bank_code] || bankInfo['MB'];
        const amount = Math.round(order.tong_tien);
        const content = `ORIANNA ${don_hang_id}`;

        // Tạo QR code giả sử dụng QR generator (chỉ để demo)
        const qrContent = `DEMO-ORDER-${don_hang_id}-${amount}VND`;
        const qrData = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrContent)}&bgcolor=FFFFFF&color=000000`;

        // Lưu thông tin thanh toán
        await db.query(`
            INSERT INTO thanh_toan_online (don_hang_id, bank_code, so_tien, noi_dung, trang_thai, ngay_tao)
            VALUES (?, ?, ?, ?, 'pending', NOW())
            ON DUPLICATE KEY UPDATE 
            bank_code = VALUES(bank_code),
            so_tien = VALUES(so_tien),
            noi_dung = VALUES(noi_dung),
            ngay_cap_nhat = NOW()
        `, [don_hang_id, bank_code, amount, content]);

        res.json({
            success: true,
            data: {
                qr_url: qrData,
                bank_info: selectedBank,
                amount: amount,
                content: content,
                order_id: don_hang_id
            }
        });

    } catch (error) {
        console.error('Error creating payment QR:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Kiểm tra trạng thái thanh toán
exports.checkPaymentStatus = async (req, res) => {
    try {
        const { don_hang_id } = req.params;
        const nguoi_dung_id = req.user.nguoi_dung_id;

        // Kiểm tra đơn hàng thuộc về user
        const [orders] = await db.query(`
            SELECT * FROM don_hang 
            WHERE don_hang_id = ? AND nguoi_dung_id = ?
        `, [don_hang_id, nguoi_dung_id]);

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        // Lấy thông tin thanh toán
        const [payments] = await db.query(`
            SELECT * FROM thanh_toan_online 
            WHERE don_hang_id = ?
            ORDER BY ngay_tao DESC
            LIMIT 1
        `, [don_hang_id]);

        if (payments.length === 0) {
            return res.json({
                success: true,
                data: {
                    status: 'not_found',
                    message: 'Chưa có thông tin thanh toán'
                }
            });
        }

        const payment = payments[0];

        res.json({
            success: true,
            data: {
                status: payment.trang_thai,
                amount: payment.so_tien,
                bank_code: payment.bank_code,
                created_at: payment.ngay_tao,
                updated_at: payment.ngay_cap_nhat
            }
        });

    } catch (error) {
        console.error('Error checking payment status:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Xác nhận thanh toán (dành cho admin hoặc webhook)
exports.confirmPayment = async (req, res) => {
    try {
        const { don_hang_id } = req.params;
        const { transaction_id, note } = req.body;

        // Cập nhật trạng thái thanh toán
        await db.query(`
            UPDATE thanh_toan_online 
            SET trang_thai = 'completed', 
                ma_giao_dich = ?, 
                ghi_chu = ?,
                ngay_cap_nhat = NOW()
            WHERE don_hang_id = ?
        `, [transaction_id, note, don_hang_id]);

        // Cập nhật trạng thái đơn hàng
        await db.query(`
            UPDATE don_hang 
            SET trang_thai_don_hang_id = 2
            WHERE don_hang_id = ?
        `, [don_hang_id]);

        res.json({
            success: true,
            message: 'Xác nhận thanh toán thành công'
        });

    } catch (error) {
        console.error('Error confirming payment:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Lấy danh sách ngân hàng hỗ trợ
exports.getSupportedBanks = async (req, res) => {
    try {
        const banks = [
            { code: 'MB', name: 'MB Bank', logo: '/images/banks/mb.png' },
            { code: 'VCB', name: 'Vietcombank', logo: '/images/banks/vcb.png' },
            { code: 'TCB', name: 'Techcombank', logo: '/images/banks/tcb.png' },
            { code: 'ACB', name: 'ACB', logo: '/images/banks/acb.png' },
            { code: 'VPB', name: 'VPBank', logo: '/images/banks/vpb.png' },
            { code: 'TPB', name: 'TPBank', logo: '/images/banks/tpb.png' }
        ];

        res.json({
            success: true,
            data: banks
        });

    } catch (error) {
        console.error('Error getting supported banks:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Mô phỏng thanh toán thành công (cho demo)
exports.simulatePaymentSuccess = async (req, res) => {
    try {
        const { don_hang_id } = req.params;
        const nguoi_dung_id = req.user.nguoi_dung_id;

        // Kiểm tra đơn hàng thuộc về user
        const [orders] = await db.query(`
            SELECT * FROM don_hang 
            WHERE don_hang_id = ? AND nguoi_dung_id = ?
        `, [don_hang_id, nguoi_dung_id]);

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        // Mô phỏng mã giao dịch
        const fakeTransactionId = `DEMO${Date.now()}`;
        
        // Cập nhật trạng thái thanh toán
        await db.query(`
            UPDATE thanh_toan_online 
            SET trang_thai = 'completed', 
                ma_giao_dich = ?, 
                ghi_chu = 'Mô phỏng thanh toán thành công cho demo',
                ngay_cap_nhat = NOW()
            WHERE don_hang_id = ?
        `, [fakeTransactionId, don_hang_id]);

        // Cập nhật trạng thái đơn hàng
        await db.query(`
            UPDATE don_hang 
            SET trang_thai_don_hang_id = 2
            WHERE don_hang_id = ?
        `, [don_hang_id]);

        res.json({
            success: true,
            message: 'Mô phỏng thanh toán thành công',
            data: {
                transaction_id: fakeTransactionId,
                status: 'completed'
            }
        });

    } catch (error) {
        console.error('Error simulating payment:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};