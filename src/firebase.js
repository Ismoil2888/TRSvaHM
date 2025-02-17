import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyDW06pRWxVfbFwO4J9OYI9ANMPMbTf-mrM",
  authDomain: "university-app-ff9e7.firebaseapp.com",
  databaseURL: "https://university-app-ff9e7-default-rtdb.firebaseio.com",
  projectId: "university-app-ff9e7",
  storageBucket: "university-app-ff9e7.appspot.com",
  messagingSenderId: "85413455839",
  appId: "1:85413455839:web:49dcbd7e1b1cee9f15466a",
  measurementId: "G-7FXQJVDK64"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);
export const firestore = getFirestore(app);
export const functions = getFunctions(app);