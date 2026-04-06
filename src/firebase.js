// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDbim7Tb1tn55jP53mOMk0tQLSdCVyysuc",
  authDomain: "smartstayindia-7ea3e.firebaseapp.com",
  projectId: "smartstayindia-7ea3e",
  storageBucket: "smartstayindia-7ea3e.firebasestorage.app",
  messagingSenderId: "152729118993",
  appId: "1:152729118993:web:7d31729cfa01b2e92384b0",
  measurementId: "G-E90Y5LLT5C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export Authentication and Database instances for use in React components
export const auth = getAuth(app);
export const db = getFirestore(app);
