
// NOTE: This file is kept for reference only. The application now uses MongoDB (see mongodb.ts)

import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCWqARH0t-a41B9vFcRvUd7MjotM7YXR8g",
  authDomain: "smart-city-337f6.firebaseapp.com",
  projectId: "smart-city-337f6",
  storageBucket: "smart-city-337f6.firebasestorage.app",
  messagingSenderId: "543961964388",
  appId: "1:543961964388:web:951c34ecc0e8f1009d2471",
  measurementId: "G-7HQEHDH0ZY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const storage = getStorage(app);

export { app, database, storage };
