
import * as admin from 'firebase-admin';

export function getFirebaseAdminApp() {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : undefined;

  if (!serviceAccount) {
    // This check is important, but in a serverless environment, you might
    // rely on default credentials provided by the infrastructure.
    // For this app, we'll require the service account to be set.
    throw new Error('Firebase service account credentials are not set in the environment variables.');
  }

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
