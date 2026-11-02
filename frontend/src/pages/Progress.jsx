import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Download, Plus, Printer, Trash2 } from 'lucide-react';
import api from '../api';
import { exportCSV, formatDate, todayInput, getError } from '../utils';
import { Alert, EmptyState, PageTitle } from '../components/UI';

const emptyForm = () => ({ weight: '', waist: '', chest: '', hips: '', arms: '', runTimeSeconds: '', liftWeight: '', notes: '', recordedAt: todayInput() });

export default function Progress() {
  const [items, setItems] = useState([]); const [form, setForm] = useState(emptyForm()); const [error, setError] = useState(''); const [success, setSuccess] = useState(''); const [busy, setBusy] = useState(false);
  const load = async () => { try { const { data } = await api.get('/progress'); setItems(data); } catch (e) { setError(getError(e, 'Could not load progress records.')); } };
  useEffect(() => { load(); }, []);
  const change = (key, value) => setForm(old => ({ ...old, [key]: value }));
  const chartData = useMemo(() => items.filter(x => x.weight != null).map(x => ({ date: new Date(x.recordedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), weight: Number(x.weight) })), [items]);
  const latestWeight = chartData.at(-1)?.weight;
  const firstWeight = chartData[0]?.weight;
  const weightDifference = latestWeight != null && firstWeight != null ? latestWeight - firstWeight : null;
  async function submit(e) {
    e.preventDefault(); setError(''); setSuccess(''); setBusy(true);
    try {
      const numeric = key => form[key] === '' ? null : Number(form[key]);
      const measurements = { waist: numeric('waist'), chest: numeric('chest'), hips: numeric('hips'), arms: numeric('arms') };
      const payload = { weight: numeric('weight'), measurements, runTimeSeconds: numeric('runTimeSeconds'), liftWeight: numeric('liftWeight'), notes: form.notes, recordedAt: new Date(`${form.recordedAt}T12:00:00`).toISOString() };
      if (Object.values(payload).some(v => typeof v === 'number' && v < 0) || Object.values(measurements).some(v => v != null && v < 0)) throw new Error('Values cannot be negative.');
      const { data } = await api.post('/progress', payload); setItems(old => [...old, data].sort((a,b) => new Date(a.recordedAt) - new Date(b.recordedAt))); setSuccess('Progress record saved.'); setForm(emptyForm());
    } catch (e2) { setError(e2.message && !e2.response ? e2.message : getError(e2, 'Could not save progress.')); }
    finally { setBusy(false); }
  }
  async function remove(item) { if (!window.confirm('Delete this progress record?')) return; try { await api.delete(`/progress/${item._id}`); setItems(old => old.filter(x => x._id !== item._id)); setSuccess('Progress record deleted.'); } catch (e) { setError(getError(e)); } }
  const exportRows = items.map(x => ({ date: formatDate(x.recordedAt), weightKg: x.weight ?? '', waistCm: x.measurements?.waist ?? '', chestCm: x.measurements?.chest ?? '', hipsCm: x.measurements?.hips ?? '', armsCm: x.measurements?.arms ?? '', runTimeSeconds: x.runTimeSeconds ?? '', liftWeightKg: x.liftWeight ?? '', notes: x.notes ?? '' }));
  const valueField = (key, label, step = '0.1') => <label>{label}<input type="number" min="0" step={step} value={form[key]} onChange={e => change(key, e.target.value)} placeholder="â€”" /></label>;

  return <div className="page-content"><PageTitle eyebrow="MEASURE WHAT MATTERS" title="Progress" description="Record body measurements and performance milestones over time." action={<div className="title-actions"><button className="btn btn-ghost" onClick={() => exportCSV('corex-progress.csv', exportRows)}><Download size={15} /> Export CSV</button><button className="btn btn-ghost" onClick={() => window.print()}><Printer size={15} /> Save PDF</button></div>} />
    {error && <Alert>{error}</Alert>}{success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}
    <div className="stats-grid"><div className="stat-card"><div className="stat-top"><span>Latest weight</span></div><strong>{latestWeight != null ? `${latestWeight} kg` : 'â€”'}</strong><small>Most recent weight entry</small></div><div className="stat-card"><div className="stat-top"><span>Change since first log</span></div><strong className={weightDifference == null ? '' : weightDifference > 0 ? 'neutral-value' : 'good-value'}>{weightDifference == null ? 'â€”' : `${weightDifference > 0 ? '+' : ''}${weightDifference.toFixed(1)} kg`}</strong><small>Based on recorded weights</small></div><div className="stat-card"><div className="stat-top"><span>Progress records</span></div><strong>{items.length}</strong><small>All saved check-ins</small></div></div>
    <div className="dashboard-grid progress-layout"><section className="panel chart-panel"><div className="panel-heading"><div><span className="eyebrow">BODY WEIGHT</span><h2>Weight trend</h2></div></div>{chartData.length > 1 ? <div className="chart-wrap tall"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}><defs><linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef233c" stopOpacity={0.3} /><stop offset="100%" stopColor="#ef233c" stopOpacity={0.01} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} /><XAxis dataKey="date" tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)' }} /><Area dataKey="weight" type="monotone" name="Weight (kg)" stroke="#ef233c" strokeWidth={2.5} fill="url(#progressFill)" /></AreaChart></ResponsiveContainer></div> : <EmptyState title="Your progress curve starts here" description="Add at least two weight entries to reveal the trend." />}<div className="chart-note">Weight changes are only one metric. Review measurements and performance alongside them.</div></section>
      <section className="panel form-panel"><div className="panel-heading"><div><span className="eyebrow">NEW CHECK-IN</span><h2>Record progress</h2></div></div><form className="form-stack" onSubmit={submit}><div className="field-grid">{valueField('weight', 'Weight (kg)')}{valueField('liftWeight', 'Lift / PR (kg)')}</div><div className="field-grid">{valueField('waist', 'Waist (cm)')}{valueField('chest', 'Chest (cm)')}</div><div className="field-grid">{valueField('hips', 'Hips (cm)')}{valueField('arms', 'Arms (cm)')}</div><label>Run time (seconds)<input type="number" min="0" value={form.runTimeSeconds} onChange={e => change('runTimeSeconds', e.target.value)} placeholder="e.g. 360" /></label><label>Record date<input type="date" value={form.recordedAt} onChange={e => change('recordedAt', e.target.value)} required /></label><label>Notes<textarea rows="2" value={form.notes} onChange={e => change('notes', e.target.value)} placeholder="Energy, personal best, how you feel..." maxLength={1000} /></label><button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Saving...' : <><Plus size={16} /> Save check-in</>}</button></form></section></div>
    <section className="panel record-panel"><div className="panel-heading"><div><span className="eyebrow">CHECK-IN HISTORY</span><h2>Previous records</h2></div></div>{items.length ? <div className="table-wrap"><table><thead><tr><th>Date</th><th>Weight</th><th>Waist</th><th>Run time</th><th>Lift / PR</th><th>Notes</th><th /></tr></thead><tbody>{[...items].reverse().map(item => <tr key={item._id}><td>{formatDate(item.recordedAt)}</td><td>{item.weight != null ? `${item.weight} kg` : 'â€”'}</td><td>{item.measurements?.waist != null ? `${item.measurements.waist} cm` : 'â€”'}</td><td>{item.runTimeSeconds != null ? `${item.runTimeSeconds}s` : 'â€”'}</td><td>{item.liftWeight != null ? `${item.liftWeight} kg` : 'â€”'}</td><td className="notes-cell">{item.notes || 'â€”'}</td><td><button className="icon-btn danger" onClick={() => remove(item)} title="Delete record"><Trash2 size={15} /></button></td></tr>)}</tbody></table></div> : <EmptyState title="No check-ins yet" description="Save your first progress record with the form above." />}</section>
    <p className="print-footnote">CoreX Fitness progress report Â· Values are user-entered and not medical advice.</p>
  </div>;
}

