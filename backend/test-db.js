const mysql = require('mysql2/promise');

async function testConnection() {
  const pool = mysql.createPool({
    host: 'localhost',
    port: 8000,
    user: 'root',
    password: 'password',
    database: 'task_manager',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    const [rows] = await pool.execute('SELECT 1 + 1 AS solution');
    console.log('Database connection successful:', rows);
    process.exit(0);
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();