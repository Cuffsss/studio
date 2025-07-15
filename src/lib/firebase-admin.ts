
import * as admin from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

let app: admin.app.App;

export function getFirebaseAdminApp() {
  if (app) {
    return app;
  }
  
  if (!serviceAccount) {
    throw new Error('Firebase service account credentials are not set in the environment variables.');
  }

  if (admin.apps.length > 0) {
    app = admin.apps[0]!;
  } else {
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  return app;
}
