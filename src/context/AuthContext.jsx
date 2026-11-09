import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  isFirebaseConfigValid,
  doc,
  setDoc,
  serverTimestamp
} from '../firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (!isFirebaseConfigValid || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);

      if (user && db) {
        // Sync user profile to Firestore for collaboration display & member selection
        try {
          const userRef = doc(db, 'users', user.uid);
          await setDoc(userRef, {
            uid: user.uid,
            displayName: user.displayName || 'Anonymous',
            email: user.email || '',
            photoURL: user.photoURL || '',
            lastSeen: serverTimestamp()
          }, { merge: true });
        } catch (err) {
          console.warn('Could not sync user profile to Firestore:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setAuthError(null);
    if (!isFirebaseConfigValid || !auth) {
      setAuthError('Firebase 尚未配置有效的 API Key，請先於右上角設定填入。');
      return;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('Google Sign-in error:', error);
      let message = '登入失敗，請稍後再試。';
      if (error.code === 'auth/popup-closed-by-user') {
        message = '登入視窗已關閉。';
      } else if (error.code === 'auth/unauthorized-domain') {
        message = '此網域尚未加入 Firebase 授權網域 (Authorized Domains)。請至 Firebase Console -> Authentication -> Settings 加入。';
      } else if (error.code === 'auth/operation-not-allowed') {
        message = 'Google 登入功能尚未在 Firebase Console 啟用。請至 Authentication -> Sign-in method 開啟 Google 登入。';
      } else if (error.message) {
        message = error.message;
      }
      setAuthError(message);
      throw error;
    }
  };

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      authError,
      setAuthError,
      loginWithGoogle,
      logout,
      isConfigured: isFirebaseConfigValid
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
