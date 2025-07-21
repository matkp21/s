// src/lib/firebase/admin.ts
import * as admin from 'firebase-admin';

// Ensure you have the GOOGLE_APPLICATION_CREDENTIALS environment variable set up
// In Firebase/Google Cloud environments, this is often handled automatically.
// For local development, you'd set it to the path of your service account key file.

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      // Uses GOOGLE_APPLICATION_CREDENTIALS by default
    });
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();
