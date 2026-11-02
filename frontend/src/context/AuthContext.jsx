import React from "react";
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api';


const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('corex_user') || 'null'); } catch { return null; }
  });
  const [checking, setChecking] = useState(Boolean(localStorage.getItem('corex_token')));

  useEffect(() => {
    if (!localStorage.getItem('corex_token')) { setChecking(false); return; }
    api.get('/auth/me')
      .then(({ data }) => { setUser(data.user); localStorage.setItem('corex_user', JSON.stringify(data.user)); })
      .catch(() => { localStorage.removeItem('corex_token'); localStorage.removeItem('corex_user'); setUser(null); })
      .finally(() => setChecking(false));
  }, []);

  const signIn = (data) => {
    localStorage.setItem('corex_token', data.token);
    localStorage.setItem('corex_user', JSON.stringify(data.user));
    setUser(data.user);
  };
  const signOut = () => {
    localStorage.removeItem('corex_token'); localStorage.removeItem('corex_user'); setUser(null);
  };
  const updateUser = (nextUser) => {
    setUser(nextUser); localStorage.setItem('corex_user', JSON.stringify(nextUser));
  };
  const value = useMemo(() => ({ user, checking, signIn, signOut, updateUser }), [user, checking]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}
