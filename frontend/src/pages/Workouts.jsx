import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Check, Edit2, Plus, Search, Trash2, X } from 'lucide-react';
import api from '../api';
import { exportCSV, formatDate, todayInput, getError } from '../utils';
import { Alert, EmptyState, PageTitle } from '../components/UI';

const emptyForm = () => ({ exercise: '', category: 'Strength', sets: 3, reps: 10, weight: 0, durationMinutes: 0, notes: '', performedAt: todayInput() });
const categories = ['All', 'Strength', 'Cardio', 'HIIT', 'Mobility', 'Other'];

export default function Workouts() {
  const [items, setItems] = useState([]); const [form, setForm] = useState(emptyForm()); const [editing, setEditing] = useState(null); const [search, setSearch] = useState(''); const [category, setCategory] = useState('All'); const [error, setError] = useState(''); const [success, setSuccess] = useState(''); const [busy, setBusy] = useState(false);
  const load = async () => { try { const { data } = await api.get('/workouts'); setItems(data); } catch (e) { setError(getError(e, 'Could not load workouts.')); } };
  useEffect(() => { load(); }, []);
  const change = (key, value) => setForm(old => ({ ...old, [key]: value }));
  const filtered = useMemo(() => items.filter(item => (category === 'All' || item.category === category) && item.exercise.toLowerCase().includes(search.toLowerCase())), [items, category, search]);
  async function submit(e) {
    e.preventDefault(); setError(''); setSuccess(''); setBusy(true);
    try {
      const payload = { ...form, sets: Number(form.sets), reps: Number(form.reps), weight: Number(form.weight), durationMinutes: Number(form.durationMinutes), performedAt: new Date(`${form.performedAt}T12:00:00`).toISOString() };
      if (!payload.exercise.trim()) throw new Error('Exercise name is required.');
      if (payload.sets < 0 || payload.reps < 0 || payload.weight < 0 || payload.durationMinutes < 0) throw new Error('Numbers must be zero or higher.');
      if (editing) await api.put(`/workouts/${editing}`, payload); else await api.post('/workouts', payload);
      setSuccess(editing ? 'Workout updated.' : 'Workout added.'); setEditing(null); setForm(emptyForm()); await load();
    } catch (e2) { setError(e2.message && !e2.response ? e2.message : getError(e2, 'Could not save workout.')); }
    finally { setBusy(false); }
  }
  function startEdit(item) { setEditing(item._id); setForm({ exercise: item.exercise, category: item.category, sets: item.sets, reps: item.reps, weight: item.weight, durationMinutes: item.durationMinutes, notes: item.notes || '', performedAt: new Date(item.performedAt).toISOString().slice(0, 10) }); setError(''); setSuccess(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  async function remove(item) { if (!window.confirm(`Delete ${item.exercise}?`)) return; try { await api.delete(`/workouts/${item._id}`); setItems(old => old.filter(w => w._id !== item._id)); setSuccess('Workout deleted.'); } catch (e) { setError(getError(e, 'Could not delete workout.')); } }

  return <div className="page-content"><PageTitle eyebrow="TRAINING LOG" title="Workouts" description="Build a record of every session, set and rep." action={<button className="btn btn-ghost" onClick={() => exportCSV('corex-workouts.csv', items.map(({ exercise, category, sets, reps, weight, durationMinutes, notes, performedAt }) => ({ exercise, category, sets, reps, weight, durationMinutes, notes, date: formatDate(performedAt) })))}>Export CSV</button>} />
    {error && <Alert>{error}</Alert>}{success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}
    <div className="workout-layout"><section className="panel form-panel"><div className="panel-heading"><div><span className="eyebrow">{editing ? 'EDIT SESSION' : 'NEW SESSION'}</span><h2>{editing ? 'Update workout' : 'Add a workout'}</h2></div>{editing && <button className="icon-btn" onClick={() => { setEditing(null); setForm(emptyForm()); }} title="Cancel edit"><X size={17} /></button>}</div><form className="form-stack" onSubmit={submit}>
      <label>Exercise name<input value={form.exercise} onChange={e => change('exercise', e.target.value)} placeholder="e.g. Bench Press" maxLength={100} required /></label>
      <label>Category<select value={form.category} onChange={e => change('category', e.target.value)}>{categories.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}</select></label>
      <div className="field-grid"><label>Sets<input type="number" min="0" max="100" value={form.sets} onChange={e => change('sets', e.target.value)} required /></label><label>Reps<input type="number" min="0" max="1000" value={form.reps} onChange={e => change('reps', e.target.value)} required /></label></div>
      <div className="field-grid"><label>Weight (kg)<input type="number" min="0" step="0.25" value={form.weight} onChange={e => change('weight', e.target.value)} /></label><label>Duration (min)<input type="number" min="0" value={form.durationMinutes} onChange={e => change('durationMinutes', e.target.value)} /></label></div>
      <label>Date<input type="date" value={form.performedAt} onChange={e => change('performedAt', e.target.value)} required /></label><label>Notes <span className="optional">Optional</span><textarea rows="3" value={form.notes} onChange={e => change('notes', e.target.value)} placeholder="How did the session feel?" maxLength={1000} /></label>
      <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Saving...' : <>{editing ? <Check size={16} /> : <Plus size={16} />}{editing ? 'Save changes' : 'Add workout'}</>}</button>
    </form></section>
    <section className="panel table-panel"><div className="panel-heading"><div><span className="eyebrow">YOUR HISTORY</span><h2>Training sessions <span className="count-pill">{filtered.length}</span></h2></div></div><div className="filters-row"><div className="search-box"><Search size={16} /><input aria-label="Search exercises" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search exercises..." /></div><select value={category} onChange={e => setCategory(e.target.value)} aria-label="Filter category" className="compact-select">{categories.map(c => <option key={c}>{c}</option>)}</select></div>
      {filtered.length ? <div className="table-wrap"><table><thead><tr><th>Exercise</th><th>Sets / reps</th><th>Weight</th><th>Category</th><th>Date</th><th>Actions</th></tr></thead><tbody>{filtered.map(item => <tr key={item._id}><td><div className="primary-cell">{item.exercise}<small>{item.notes || 'No notes'}</small></div></td><td>{item.sets} Ã— {item.reps}</td><td>{item.weight} kg</td><td><span className="category-tag">{item.category}</span></td><td>{formatDate(item.performedAt, { month: 'short', day: 'numeric' })}</td><td><div className="row-actions"><button className="icon-btn" title="Edit" onClick={() => startEdit(item)}><Edit2 size={15} /></button><button className="icon-btn danger" title="Delete" onClick={() => remove(item)}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div> : <EmptyState title={search || category !== 'All' ? 'No matching workouts' : 'Your first session goes here'} description={search || category !== 'All' ? 'Change your search or filter to see other sessions.' : 'Use the form to add your first workout.'} />}
    </section></div>
  </div>;
}

