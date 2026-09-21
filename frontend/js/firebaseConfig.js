/**
 * Scriptify - Firebase Integration Module
 * Project: criz-51a78
 * Supports Google Authentication, Email Authentication, and Analytics
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAnalytics, isSupported as isAnalyticsSupported } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-analytics.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAoYYoUMWHoD6awIRNhieAGh0Z4fYsY8ZM",
  authDomain: "criz-51a78.firebaseapp.com",
  projectId: "criz-51a78",
  storageBucket: "criz-51a78.firebasestorage.app",
  messagingSenderId: "953617491402",
  appId: "1:953617491402:web:28d6a0109943d4b2be1b33",
  measurementId: "G-CHPSQMHH1F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics safely (if supported by the browser environment)
let analytics = null;
isAnalyticsSupported().then(supported => {
  if (supported) {
    try {
      analytics = getAnalytics(app);
      console.log("[Firebase] Analytics initialized successfully.");
    } catch (e) {
      console.warn("[Firebase] Analytics init notice:", e.message);
    }
  }
}).catch(() => {});

// Initialize Firebase Authentication
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Synchronize Firebase authenticated user with Scriptify PostgreSQL backend
 * (Registers user in Table D1 & CreditWallet Table D2 if new, returns JWT)
 */
async function syncFirebaseSession(firebaseUser) {
  if (!firebaseUser || !firebaseUser.email) {
    throw new Error("No valid user profile returned from Firebase.");
  }

  const idToken = await firebaseUser.getIdToken().catch(() => null);

  const response = await fetch('/api/auth/firebase-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: firebaseUser.email,
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName || '',
      idToken: idToken
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to authenticate session with Scriptify backend.');
  }

  // Store Scriptify JWT token for subsequent API requests
  if (data.token) {
    localStorage.setItem('scriptify_token', data.token);
  }

  return data;
}

/**
 * Sign in using Google Popup (Firebase)
 */
async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  const session = await syncFirebaseSession(user);
  return { user, session };
}

/**
 * Sign in using Email and Password (Firebase)
 */
async function loginWithEmail(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  const user = result.user;
  const session = await syncFirebaseSession(user);
  return { user, session };
}

/**
 * Register new account using Email and Password (Firebase)
 */
async function registerWithEmail(email, password) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  const user = result.user;
  const session = await syncFirebaseSession(user);
  return { user, session };
}

/**
 * Sign out of Firebase
 */
async function logoutFirebase() {
  await signOut(auth);
  localStorage.removeItem('scriptify_token');
}

// Expose on global window object for easy access across pages
window.FirebaseBridge = {
  app,
  analytics,
  auth,
  googleProvider,
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  logoutFirebase,
  syncFirebaseSession,
  onAuthStateChanged: (cb) => onAuthStateChanged(auth, cb)
};

// Dispatch readiness event
window.dispatchEvent(new CustomEvent('firebase:ready', { detail: { app, auth } }));
console.log("[Firebase] FirebaseBridge mounted and ready.");
