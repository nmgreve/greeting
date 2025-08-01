// Use CDN modules, not local node_modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-analytics.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-storage.js";

// Your config
const firebaseConfig = {
  apiKey: "AIzaSyB1foDDpomvV7S_8ZpRtiUgIhYOp9Oi6H8",
  authDomain: "ncgreeting.firebaseapp.com",
  projectId: "ncgreeting",
  storageBucket: "ncgreeting.appspot.com",
  messagingSenderId: "947337187260",
  appId: "1:947337187260:web:1d512cc2415f68928565b9",
  measurementId: "G-HN5KMXN3RX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app);

window.firebaseStorage = storage;
