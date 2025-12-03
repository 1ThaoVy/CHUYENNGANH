const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function importDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT || 3306,
        multipleStatements: true
    });

    try {
        console.log('📂 Đọc file SQL...');
        const sqlFile = fs.readFileSync(path.join(__dirname, '../sql/dbvaycuoi.sql'), 'utf8');
        
        console.log('🗑️  Xóa database cũ (nếu có)...');
        await connection.query('DROP DATABASE IF EXISTS orianna_shop_db');
        
        console.log('📦 Import database mới...');
        await connection.query(sqlFile);
        
        console.log('✅ Import database thành công!');
        console.log('📊 Database: orianna_shop_db');
        
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        await connection.end();
    }
}

importDatabase();
