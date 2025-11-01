const express = require('express');
const cors = require('cors');
const db = require("./db");
const http = require('http');
const { Server } = require("socket.io");
const { collection, doc, query, where } = require('firebase/firestore');
const { getDocs, getDoc } = require('firebase/firestore');
require('dotenv').config();
const PORT = process.env.PORT || 3000;

const app = express();
// CORS 설정 - 모든 도메인에서 요청 허용
app.use(cors());
app.use(express.json()); // JSON 바디 파싱 미들웨어
const server = http.createServer(app); // 이게 뭔가 문제가 있음

const io = new Server(server, {
  cors: {
    origin: ["https://hyang-cafeteria.vercel.app", "http://localhost:5173"], // 모든 도메인에서 접근 허용
    methods: ["GET", "POST"]
  }
});

// 서버 실행
server.listen(PORT, () => {
  console.log('맨아래 app.listen')
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});




// 전역변수로 임시 관리
let sellQuantity;
let currentQuantity;
let isSelling = false;
let currentWaitCnt = 0;

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









// 식단관련 API

// firestore에서 데이터 가져오기
app.get('/api/get-data', async (req, res) => {
  // db에서 데이터 가져오기
  console.log('데이터요청');
  const items = [];
  // console.log(db);
  try {
    const data = await getDocs(collection(db, 'menus'));
    data.forEach(element => {
      items.push(element.data());
    });
    console.log(items);
    res.json({ status: 'ok', data: items });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch data' });
  }
});

// 날짜별 식단 firestore에서 데이터 가져오기
app.get('/api/get-menu-by-date', async (req, res) => {
  console.log('오늘 메뉴 요청!!');
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ status: 'error', message: 'Date is required' });
    }  

    const docRef = doc(db, 'weekly-menus', date);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return res.status(404).json({ status: 'error', message: 'Menu not found for the given date' });
    }

    const menuData = docSnap.data();
    return res.json({ status: 'ok', data: menuData });

  } catch (error) {
    console.error('Error fetching menu by date:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch menu' });
  }


  // const items = [];


  // try {
  //   const data = await getDocs(collection(db, 'menus'));
  //   data.forEach(element => {
  //     const menuDate = element.data().date;
  //     if (menuDate === date) {
  //       items.push(element.data());
  //     }
  //   });
  //   res.json({ status: 'ok', data: items });
  // } catch (error) {
  //   console.error('Error fetching data:', error);
  //   res.status(500).json({ status: 'error', message: 'Failed to fetch data' });
  // }
});




// 식당 관련 API
const buildingMap = {
  h2 : "향2",
  h3 : "향3",
  "student-hall" : "학생회관"
}

app.get('/api/get-stores', async (req, res) => { 
  try {
    const { building } = req.query;
    if (!building) {
      return res.status(400).json({ status: "error", message: "Building code is required" });
    }

    const docId = buildingMap[building];
    if (!docId) {
      return res.status(404).json({ status: "error", message: "Unknown building code" });
    }

    // Firestore에서 문서 조회
    const docRef = doc(db, "buildings", docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return res.status(404).json({ status: "error", message: "No data for this building" });
    }

    const { stores } = docSnap.data(); //["공여사&덮다", "홍대쌀국수", ...]
    // stores 배열만 반환
    if (stores.length === 0 || !stores) {
      return res.json({ status: "ok", stores: [] });
    }

    const chunked = [];
    for (let i = 0; i < stores.length; i += 10) {
      chunked.push(stores.slice(i, i + 10));
    }

    let detailedStores = [];

    for (const group of chunked) {
      const q = query(collection(db, "stores"), where("name", "in", group));
      const querySnap = await getDocs(q);

      querySnap.forEach(docSnap=> {
        console.log(docSnap.data());
        detailedStores.push(docSnap.data());
        // detailedStores.push({ id: docSnap.id, ...docSnap.data() });
      });
    }

    // 3️⃣ 결과 반환
    return res.json({ status: "ok", stores: detailedStores });

    /*

    const result = []

    for (const store of stores) {
      // 각 매장에 대한 추가 정보 처리
      const storeDocRef = doc(db, "stores", store);
      const storeDocSnap = await getDoc(storeDocRef);
      if (storeDocSnap.exists()) {
        // 매장 정보 병합
        result.push(storeDocSnap.data());
      }
    }


    return res.json({ status: "ok", result });
    */

  } catch (error) {
    console.error("Error fetching stores:", error);
    return res.status(500).json({ status: "error", message: "Failed to fetch stores" });
  }
})








// 최초 판매 상태 전송
app.get('/api/admin/breakfast-status', (req, res) => {
  console.log("클라이언트에게 API 요청옴!!!")
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
  console.log('결제요청');
  if (currentQuantity <= 0 || !isSelling) {
    return res.status(400).json({ status: 'error', message: 'Sold out.' });
  }
  currentQuantity -= 1;
  console.log(`구매요청 / 현재수량 ${currentQuantity}`);
  io.emit('stock-update', { currentQuantity });
  return res.json({ status: 'ok', message: 'Purchase successful.', remaining: sellQuantity });
});

// python request로 받은 대기인원수
app.post('/ping/count', (req, res) => {
  const count = req.body.count;
  console.log(`python에서 받은 대기인원 ${count}`)
  currentWaitCnt = count;
  io.emit('waitCnt-update', { currentWaitCnt });
  res.sendStatus(200)
});


// 기본 라우트
app.get('/', (req, res) => {
  res.send('Hello, Express');
});

// 초간단 API
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from API!' });
});

app.get('/api/health', async (req, res) => {
  console.log('health check 요청옴!!!');
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('시간');
    console.log(result.rows[0].now);
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
/*

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

