import React from 'react';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { Alert } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { getError } from '../utils';

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signIn } = useAuth();
  const isRegister = location.pathname === '/register';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (user) return <Navigate to="/app" replace />;
  const change = (key, value) => setForm(old => ({ ...old, [key]: value }));

  async function submit(event) {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      const { data } = await api.post(isRegister ? '/auth/register' : '/auth/login', form);
      signIn(data); navigate('/app', { replace: true });
    } catch (err) { setError(getError(err, 'Unable to connect. Make sure the API server is running.')); }
    finally { setBusy(false); }
  }

  return <div className="auth-shell"><div className="auth-showcase"><Link to="/" className="back-link"><ArrowLeft size={16} /> Back to home</Link><div className="auth-hero-mark">X</div><div className="auth-showcase-copy"><span className="eyebrow">THE WORK ADDS UP</span><h2>Make every<br /><em>rep count.</em></h2><p>Training history, food logs and measurable progress â€” all in one place.</p><div className="secure-note"><ShieldCheck size={17} /> Secure account access</div></div><div className="auth-watermark">COREX / FITNESS</div></div><div className="auth-panel"><div className="auth-logo"><Logo /></div><div className="auth-form-wrap"><span className="eyebrow">{isRegister ? 'START STRONG' : 'WELCOME BACK'}</span><h1>{isRegister ? 'Create account' : 'Sign in to CoreX'}</h1><p className="muted">{isRegister ? 'Create your personal fitness space in a few steps.' : 'Your next personal best starts here.'}</p><Alert>{error}</Alert><form className="form-stack" onSubmit={submit}>
      {isRegister && <label>Full name<input value={form.name} onChange={e => change('name', e.target.value)} autoComplete="name" placeholder="Your name" required maxLength={80} /></label>}
      <label>Email address<input type="email" value={form.email} onChange={e => change('email', e.target.value)} autoComplete="email" placeholder="you@example.com" required /></label>
      <label>Password<div className="password-field"><input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => change('password', e.target.value)} autoComplete={isRegister ? 'new-password' : 'current-password'} placeholder={isRegister ? 'At least 8 characters' : 'Enter your password'} minLength={isRegister ? 8 : 1} required /><button type="button" className="show-password" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
      {isRegister && <div className="fine-print">By creating an account, you agree to use CoreX responsibly and keep your sign-in details private.</div>}
      <button className="btn btn-primary btn-block btn-lg" disabled={busy}>{busy ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'} <ArrowRight size={17} /></button>
    </form><p className="auth-switch">{isRegister ? 'Already have an account?' : 'New to CoreX?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Log in' : 'Create an account'}</Link></p></div><div className="auth-bottom">Â© {new Date().getFullYear()} CoreX Fitness <span>Built for consistency.</span></div></div></div>;
}

