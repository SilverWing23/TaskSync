const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Test server running on port ${PORT}`);
  
  const http = require('http');
  
  const data = JSON.stringify({
    email: 'admin@example.com',
    password: '123456'
  });

  const options = {
    hostname: 'localhost',
    port: PORT,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    console.log('Status Code:', res.statusCode);
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
      console.log('Response:', body);
      process.exit(0);
    });
  });

  req.on('error', (e) => {
    console.error('Error:', e.message);
    process.exit(1);
  });

  req.write(data);
  req.end();
});
