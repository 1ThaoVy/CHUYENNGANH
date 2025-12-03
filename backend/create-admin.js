const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createAdmin() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
    });

    try {
        // Hash password
        const password = 'admin123'; // Đổi password này nếu muốn
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update admin password
        await connection.query(
            'UPDATE nguoi_dung SET mat_khau_hash = ? WHERE email = ?',
            [hashedPassword, 'admin@orianna.vn']
        );

        console.log('✅ Đã cập nhật password admin thành công!');
        console.log('📧 Email: admin@orianna.vn');
        console.log('🔑 Password: admin123');
        console.log('\n⚠️  Hãy đổi password sau khi đăng nhập lần đầu!');
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        await connection.end();
    }
}

createAdmin();
