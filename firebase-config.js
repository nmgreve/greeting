// firebase-config.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB1foDDpomvV7S_8ZpRtiUgIhYOp9Oi6H8",
  authDomain: "ncgreeting.firebaseapp.com",
  projectId: "ncgreeting",
  storageBucket: "ncgreeting.firebasestorage.app",
  messagingSenderId: "947337187260",
  appId: "1:947337187260:web:1d512cc2415f68928565b9",
  measurementId: "G-HN5KMXN3RX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Expose to script.js
window.firebaseStorage = storage;