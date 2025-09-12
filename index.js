const express = require('express');
const cors = require('cors');
const pool = require("./db");

const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 3000;

// CORS 설정 - 모든 도메인에서 요청 허용
app.use(cors());

// 기본 라우트
app.get('/', (req, res) => {
  res.send('Hello, Express');
});

// 초간단 API
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from API!' });
});

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      dbTime: result.rows[0].now,
      serverTime: new Date()
    });
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ status: 'error', message: 'Database not reachable' });
  }
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
