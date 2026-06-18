// IMPORTANT: Copy .env.example to .env and fill in your Firebase values.

import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth/web-extension";
import { Firestore, enableNetwork, getFirestore } from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";
import { retryWithBackoff } from "../utils/firestoreUtils";

// ✅ Fallback config
const fallbackFirebaseConfig = {
  apiKey: "AIzaSyBn9dY3v0MYhJZ5Fvye-VcIZJ8v1sa4JHg",
  authDomain: "discover-db293.firebaseapp.com",
  projectId: "discover-db293",
  storageBucket: "discover-db293.firebasestorage.app",
  messagingSenderId: "6777509433",
  appId: "1:6777509433:web:e7d40294153571eed65fe8",
};

// ✅ Use env OR fallback
export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || fallbackFirebaseConfig.apiKey,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || fallbackFirebaseConfig.authDomain,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || fallbackFirebaseConfig.projectId,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || fallbackFirebaseConfig.storageBucket,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || fallbackFirebaseConfig.messagingSenderId,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || fallbackFirebaseConfig.appId,
};

// ✅ SINGLE DECLARATION (FIXED TYPES)
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

auth = getAuth(app);

db = getFirestore(app);

storage = getStorage(app);

// ✅ EXPORTS
export { app, auth, db, storage };

// ✅ Enable network (safe retry)
export const enableFirestoreNetwork = async (): Promise<void> => {
  if (!db) return;

  try {
    await retryWithBackoff(() => enableNetwork(db), 3, 1000);
    console.log("[Firebase] Firestore network enabled.");
  } catch (error: any) {
    console.warn("[Firebase] enableNetwork failed:", error?.message);
  }
};

export const isFirebaseConfigured = !!app;