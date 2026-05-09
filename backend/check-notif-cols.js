const pool = require('./config/database');

async function checkColumns() {
  try {
    const [columns] = await pool.execute('DESCRIBE notifications');
    console.log('Notifications table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} (Null: ${col.Null}, Key: ${col.Key}, Default: ${col.Default})`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkColumns();
