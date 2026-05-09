const pool = require('./config/database');

async function checkDatabase() {
  try {
    const [tables] = await pool.execute('SHOW TABLES');
    console.log('Tables:', tables);

    const [users] = await pool.execute('SELECT id, email FROM users LIMIT 5');
    console.log('Users:', users);

    const [notifs] = await pool.execute('SELECT COUNT(*) as count FROM notifications');
    console.log('Notifications count:', notifs);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkDatabase();
