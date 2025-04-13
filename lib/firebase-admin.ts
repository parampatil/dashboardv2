// lib/firebase-admin.ts
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getRemoteConfig, RemoteConfig } from 'firebase-admin/remote-config';

// Define variables to hold app instances
let defaultApp: App | null = null;
let communicationDevApp: App | null = null;

// Initialize apps if they don't exist
if (getApps().length === 0) {
  // Verify required environment variables
  const defaultProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const defaultClientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const defaultPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
  
  const commDevProjectId = process.env.FIREBASE_COMMUNICATIONDEV_PROJECT_ID;
  const commDevClientEmail = process.env.FIREBASE_COMMUNICATIONDEV_CLIENT_EMAIL;
  const commDevPrivateKey = process.env.FIREBASE_COMMUNICATIONDEV_PRIVATE_KEY;

  if (!defaultProjectId || !defaultClientEmail || !defaultPrivateKey) {
    console.error('Missing default Firebase app environment variables');
  } else {
    // Initialize the default Firebase app
    defaultApp = initializeApp({
      credential: cert({
        projectId: defaultProjectId,
        clientEmail: defaultClientEmail,
        privateKey: defaultPrivateKey.replace(/\\n/g, '\n'),
      }),
    });
  }

  if (!commDevProjectId || !commDevClientEmail || !commDevPrivateKey) {
    console.error('Missing communicationDev Firebase app environment variables');
  } else {
    // Initialize the secondary Firebase app
    communicationDevApp = initializeApp(
      {
        credential: cert({
          projectId: commDevProjectId,
          clientEmail: commDevClientEmail,
          privateKey: commDevPrivateKey.replace(/\\n/g, '\n'),
        }),
      },
      'communicationDev'
    );
  }
} else {
  // Get references to existing apps
  const apps = getApps();
  defaultApp = apps[0];
  communicationDevApp = apps.find(app => app.name === 'communicationDev') || apps[0];
}

// Export services with proper typing
if (!defaultApp) {
  throw new Error('defaultApp is not initialized');
}
if (!communicationDevApp) {
  throw new Error('communicationDevApp is not initialized');
}

export const adminDb: Firestore = getFirestore(defaultApp);
export const adminAuth: Auth = getAuth(defaultApp);
export const adminRemoteConfig: RemoteConfig = getRemoteConfig(communicationDevApp);
