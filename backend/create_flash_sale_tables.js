const mysql = require('mysql2/promise');
const fs = require('fs');

async function runSQL() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'orianna_shop_db'
        });
        
        const sql = fs.readFileSync('../sql/create_flash_sale_table.sql', 'utf8');
        const statements = sql.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
            if (statement.trim()) {
                await connection.execute(statement);
                console.log('Executed:', statement.substring(0, 50) + '...');
            }
        }
        
        console.log('Flash sale tables created successfully!');
        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

runSQL();