/*
const { Pool } = require("pg");
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Render는 SSL 연결 필수
});


module.exports = pool;
*/


// import { initializeApp } from "firebase/app";
const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
// import { getAnalytics } from "firebase/analytics";
// const config = require('./config');
// import config from "./config";
const config = require('./config');

const app = initializeApp(config.firebaseConfig);
const db = getFirestore(app);
module.exports = db;