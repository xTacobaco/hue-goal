import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSyB2T3s6Y5i6XAYK42mG1CwkrIASVdrHQGQ",
  authDomain: "hue-goal.firebaseapp.com",
  projectId: "hue-goal",
  storageBucket: "hue-goal.appspot.com",
  messagingSenderId: "382306850833",
  appId: "1:382306850833:web:620784da18ddc16e1379b0",
});

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
export default app;
