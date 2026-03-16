import { initializeApp } from 'firebase/app';
import { 
    initializeAuth, 
    // @ts-ignore
    getReactNativePersistence,
    getAuth
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBOwyeJEuohZ2N3gHxvWHWVZgM6t0Or7Xk",
  authDomain: "sv-messages.firebaseapp.com",
  projectId: "sv-messages",
  storageBucket: "sv-messages.firebasestorage.app",
  messagingSenderId: "1083007025763",
  appId: "1:1083007025763:web:dd0bc6e4d04ae9d5bf6e56",
  measurementId: "G-4GJVG6NRJP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (safely for different environments)
export let analytics: any;
isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

// Initialize Firebase Auth with persistence
let firebaseAuth;
try {
  // Check if getReactNativePersistence is available to avoid runtime errors
  if (typeof getReactNativePersistence === 'function') {
    firebaseAuth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } else {
    firebaseAuth = getAuth(app);
  }
} catch (e) {
  // Fallback to default auth if already initialized
  firebaseAuth = getAuth(app);
}

export const auth = firebaseAuth;
export const db = getFirestore(app);

export default app;
