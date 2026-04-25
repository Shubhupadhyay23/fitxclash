/**
 * Firebase Configuration
 * 
 * Initialize Firebase for the frontend.
 */

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Firebase web app configuration
// All values should be set in .env.local file
const firebaseConfig = {
  apiKey: "AIzaSyD7sQn4wc3kCKEVAPY3_iHqnW3jAO0sS0s",
  authDomain: "fitxclashapp.firebaseapp.com",
  projectId: "fitxclashapp",
  storageBucket: "fitxclashapp.firebasestorage.app",
  messagingSenderId: "979924828812",
  appId: "1:979924828812:web:10eaf33096ac657249b1a9",
  measurementId: "G-B1E0H2ZRCF"
};

// Validate that all required config values are present
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

const missingVars = requiredEnvVars.filter(
  (varName) => !import.meta.env[varName]
);

if (missingVars.length > 0 && import.meta.env.DEV) {
  console.warn(
    'Missing required Firebase environment variables:',
    missingVars.join(', ')
  );
  console.warn('Please create a .env.local file with your Firebase config.');
}

// Initialize Firebase (only if not already initialized)
let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;

// Wrap initialization in try-catch to prevent crashes
try {
  if (getApps().length === 0) {
    // Only initialize if we have the required config
    if (firebaseConfig.apiKey && firebaseConfig.projectId) {
      app = initializeApp(firebaseConfig);
      console.log("✅ Firebase initialized successfully");
    } else {
      console.warn("Firebase config incomplete - some features may not work");
    }
  } else {
    app = getApps()[0];
  }

  if (app) {
    // Initialize Firebase Auth
    authInstance = getAuth(app);

    // Initialize Analytics (only in browser environment)
    if (typeof window !== "undefined") {
      try {
        getAnalytics(app);
      } catch (error) {
        console.warn("Firebase Analytics initialization failed:", error);
      }
    }
  }
} catch (error: any) {
  console.error("Firebase initialization error:", error);
  console.warn("App will continue without Firebase - authentication features will not work");
  // Don't throw - let the app continue
}

// Export with null check - components should handle null case
export const auth: Auth | null = authInstance;

export default app;

