const db = require('./config/database');
const bcrypt = require('bcryptjs');

async function createAdmin() {
    try {
        // Check if admin exists
        const [existing] = await db.execute(
            'SELECT * FROM nguoi_dung WHERE email = ?',
            ['admin@orianna.com']
        );

        if (existing.length > 0) {
            console.log('Admin already exists!');
            console.log('Email: admin@orianna.com');
            console.log('Password: admin123');
            return;
        }

        // Create admin
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        const [result] = await db.execute(
            `INSERT INTO nguoi_dung (ho_ten, email, mat_khau, vai_tro, trang_thai) 
             VALUES (?, ?, ?, ?, ?)`,
            ['Admin Orianna', 'admin@orianna.com', hashedPassword, 'admin', 'active']
        );

        console.log('✅ Admin created successfully!');
        console.log('Email: admin@orianna.com');
        console.log('Password: admin123');
        console.log('ID:', result.insertId);

    } catch (error) {
        console.error('❌ Error creating admin:', error);
    } finally {
        process.exit(0);
    }
}

createAdmin();