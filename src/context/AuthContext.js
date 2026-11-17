import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signOut,
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  const login = (email, senha) =>
    signInWithEmailAndPassword(auth, email.trim(), senha);

  const register = async (nome, email, senha) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), senha);
    await updateProfile(cred.user, { displayName: nome.trim() });
    setUser({ ...cred.user, displayName: nome.trim() });
    return cred;
  };

  const logout = () => signOut(auth);

  const updateName = async (nome) => {
    await updateProfile(auth.currentUser, { displayName: nome.trim() });
    setUser({ ...auth.currentUser, displayName: nome.trim() });
  };

  const changePassword = async (senhaAtual, novaSenha) => {
    const current = auth.currentUser;
    const credential = EmailAuthProvider.credential(current.email, senhaAtual);
    await reauthenticateWithCredential(current, credential);
    await updatePassword(current, novaSenha);
  };

  return (
    <AuthContext.Provider value={{ user, initializing, login, register, logout, updateName, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
};
