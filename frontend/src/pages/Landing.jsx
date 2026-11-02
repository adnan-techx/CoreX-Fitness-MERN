import React from 'react';
import { ArrowRight, Activity, BarChart3, CalendarClock, Check, Dumbbell, Flame, ShieldCheck, Utensils } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user } = useAuth();
  if (user) return <Navigate to="/app" replace />;
  return <div className="landing-page">
    <header className="landing-nav shell"><Link to="/" aria-label="CoreX Fitness home"><Logo /></Link><nav><a href="#features">Features</a><a href="#how-it-works">How it works</a></nav><div className="nav-actions"><Link className="btn btn-ghost" to="/login">Log in</Link><Link className="btn btn-primary" to="/register">Get started <ArrowRight size={16} /></Link></div></header>
    <main>
      <section className="hero shell">
        <img
          src="/bodybuilder.png"
          alt="CoreX Fitness athlete"
          className="hero-background-image"
        />
        <div className="hero-copy"><span className="pill"><span className="pulse-dot" /> YOUR FITNESS IS OUR MISSION</span><h1>NO LIMITS<br /><em>JUST </em> PROGRESS</h1><p>One focused space for your workouts, nutrition and progress. Track the work, see the results, and keep moving forward.</p><div className="hero-actions"><Link to="/register" className="btn btn-primary btn-lg">Start your journey <ArrowRight size={18} /></Link><a className="btn btn-ghost btn-lg" href="#features">Explore features</a></div><div className="trust-line"><ShieldCheck size={17} /> Personal data stays tied to your account</div></div>
        <div className="hero-visual" aria-label="CoreX fitness dashboard preview"><div className="visual-glow" /><div className="hero-x">X</div><div className="hero-visual-content"><div className="visual-top"><span>YOUR WEEK</span><span className="status-chip">ON TRACK</span></div><div className="visual-number">04<span> / 05</span></div><div className="visual-label">workouts completed</div><div className="visual-bars">{[36, 56, 45, 80, 64, 94, 42].map((height, i) => <div key={i} className={`visual-bar ${i === 5 ? 'hot' : ''}`} style={{ height: `${height}%` }} />)}</div><div className="visual-bottom"><span><Dumbbell size={15} /> Consistency wins</span><span>+18% <TrendingIcon /></span></div></div><div className="floating-kcal"><span className="tiny-icon"><Flame size={18} /></span><div><strong>2,180</strong><small>daily calories</small></div><span className="mini-up">+12%</span></div><div className="floating-target"><Activity size={18} /><div><strong>Goal in sight</strong><small>Keep your streak alive</small></div></div></div>
      </section>
      <section className="feature-strip shell" id="features"><div className="strip-heading"><span className="eyebrow">BUILT FOR YOUR ROUTINE</span><h2><br /><em></em></h2></div><div className="feature-grid"><Feature icon={<Dumbbell />} title="Workout log" text="Track exercises, sets, reps, load and training notes." /><Feature icon={<Utensils />} title="Nutrition diary" text="Log meals, calories and protein, carbs and fats." /><Feature icon={<BarChart3 />} title="Progress charts" text="See your weight and performance trends over time." /><Feature icon={<CalendarClock />} title="Smart reminders" text="Create reminders for workouts and nutrition habits." /></div></section>
      <section className="dark-band" id="how-it-works"><div className="shell band-inner"><div><span className="eyebrow">MADE TO KEEP YOU MOVING</span><h2>Your effort.<br /><em>Measured.</em></h2><p>Build routines, review your history, and make your next session count â€” with your personal dashboard always within reach.</p><Link to="/register" className="btn btn-primary">Create your free account <ArrowRight size={17} /></Link></div><div className="checklist"><Checklist title="Track every session" /><Checklist title="Understand your nutrition" /><Checklist title="Record your fitness metrics" /><Checklist title="Export your progress report" /></div></div></section>
    </main>
    <footer className="landing-footer shell"><Logo compact /><span>Â© {new Date().getFullYear()} CoreX Fitness</span><span>Stronger / Healthier / Better</span></footer>
  </div>;
}
function Feature({ icon, title, text }) { return <article className="feature-card"><div className="feature-icon">{icon}</div><h3>{title}</h3><p>{text}</p><span className="feature-line" /></article>; }
function Checklist({ title }) { return <div className="check-row"><span><Check size={16} /></span>{title}</div>; }
function TrendingIcon() { return <svg viewBox="0 0 18 18" aria-hidden="true"><path d="M3 12l4-4 3 2 5-6M10 4h5v5" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>; }

