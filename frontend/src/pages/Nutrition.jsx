import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Edit2, Plus, Search, Trash2, X } from 'lucide-react';
import api from '../api';
import { exportCSV, formatDate, todayInput, getError } from '../utils';
import { Alert, EmptyState, PageTitle } from '../components/UI';

const emptyForm = () => ({ foodItem: '', mealType: 'Breakfast', quantity: '100 g', calories: 0, protein: 0, carbs: 0, fats: 0, loggedAt: todayInput() });
const mealTypes = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack'];

export default function Nutrition() {
  const [items, setItems] = useState([]); const [form, setForm] = useState(emptyForm()); const [editing, setEditing] = useState(null); const [search, setSearch] = useState(''); const [mealType, setMealType] = useState('All'); const [error, setError] = useState(''); const [success, setSuccess] = useState(''); const [busy, setBusy] = useState(false);
  const load = async () => { try { const { data } = await api.get('/nutrition'); setItems(data); } catch (e) { setError(getError(e, 'Could not load nutrition logs.')); } };
  useEffect(() => { load(); }, []);
  const change = (key, value) => setForm(old => ({ ...old, [key]: value }));
  const filtered = useMemo(() => items.filter(item => (mealType === 'All' || item.mealType === mealType) && item.foodItem.toLowerCase().includes(search.toLowerCase())), [items, mealType, search]);
  const totals = useMemo(() => filtered.reduce((acc, item) => ({ calories: acc.calories + Number(item.calories || 0), protein: acc.protein + Number(item.protein || 0), carbs: acc.carbs + Number(item.carbs || 0), fats: acc.fats + Number(item.fats || 0) }), { calories: 0, protein: 0, carbs: 0, fats: 0 }), [filtered]);
  async function submit(e) {
    e.preventDefault(); setError(''); setSuccess(''); setBusy(true);
    try {
      const payload = { ...form, calories: Number(form.calories), protein: Number(form.protein), carbs: Number(form.carbs), fats: Number(form.fats), loggedAt: new Date(`${form.loggedAt}T12:00:00`).toISOString() };
      if (!payload.foodItem.trim()) throw new Error('Food item is required.');
      if ([payload.calories, payload.protein, payload.carbs, payload.fats].some(n => n < 0)) throw new Error('Nutrition values cannot be negative.');
      if (editing) await api.put(`/nutrition/${editing}`, payload); else await api.post('/nutrition', payload);
      setSuccess(editing ? 'Nutrition entry updated.' : 'Meal added to your diary.'); setEditing(null); setForm(emptyForm()); await load();
    } catch (err) { setError(err.message && !err.response ? err.message : getError(err, 'Could not save nutrition entry.')); }
    finally { setBusy(false); }
  }
  function startEdit(item) { setEditing(item._id); setForm({ foodItem: item.foodItem, mealType: item.mealType, quantity: item.quantity, calories: item.calories, protein: item.protein, carbs: item.carbs, fats: item.fats, loggedAt: new Date(item.loggedAt).toISOString().slice(0, 10) }); setError(''); setSuccess(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  async function remove(item) { if (!window.confirm(`Delete ${item.foodItem}?`)) return; try { await api.delete(`/nutrition/${item._id}`); setItems(old => old.filter(n => n._id !== item._id)); setSuccess('Food entry deleted.'); } catch (e) { setError(getError(e)); } }
  const valueField = (key, label) => <label>{label}<input type="number" min="0" step="0.1" value={form[key]} onChange={e => change(key, e.target.value)} /></label>;

  return <div className="page-content"><PageTitle eyebrow="FUEL YOUR PROGRESS" title="Nutrition" description="Log your meals and understand your daily macros." action={<button className="btn btn-ghost" onClick={() => exportCSV('corex-nutrition.csv', items.map(({ foodItem, mealType, quantity, calories, protein, carbs, fats, loggedAt }) => ({ foodItem, mealType, quantity, calories, protein, carbs, fats, date: formatDate(loggedAt) })))}>Export CSV</button>} />
    {error && <Alert>{error}</Alert>}{success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}
    <div className="macro-grid"><Macro label="Calories" amount={Math.round(totals.calories).toLocaleString()} unit="kcal" percent={Math.min(100, totals.calories / 2500 * 100)} color="red" /><Macro label="Protein" amount={`${Math.round(totals.protein)} g`} unit="total" percent={Math.min(100, totals.protein / 150 * 100)} color="blue" /><Macro label="Carbs" amount={`${Math.round(totals.carbs)} g`} unit="total" percent={Math.min(100, totals.carbs / 300 * 100)} color="teal" /><Macro label="Fats" amount={`${Math.round(totals.fats)} g`} unit="total" percent={Math.min(100, totals.fats / 80 * 100)} color="amber" /></div>
    <div className="workout-layout"><section className="panel form-panel"><div className="panel-heading"><div><span className="eyebrow">{editing ? 'EDIT FOOD LOG' : 'ADD FOOD LOG'}</span><h2>{editing ? 'Update meal' : 'Log a meal'}</h2></div>{editing && <button className="icon-btn" onClick={() => { setEditing(null); setForm(emptyForm()); }}><X size={17} /></button>}</div><form className="form-stack" onSubmit={submit}>
      <label>Food item<input value={form.foodItem} onChange={e => change('foodItem', e.target.value)} placeholder="e.g. Chicken breast" required maxLength={100} /></label><label>Meal type<select value={form.mealType} onChange={e => change('mealType', e.target.value)}>{mealTypes.filter(x => x !== 'All').map(x => <option key={x}>{x}</option>)}</select></label>
      <div className="field-grid"><label>Quantity<input value={form.quantity} onChange={e => change('quantity', e.target.value)} placeholder="150 g" maxLength={50} required /></label><label>Date<input type="date" value={form.loggedAt} onChange={e => change('loggedAt', e.target.value)} required /></label></div>
      <div className="field-grid">{valueField('calories', 'Calories (kcal)')}{valueField('protein', 'Protein (g)')}</div><div className="field-grid">{valueField('carbs', 'Carbs (g)')}{valueField('fats', 'Fats (g)')}</div>
      <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Saving...' : <>{editing ? <Edit2 size={16} /> : <Plus size={16} />}{editing ? 'Save changes' : 'Add food'}</>}</button><p className="field-hint">Nutrition values are entered manually; use reliable food labels or nutrition references.</p>
    </form></section>
    <section className="panel table-panel"><div className="panel-heading"><div><span className="eyebrow">FOOD DIARY</span><h2>Meal history <span className="count-pill">{filtered.length}</span></h2></div></div><div className="filters-row"><div className="search-box"><Search size={16} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search food..." /></div><select value={mealType} onChange={e => setMealType(e.target.value)} className="compact-select">{mealTypes.map(x => <option key={x}>{x}</option>)}</select></div>
      {filtered.length ? <div className="table-wrap"><table><thead><tr><th>Food</th><th>Quantity</th><th>Calories</th><th>Protein</th><th>Meal</th><th>Actions</th></tr></thead><tbody>{filtered.map(item => <tr key={item._id}><td><div className="primary-cell">{item.foodItem}<small>{formatDate(item.loggedAt)}</small></div></td><td>{item.quantity}</td><td>{item.calories} kcal</td><td>{item.protein} g</td><td><span className="category-tag">{item.mealType}</span></td><td><div className="row-actions"><button className="icon-btn" title="Edit" onClick={() => startEdit(item)}><Edit2 size={15} /></button><button className="icon-btn danger" title="Delete" onClick={() => remove(item)}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div> : <EmptyState title="No meals found" description="Log your food to build a more useful nutrition history." />}
    </section></div>
  </div>;
}
function Macro({ label, amount, unit, percent, color }) { return <div className="macro-card"><div className="macro-head"><span>{label}</span><span className={`macro-dot ${color}`} /></div><strong>{amount}</strong><small>{unit}</small><div className="progress-track"><span className={color} style={{ width: `${percent}%` }} /></div></div>; }

