// firebase-config.js

const firebaseConfig = {
  apiKey: "AIzaSyCkwwwboM3lGW_284ZN5RZWJmmSL7JwkJU",
  authDomain: "mah-hotel.firebaseapp.com",
  projectId: "mah-hotel",
  storageBucket: "mah-hotel.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
