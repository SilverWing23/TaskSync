const bcrypt = require('bcryptjs');

async function testPassword() {
  const testPassword = '123456';
  const hashFromDb = '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq';
  
  console.log('Testing password comparison...');
  console.log('Password:', testPassword);
  console.log('Hash from DB:', hashFromDb);
  
  try {
    const result = await bcrypt.compare(testPassword, hashFromDb);
    console.log('Comparison result:', result);
    
    const newHash = await bcrypt.hash(testPassword, 10);
    console.log('New hash:', newHash);
    
    const newResult = await bcrypt.compare(testPassword, newHash);
    console.log('New hash comparison:', newResult);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testPassword();
