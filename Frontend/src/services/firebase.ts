import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBALuffdTGQyI3Sx5mr-1GIcMxwtoRleWY",
    authDomain: "fanatikjersey-d2d0d.firebaseapp.com",
    projectId: "fanatikjersey-d2d0d",
    storageBucket: "fanatikjersey-d2d0d.firebasestorage.app",
    messagingSenderId: "742526957925",
    appId: "1:742526957925:web:096af2f48b92717ce0498c",
    measurementId: "G-LH2NBRVXXN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics (optional, wrapping in try/catch to prevent errors in non-browser envs if needed)
// But standard web usage is fine.
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
