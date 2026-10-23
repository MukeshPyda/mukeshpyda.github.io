// Public Firebase web config. Safe to commit: it only identifies the project,
// and every read/write is checked by the Firestore security rules.
// Paste the firebaseConfig object from Firebase console > Project settings > Your apps.
const projectConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

// Local testing against the Firebase emulators (never set in the deployed build):
//   NEXT_PUBLIC_FIREBASE_EMULATOR=1 npm run dev
export const firebaseEmulator = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR === '1';

export const firebaseConfig = firebaseEmulator
  ? { apiKey: 'demo-key', authDomain: '127.0.0.1', projectId: 'demo-hmca', storageBucket: '', messagingSenderId: '', appId: 'demo-app' }
  : projectConfig;

export const firebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
