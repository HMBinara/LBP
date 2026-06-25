import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // GoogleAuthProvider එක import කරගන්න
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCc6S3tCW7-yBRmn9SCAG9UJd9v9qE5f84",
    authDomain: "lbplatforme.firebaseapp.com",
    projectId: "lbplatforme",
    storageBucket: "lbplatforme.firebasestorage.app",
    messagingSenderId: "323437447011",
    appId: "1:323437447011:web:a955e49b158fa23462f556",
    measurementId: "G-RPWGC7J7M6"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider(); // මේක අලුතෙන් add කරන්න