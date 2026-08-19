import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        const idToken = await currentUser.getIdToken();
        await api.post('/auth/login', { idToken }).catch(() => {});
      }
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await credential.user.getIdToken();
    // Firebase has already authenticated the user. Keep the API profile sync
    // non-blocking so a temporarily unavailable backend does not stop login.
    await api.post('/auth/login', { idToken }).catch(() => {});
    return credential.user;
  };

  const register = async ({ name, email, password }) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      await updateProfile(credential.user, { displayName: name });
    }
    const idToken = await credential.user.getIdToken();
    await api.post('/auth/register', { idToken }).catch(() => {});
    return credential.user;
  };

  const logout = () => signOut(auth);
  const resetPassword = email => sendPasswordResetEmail(auth, email);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      resetPassword
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
