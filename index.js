const express = require('express');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 3000;

// 기본 라우트
app.get('/', (req, res) => {
  res.send('Hello, Express');
});

// 초간단 API
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from API!' });
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
