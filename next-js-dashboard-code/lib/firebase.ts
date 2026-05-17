import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAYpG6UuTJ-UVd7PN3Mel0Gbnnw8TGy-bI",
  authDomain: "smart-agriculture-78e45.firebaseapp.com",
  databaseURL: "https://smart-agriculture-78e45-default-rtdb.firebaseio.com",
  projectId: "smart-agriculture-78e45",
  storageBucket: "smart-agriculture-78e45.firebasestorage.app",
  messagingSenderId: "5588409926",
  appId: "1:5588409926:web:728598e7d2c71d0bdcf447",
  measurementId: "G-DS1Q8B2E5X"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const rtdb = getDatabase(app);