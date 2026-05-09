const http = require('http');

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, body: JSON.parse(body) });
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function testAPI() {
  console.log('Testing notifications API...');

  const data = JSON.stringify({ email: 'admin@example.com', password: '123456' });

  const loginOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
  };

  try {
    const loginRes = await makeRequest(loginOptions, data);
    console.log('Login status:', loginRes.status);
    console.log('Login response:', JSON.stringify(loginRes.body, null, 2));

    if (loginRes.body.success && loginRes.body.data.token) {
      const token = loginRes.body.data.token;
      console.log('\nTesting notifications API...');

      const notificationsOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/notifications/unread',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const notifRes = await makeRequest(notificationsOptions);
      console.log('Notifications status:', notifRes.status);
      console.log('Notifications response:', JSON.stringify(notifRes.body, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();
