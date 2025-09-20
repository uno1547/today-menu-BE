const express = require('express');
const cors = require('cors');
const pool = require("./db");
const http = require('http');
const { Server } = require("socket.io");
require('dotenv').config();

const app = express();
const server = http.createServer(app); // 이게 뭔가 문제가 있음
// const server = app.listen(3000, () => {
//   console.log('위쪽 app.listen')
//   console.log('Server is running on port 3000');
// });
// CORS 설정 - 모든 도메인에서 요청 허용
app.use(cors());
app.use(express.json()); // JSON 바디 파싱 미들웨어

const io = new Server(server, {
  cors: {
    origin: "*", // 모든 도메인에서 접근 허용
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;



// 전역변수로 임시 관리
let sellQuantity;
let currentQuantity;
let isSelling = false;
let currentWaitCnt = 13;

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  // 클라이언트에게 주기적으로 재고 상태 전송
  // const interval = setInterval(() => {
  //   socket.emit('stock-update', { sellQuantity, isSelling });
  // }, 1000);

  // 클라이언트에게 재고 상태 전송
  
  // socket.emit('sale-started', () => {
  //   isSelling = true
  //   socket.emit('stock-update', { sellQuantity, isSelling });
  // });
  
  // isSelling = true
  // 총수량 및 현재수량 전송
  // 판매상태 전송
  socket.emit('sale-status', { isSelling }); // 아마 admin페이지에서는 안받으면됌
  socket.emit('stock-update', { sellQuantity, currentQuantity });
  // 대기인원수 전송
  socket.emit('waitCnt-update', { currentWaitCnt });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
    // clearInterval(interval);
  });
});

// 최초 판매 상태 전송
app.get('/api/admin/breakfast-status', (req, res) => {
  res.json({ isSelling }); // 얘 굳이 필요없을수도 소켓이벤트로 하면 실시간 반영까지도 할수있으니깐
});

// 판매 시작
app.post('/api/admin/start-breakfast', (req, res) => {
  const cnt = req.body.quantity;
  isSelling = true;
  sellQuantity = cnt;
  currentQuantity = sellQuantity;
  console.log('시작요청');
  io.emit('sale-status', { sellQuantity, currentQuantity, isSelling })
  // io.emit('sale-started', { sellQuantity, isSelling });
  // io.emit('stock-update', { sellQuantity, isSelling }); 이거 필요한가???
  res.json({ status: 'ok', message: `전체수량 ${sellQuantity} / 현재수량 ${currentQuantity} 판매시작` });
  console.log(`전체수량 ${sellQuantity} / 현재수량 ${currentQuantity} 판매시작`);
});

// 판매 종료
app.post('/api/admin/stop-breakfast', (req, res) => {
  isSelling = false;
  sellQuantity = 0;
  currentQuantity = 0;
  io.emit('sale-status', { isSelling });
  console.log('종료요청');
  // io.emit('sale-ended', { isSelling });
  res.json({ status: 'ok', message: 'Sale ended.' });
});

// 결제하기
app.post('/api/purchase', (req, res) => {
  // if (!isSelling) {
  //   return res.status(400).json({ status: 'error', message: 'Sale has not started yet.' });
  // }
  if (currentQuantity <= 0 || !isSelling) {
    return res.status(400).json({ status: 'error', message: 'Sold out.' });
  }
  currentQuantity -= 1;
  console.log(`구매요청 / 현재수량 ${currentQuantity}`);
  io.emit('stock-update', { currentQuantity });
  return res.json({ status: 'ok', message: 'Purchase successful.', remaining: sellQuantity });
});


// 기본 라우트
app.get('/', (req, res) => {
  res.send('Hello, Express');
});

// 초간단 API
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from API!' });
});
/*
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

app.get('/api/create-table', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL
      )
    `);
    res.json({ status: 'ok', message: 'Table created or already exists' });
  } catch (err) {
    console.error('Error creating table:', err);
    res.status(500).json({ status: 'error', message: 'Could not create table' });
  }
});
*/

// 서버 실행
app.listen(PORT, () => {
  console.log('맨아래 app.listen')
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
