'use client';
import { useEffect, useState } from 'react';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { GoogleAuthProvider, connectAuthEmulator, getAuth, onAuthStateChanged, signInWithPopup, signOut, type Auth, type User } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig, firebaseConfigured, firebaseEmulator } from './config';

// Firebase is only touched from effects and event handlers, never during render,
// so the static prerender never initializes it.

let cached: { app: FirebaseApp; auth: Auth; db: Firestore } | null = null;

export function getFirebase() {
  if (!firebaseConfigured) throw new Error('Firebase is not configured yet (src/lib/firebase/config.ts).');
  if (!cached) {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    cached = { app, auth: getAuth(app), db: getFirestore(app) };
    if (firebaseEmulator) {
      connectAuthEmulator(cached.auth, 'http://127.0.0.1:9099', { disableWarnings: true });
      connectFirestoreEmulator(cached.db, '127.0.0.1', 8089);
    }
  }
  return cached;
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  // Popup, not redirect: redirect sign-in breaks on custom domains in browsers
  // that block third-party storage.
  return signInWithPopup(getFirebase().auth, provider);
}

export function signOutUser() {
  return signOut(getFirebase().auth);
}

export function describeAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return 'Sign-in was cancelled.';
  if (code === 'auth/popup-blocked') return 'Your browser blocked the sign-in popup. Allow popups for this site and try again.';
  if (code === 'auth/unauthorized-domain') return 'This domain is not authorized for sign-in yet (Firebase > Authentication > Settings > Authorized domains).';
  if (code === 'auth/network-request-failed') return 'Network error. Check your connection and try again.';
  return 'Sign-in failed. Please try again.';
}

export interface AuthState {
  configured: boolean;
  loading: boolean;
  user: User | null;
}

/** Current Firebase user; `loading` stays true until Firebase reports the first state. */
export function useFirebaseUser(): AuthState {
  const [state, setState] = useState<{ loading: boolean; user: User | null }>({ loading: firebaseConfigured, user: null });

  useEffect(() => {
    if (!firebaseConfigured) return;
    return onAuthStateChanged(getFirebase().auth, (user) => setState({ loading: false, user }));
  }, []);

  return { configured: firebaseConfigured, ...state };
}

/** Lowercased email of a verified account, or null. */
export function verifiedEmail(user: User | null): string | null {
  return user?.email && user.emailVerified ? user.email.trim().toLowerCase() : null;
}
