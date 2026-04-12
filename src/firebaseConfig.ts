import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration from Phase 3 setup
const firebaseConfig = {
  apiKey: "AIzaSyC1dPhvUwUFLvAABN_OxgGiVzhyAfo2NGo",
  authDomain: "anomix-461ec.firebaseapp.com",
  projectId: "anomix-461ec",
  storageBucket: "anomix-461ec.firebasestorage.app",
  messagingSenderId: "880061784863",
  appId: "1:880061784863:web:b41a07a01f81b2b6fb462a",
  measurementId: "G-BNQ5P95PT1"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore (The "Vault")
export const db = getFirestore(app);

export default app;
