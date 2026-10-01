import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAbb5xXNhLfqmlj_l3P2zETNHj9Yw06Gso",
  authDomain: "deskflow-c8380.firebaseapp.com",
  databaseURL: "https://deskflow-c8380-default-rtdb.firebaseio.com",
  projectId: "deskflow-c8380",
  storageBucket: "deskflow-c8380.firebasestorage.app",
  messagingSenderId: "557874462409",
  appId: "1:557874462409:web:c2d7e3f15b6fcd64609718",
  measurementId: "G-E91T5X1MY6",
};

// Start Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
