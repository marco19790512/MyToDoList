import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

const STORAGE_KEY = 'my_todo_firebase_config';

// 預設為使用者指定的 Firebase 專案 ID: my-to-do-list-7d60c
const DEFAULT_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBWxu-uZAVKOQ_ziUMkz_sz_Eig_WmZSeo',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'my-to-do-list-7d60c.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'my-to-do-list-7d60c',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'my-to-do-list-7d60c.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '898769600470',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:898769600470:web:de4a594addf21ed3f12e77'
};

export const getStoredConfig = () => {
  try {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      return { ...DEFAULT_CONFIG, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to parse local firebase config', e);
  }
  return DEFAULT_CONFIG;
};

export const saveFirebaseConfig = (config) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  window.location.reload();
};

export const clearStoredFirebaseConfig = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
};

const currentConfig = getStoredConfig();

export const isFirebaseConfigValid = Boolean(
  currentConfig.apiKey && 
  currentConfig.apiKey.trim() !== '' && 
  currentConfig.projectId &&
  currentConfig.projectId.trim() !== ''
);

let app = null;
let auth = null;
let db = null;
let googleProvider = null;

if (isFirebaseConfigValid) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(currentConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (err) {
    console.error('Firebase initialization error:', err);
  }
}

export {
  app,
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove
};
