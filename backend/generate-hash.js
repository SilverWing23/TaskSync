const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = '123456';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log('Password:', password);
  console.log('Generated hash:', hash);
  
  const verify = await bcrypt.compare(password, hash);
  console.log('Verification:', verify);
}

generateHash();
