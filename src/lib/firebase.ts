
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, onIdTokenChanged } from "firebase/auth";
import Cookies from 'js-cookie';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase App
let firebaseApp: FirebaseApp;
const areAllConfigValuesPresent = Object.values(firebaseConfig).every(value => Boolean(value));

if (areAllConfigValuesPresent) {
  firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} else {
  // In a real app, you might want to log this for debugging, 
  // but we'll keep it quiet to avoid console errors during setup.
  firebaseApp = {} as FirebaseApp; // Provide a dummy app to prevent crashes
}


// Set auth token in a cookie on the client side
if (typeof window !== 'undefined' && firebaseApp.options) {
    try {
        const auth = getAuth(firebaseApp);
        onIdTokenChanged(auth, async (user) => {
            if (user) {
                const token = await user.getIdToken();
                Cookies.set('firebaseIdToken', token, { expires: 365, path: '/' });
            } else {
                Cookies.remove('firebaseIdToken', { path: '/' });
            }
        });
    } catch (error) {
        console.error("Error setting up Firebase auth state change listener:", error);
    }
}

export { firebaseApp };
