
// This file is not strictly necessary now that auth is disabled,
// but we'll keep it for potential future use.
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let firebaseApp: FirebaseApp;
const areAllConfigValuesPresent = Object.values(firebaseConfig).every(value => Boolean(value));

if (areAllConfigValuesPresent) {
  firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} else {
  // Provide a dummy app to prevent crashes if config is not set
  firebaseApp = {} as FirebaseApp;
}

export { firebaseApp };
