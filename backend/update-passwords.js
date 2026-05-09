const bcrypt = require('bcryptjs');
const pool = require('./config/database');

async function updatePasswords() {
  const password = '123456';
  const hash = await bcrypt.hash(password, 10);
  
  console.log('New hash:', hash);
  
  try {
    const [result] = await pool.execute(
      'UPDATE users SET password = ?',
      [hash]
    );
    console.log(`Updated ${result.affectedRows} rows`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updatePasswords();
