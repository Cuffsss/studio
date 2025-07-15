
import * as admin from 'firebase-admin';

// This function initializes and returns the Firebase Admin app instance.
// It ensures that the app is initialized only once.
export function getFirebaseAdminApp() {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : undefined;

  if (!serviceAccount) {
    throw new Error('Firebase service account credentials are not set in the environment variables.');
  }

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
