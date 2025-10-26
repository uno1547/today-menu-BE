// "use strict";
const dotenv = require('dotenv');
// const { default: firebase } = require('firebase/compat/app');
// const assert = require('assert');

dotenv.config();

module.exports = {
  firebaseConfig: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID
  }
}

/*
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBa2EsL7T07me5fkmoTtb1yiHbjkVsGvYY",
  authDomain: "hyang-cafeteria.firebaseapp.com",
  projectId: "hyang-cafeteria",
  storageBucket: "hyang-cafeteria.firebasestorage.app",
  messagingSenderId: "222369568763",
  appId: "1:222369568763:web:05a0997a48b5edf83b5d5e",
  measurementId: "G-0BD04SX4N2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
*/