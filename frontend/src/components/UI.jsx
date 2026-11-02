import React from 'react';
import { AlertCircle, CheckCircle2, Dumbbell, Flame, Target, TrendingUp } from 'lucide-react';

export function PageTitle({ eyebrow, title, description, action }) {
  return <div className="page-title-row"><div><div className="eyebrow">{eyebrow || 'COREX FITNESS'}</div><h1>{title}</h1>{description && <p className="muted page-description">{description}</p>}</div>{action && <div className="title-action">{action}</div>}</div>;
}

export function StatCard({ label, value, sub, icon = 'target', accent = false }) {
  const icons = { target: Target, workout: Dumbbell, calories: Flame, trend: TrendingUp };
  const Icon = icons[icon] || Target;
  return <div className={`stat-card ${accent ? 'accent' : ''}`}><div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon size={18} /></span></div><strong>{value}</strong>{sub && <small>{sub}</small>}</div>;
}

export function Alert({ children, type = 'error', onClose }) {
  if (!children) return null;
  return <div className={`alert ${type}`} role="status">{type === 'success' ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}<span>{children}</span>{onClose && <button className="alert-close" onClick={onClose} aria-label="Close message">Ã—</button>}</div>;
}

export function EmptyState({ title = 'Nothing here yet', description = 'Add your first entry to see it here.' }) {
  return <div className="empty-state"><div className="empty-mark"><Dumbbell size={22} /></div><h3>{title}</h3><p>{description}</p></div>;
}

export function Loading({ text = 'Loading your workspace...' }) {
  return <div className="loading-screen"><span className="loader" /><p>{text}</p></div>;
}

