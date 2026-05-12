const http = require('http');

const data = JSON.stringify({
  name: 'Test Doctor 2',
  email: 'testdoctor@example.com', // Duplicate email
  phone: '1112223334', // Duplicate phone
  password: 'password123',
  specialization: 'General',
  experience: '5'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/doctor-register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Body: ${body}`);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
