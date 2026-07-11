import { initializeApp } from "firebase/app";
<<<<<<< HEAD
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const requiredEnv = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missingKeys = Object.entries(requiredEnv)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length > 0) {
  throw new Error(
    `Missing Firebase environment variables: ${missingKeys.join(", ")}. Copy .env.example to .env.local and add the project values.`
  );
}

const app = initializeApp(requiredEnv);

export const auth = getAuth(app);
void setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Failed to enable local authentication persistence:", error);
});

export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
=======
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBze1Yz1hl54JLHUt62OvyxgfSWfcJTXQI",
  authDomain: "medical-elites-lms.firebaseapp.com",
  projectId: "medical-elites-lms",
  storageBucket: "medical-elites-lms.firebasestorage.app",
  messagingSenderId: "251189474789",
  appId: "1:251189474789:web:7a8075fe83c87434b26b0c",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
