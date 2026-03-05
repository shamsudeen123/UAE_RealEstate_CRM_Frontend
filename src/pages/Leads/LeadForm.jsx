import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import { LEAD_SOURCES, LEAD_STATUSES } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const INIT = {
  client: '', property: '', source: 'other', status: 'new',
  notes: '', /* assignedAgent: '', */ followUpDate: '',
};

const STATUS_LABELS = {
  new: 'New', contacted: 'Contacted', qualified: 'Qualified',
  viewing: 'Viewing', negotiation: 'Negotiation', closed: 'Closed', lost: 'Lost',
};

const F = ({ label, children }) => (
  <div className="form-group"><label className="label">{label}</label>{children}</div>
);

export default function LeadForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({ ...INIT, property: searchParams.get('property') || '' });
  const [clients, setClients] = useState([]);
  const [properties, setProperties] = useState([]);
  // const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/clients', { params: { limit: 200 } }),
      api.get('/properties', { params: { limit: 500 } }),
      // api.get('/auth/users'),
    ]).then(([c, p]) => {
      setClients(c.data.clients);
      setProperties(p.data.properties);
      // setAgents(u.data.users.filter((x) => x.role === 'agent' || x.role === 'admin'));
    }).catch(() => {});

    if (isEdit) {
      api.get(`/leads/${id}`).then(({ data }) => {
        const l = data.lead;
        setForm({
          client: l.client?._id || '', property: l.property?._id || '',
          source: l.source || 'other', status: l.status || 'new',
          notes: l.notes || '', /* assignedAgent: l.assignedAgent?._id || '', */
          followUpDate: l.followUpDate ? l.followUpDate.split('T')[0] : '',
        });
        setLoading(false);
      });
    }
  }, [id, isEdit]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        property: form.property || undefined,
        // assignedAgent: form.assignedAgent || undefined,
        followUpDate: form.followUpDate || undefined,
      };
      if (isEdit) {
        await api.put(`/leads/${id}`, payload);
      } else {
        await api.post('/leads', payload);
      }
      navigate('/leads');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save lead');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="section-header">
        <h1 className="page-title">{isEdit ? 'Edit Lead' : 'Add Lead'}</h1>
        <button onClick={() => navigate('/leads')} className="btn btn-secondary btn-sm">← Back</button>
      </div>

      {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <F label="Client *">
          <select className="select" required value={form.client} onChange={(e) => set('client', e.target.value)}>
            <option value="">Select client…</option>
            {clients.map((c) => <option key={c._id} value={c._id}>{c.name} — {c.phone || c.email}</option>)}
          </select>
        </F>
        <F label="Property Interest">
          <select className="select" value={form.property} onChange={(e) => set('property', e.target.value)}>
            <option value="">Any / Not specified</option>
            {properties.map((p) => <option key={p._id} value={p._id}>{p.title} — {p.emirate}</option>)}
          </select>
        </F>
        <div className="grid grid-cols-2 gap-4">
          <F label="Source">
            <select className="select" value={form.source} onChange={(e) => set('source', e.target.value)}>
              {LEAD_SOURCES.map((s) => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </F>
          <F label="Status">
            <select className="select" value={form.status} onChange={(e) => set('status', e.target.value)}>
              {LEAD_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </F>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {/* Assigned Agent — disabled
          <F label="Assigned Agent">
            <select className="select" value={form.assignedAgent} onChange={(e) => set('assignedAgent', e.target.value)}>
              <option value="">Select agent…</option>
              {agents.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
            </select>
          </F> */}
          <F label="Follow Up Date">
            <input type="date" className="input" value={form.followUpDate} onChange={(e) => set('followUpDate', e.target.value)} />
          </F>
        </div>
        <F label="Notes">
          <textarea className="input" rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Lead notes..." />
        </F>
        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={() => navigate('/leads')} className="btn btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Lead'}
          </button>
        </div>
      </form>
    </div>
  );
}
