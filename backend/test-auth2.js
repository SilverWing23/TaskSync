const http = require('http');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function testLogin() {
  const data = JSON.stringify({ email: '2621440512@qq.com', password: '123456' });

  const loginOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
  };

  try {
    console.log('Testing login...');
    const loginRes = await makeRequest(loginOptions, data);
    console.log('Login status:', loginRes.status);
    console.log('Login response:', JSON.stringify(loginRes.body, null, 2));

    if (loginRes.body.success && loginRes.body.data.token) {
      const token = loginRes.body.data.token;
      console.log('\nTesting getProfile...');

      const profileOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/profile',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const profileRes = await makeRequest(profileOptions);
      console.log('Profile status:', profileRes.status);
      console.log('Profile response:', JSON.stringify(profileRes.body, null, 2));

      console.log('\nTesting fetchUnreadCount...');

      const notifOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/notifications/unread',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const notifRes = await makeRequest(notifOptions);
      console.log('Notifications status:', notifRes.status);
      console.log('Notifications response:', JSON.stringify(notifRes.body, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testLogin();
