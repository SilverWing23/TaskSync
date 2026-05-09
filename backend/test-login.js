const axios = require('axios');

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@example.com',
      password: '123456'
    });
    console.log('Login successful!');
    console.log('Token:', response.data.data.token);
    console.log('User:', response.data.data.user);
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
  }
}

testLogin();