import React from "react";
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Loading } from './components/UI';
import Landing from './pages/Landing';
import AuthPage from './pages/AuthPage';
import AppLayout from './pages/AppLayout';


export default function App() {
  const { user, checking } = useAuth();
  if (checking) return <Loading />;
  return <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<AuthPage />} />
    <Route path="/register" element={<AuthPage />} />
    <Route path="/app" element={user ? <AppLayout /> : <Navigate to="/login" replace />} />
    <Route path="*" element={<Navigate to={user ? '/app' : '/'} replace />} />
  </Routes>;
}
