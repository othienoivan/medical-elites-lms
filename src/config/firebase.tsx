import { initializeApp } from "firebase/app";
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