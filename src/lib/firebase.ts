
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, onIdTokenChanged } from "firebase/auth";

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
    firebaseApp = {} as FirebaseApp;
}

// Set auth token in a cookie
if (typeof window !== 'undefined') {
    const auth = getAuth(firebaseApp);
    onIdTokenChanged(auth, async (user) => {
        if (user) {
            const token = await user.getIdToken();
            document.cookie = `firebaseIdToken=${token}; path=/; max-age=31536000`; // 1 year expiry
        } else {
            document.cookie = 'firebaseIdToken=; path=/; max-age=0';
        }
    });
}

export { firebaseApp };
