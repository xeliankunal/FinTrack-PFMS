import { initializeApp } from "firebase/app";

import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc, collection, addDoc, getDocs, query, where, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAHExHfMDRu2lVecgYxgW86TXDF-dvsWrY",
  authDomain: "personal-finance-tracker-ec56e.firebaseapp.com",
  projectId: "personal-finance-tracker-ec56e",
  storageBucket: "personal-finance-tracker-ec56e.appspot.com",
  messagingSenderId: "669303047696",
  appId: "1:669303047696:web:5b4b41cc896752c03e6c95",
  measurementId: "G-7X36E69HYW",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Helper function to get user's goals collection
const getUserGoalsRef = (userId) => {
  return collection(db, `users/${userId}/financialGoals`);
};

export { 
  db, 
  auth, 
  provider, 
  doc, 
  setDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc,
  getUserGoalsRef 
};
