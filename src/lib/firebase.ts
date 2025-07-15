
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

let firebaseApp: FirebaseApp;

if (Object.values(firebaseConfig).every(value => value)) {
  firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} else {
    console.error("Firebase config is missing. Please set up your environment variables.");
    // Provide a dummy app object to prevent crashes, but functionality will be limited.
    firebaseApp = {} as FirebaseApp;
}

// Set auth token in a cookie
if (typeof window !== 'undefined' && firebaseApp.options) {
    const auth = getAuth(firebaseApp);
    onIdTokenChanged(auth, async (user) => {
        if (user) {
            const token = await user.getIdToken();
            Cookies.set('firebaseIdToken', token, { expires: 365, path: '/' });
        } else {
            Cookies.remove('firebaseIdToken', { path: '/' });
        }
    });
}

export { firebaseApp };
