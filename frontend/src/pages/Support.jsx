import React from 'react';
import { useEffect, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import api from '../api';
import { formatDate, getError } from '../utils';
import { Alert, EmptyState, PageTitle } from '../components/UI';

export default function Support() {
  const [items, setItems] = useState([]); const [form, setForm] = useState({ subject: '', message: '' }); const [error, setError] = useState(''); const [success, setSuccess] = useState(''); const [busy, setBusy] = useState(false);
  const load = async () => { try { const { data } = await api.get('/support'); setItems(data); } catch (e) { setError(getError(e, 'Could not load support messages.')); } };
  useEffect(() => { load(); }, []);
  async function submit(e) { e.preventDefault(); setBusy(true); setError(''); setSuccess(''); try { const { data } = await api.post('/support', form); setItems(old => [data, ...old]); setForm({ subject: '', message: '' }); setSuccess('Your support request has been submitted.'); } catch (e2) { setError(getError(e2, 'Could not submit support request.')); } finally { setBusy(false); } }
  return <div className="page-content"><PageTitle eyebrow="WE'RE HERE TO HELP" title="Support & feedback" description="Send us a question, report an issue or share feedback." />{error && <Alert>{error}</Alert>}{success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}
    <div className="dashboard-grid"><section className="panel form-panel"><div className="panel-heading"><div><span className="eyebrow">CONTACT COâ€‹â€‹REX</span><h2>New request</h2></div><div className="panel-symbol"><MessageCircle size={18} /></div></div><form className="form-stack" onSubmit={submit}><label>Subject<input value={form.subject} onChange={e => setForm(old => ({ ...old, subject: e.target.value }))} placeholder="What can we help with?" maxLength={120} required /></label><label>Message<textarea rows="6" value={form.message} onChange={e => setForm(old => ({ ...old, message: e.target.value }))} placeholder="Tell us more..." maxLength={3000} required /></label><button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Sending...' : <><Send size={16} /> Send request</>}</button></form></section>
    <section className="panel"><div className="panel-heading"><div><span className="eyebrow">YOUR CONVERSATIONS</span><h2>Support history</h2></div><span className="count-pill">{items.length}</span></div>{items.length ? <div className="support-list">{items.map(item => <article key={item._id} className="support-card"><div className="support-card-head"><div><h3>{item.subject}</h3><small>{formatDate(item.createdAt)}</small></div><span className={`status-badge ${item.status.toLowerCase().replace(' ', '-')}`}>{item.status}</span></div><p>{item.message}</p>{item.adminReply && <div className="admin-reply"><strong>CoreX team reply</strong><p>{item.adminReply}</p></div>}</article>)}</div> : <EmptyState title="No support requests" description="Anything you send will appear here." />}</section></div>
  </div>;
}

