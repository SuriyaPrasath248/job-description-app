import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";  // Add getDoc here
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDOqL8rp-dCRhk1I2USJrx6q1HcVLS7CjA",
    authDomain: "ragapplicaton.firebaseapp.com",
    projectId: "ragapplicaton",
    storageBucket: "ragapplicaton.appspot.com",
    messagingSenderId: "191054595011",
    appId: "1:191054595011:web:ceaca88f0d01beefef3376",
    measurementId: "G-9VXYJ2L2WK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, db, provider, signInWithPopup, doc, setDoc, updateDoc, arrayUnion, getDoc };  // Export getDoc
