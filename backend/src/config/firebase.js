import admin from 'firebase-admin';

let appInitialized = false;

export function initFirebaseAdmin() {
  if (appInitialized) return admin;

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!admin.apps.length) {
    admin.initializeApp({
      credential:
        projectId && clientEmail && privateKey
          ? admin.credential.cert({
              projectId,
              clientEmail,
              privateKey
            })
          : admin.credential.applicationDefault(),
      databaseURL: process.env.FIREBASE_DATABASE_URL || undefined
    });
  }

  appInitialized = true;
  return admin;
}

export function getDb() {
  const firebaseAdmin = initFirebaseAdmin();
  return firebaseAdmin.firestore();
}

export function getAuth() {
  const firebaseAdmin = initFirebaseAdmin();
  return firebaseAdmin.auth();
}
