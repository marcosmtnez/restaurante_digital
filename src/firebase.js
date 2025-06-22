// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBXToIA1z1vnsTM0O0eslW6XGoQr5XeOLQ",
  authDomain: "carta-digital-45862.firebaseapp.com",
  projectId: "carta-digital-45862",
  storageBucket: "carta-digital-45862.firebasestorage.app",
  messagingSenderId: "448542687072",
  appId: "1:448542687072:web:cce879134377bb0a9fa805",
  measurementId: "G-YJC6R72VMZ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
