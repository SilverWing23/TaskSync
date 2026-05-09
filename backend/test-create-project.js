const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function testCreateProject() {
  try {
    // 先登录获取token
    const loginOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };
    
    const loginResult = await makeRequest(loginOptions, {
      email: 'admin@example.com',
      password: '123456'
    });
    
    console.log('Login response:', loginResult);
    const token = loginResult.data.data.token;
    
    // 创建项目
    const createOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/projects',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    
    const createResult = await makeRequest(createOptions, {
      name: '测试项目',
      description: '测试描述',
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      priority: 'medium'
    });
    
    console.log('Create project response:', createResult);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testCreateProject();