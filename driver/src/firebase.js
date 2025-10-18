import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqWEmIIngkoEjiAUKAcT3rvQGtsvCj3qc",
  authDomain: "snabb-82415.firebaseapp.com",
  projectId: "snabb-82415",
  storageBucket: "snabb-82415.firebasestorage.app",
  messagingSenderId: "1006448447805",
  appId: "1:1006448447805:web:c58b45899bcd67aa5d7554",
  measurementId: "G-V2JM77CH43"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

export default app;
