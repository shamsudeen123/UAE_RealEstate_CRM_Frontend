import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { EMIRATES, PROPERTY_TYPES, LEAD_SOURCES } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const INIT = {
  name: '', email: '', phone: '', nationality: '',
  clientType: 'buyer', budgetMin: '', budgetMax: '',
  preferredType: '', preferredEmirate: '', /* assignedAgent: '', */
  source: 'other', notes: '',
};

const F = ({ label, children }) => (
  <div className="form-group">
    <label className="label">{label}</label>
    {children}
  </div>
);

export default function ClientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(INIT);
  // const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // api.get('/auth/users').then(({ data }) => {
    //   setAgents(data.users.filter((u) => u.role === 'agent' || u.role === 'admin'));
    // }).catch(() => {});

    if (isEdit) {
      api.get(`/clients/${id}`).then(({ data }) => {
        const c = data.client;
        setForm({
          name: c.name || '', email: c.email || '', phone: c.phone || '',
          nationality: c.nationality || '', clientType: c.clientType || 'buyer',
          budgetMin: c.budgetMin || '', budgetMax: c.budgetMax || '',
          preferredType: c.preferredType || '', preferredEmirate: c.preferredEmirate || '',
          /* assignedAgent: c.assignedAgent?._id || '', */ source: c.source || 'other', notes: c.notes || '',
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
        budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
        budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
        // assignedAgent: form.assignedAgent || undefined,
        preferredType: form.preferredType || undefined,
        preferredEmirate: form.preferredEmirate || undefined,
      };
      if (isEdit) {
        await api.put(`/clients/${id}`, payload);
      } else {
        await api.post('/clients', payload);
      }
      navigate('/clients');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save client');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="section-header">
        <h1 className="page-title">{isEdit ? 'Edit Client' : 'Add Client'}</h1>
        <button onClick={() => navigate('/clients')} className="btn btn-secondary btn-sm">← Back</button>
      </div>

      {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-700 dark:text-slate-300">Personal Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <F label="Full Name *">
              <input className="input" required value={form.name} onChange={(e) => set('name', e.target.value)} />
            </F>
            <F label="Nationality">
              <input className="input" value={form.nationality} onChange={(e) => set('nationality', e.target.value)} placeholder="e.g. British, Indian" />
            </F>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <F label="Phone">
              <input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+971 50 123 4567" />
            </F>
            <F label="Email">
              <input type="email" className="input" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </F>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <F label="Client Type">
              <select className="select" value={form.clientType} onChange={(e) => set('clientType', e.target.value)}>
                <option value="buyer">Buyer</option>
                <option value="tenant">Tenant</option>
                <option value="investor">Investor</option>
                <option value="landlord">Landlord</option>
              </select>
            </F>
            <F label="Source">
              <select className="select" value={form.source} onChange={(e) => set('source', e.target.value)}>
                {LEAD_SOURCES.map((s) => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </F>
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-700 dark:text-slate-300">Preferences & Budget</h2>
          <div className="grid grid-cols-2 gap-4">
            <F label="Budget Min (AED)">
              <input type="number" className="input" min={0} value={form.budgetMin} onChange={(e) => set('budgetMin', e.target.value)} placeholder="0" />
            </F>
            <F label="Budget Max (AED)">
              <input type="number" className="input" min={0} value={form.budgetMax} onChange={(e) => set('budgetMax', e.target.value)} placeholder="0" />
            </F>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <F label="Preferred Property Type">
              <select className="select" value={form.preferredType} onChange={(e) => set('preferredType', e.target.value)}>
                <option value="">Any</option>
                {PROPERTY_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </F>
            <F label="Preferred Emirate">
              <select className="select" value={form.preferredEmirate} onChange={(e) => set('preferredEmirate', e.target.value)}>
                <option value="">Any</option>
                {EMIRATES.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </F>
          </div>
        </div>

        <div className="card p-5 space-y-4">
          {/* Assignment — disabled
          <h2 className="font-semibold text-gray-700 dark:text-slate-300">Assignment</h2>
          <F label="Assigned Agent">
            <select className="select" value={form.assignedAgent} onChange={(e) => set('assignedAgent', e.target.value)}>
              <option value="">Select agent…</option>
              {agents.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
            </select>
          </F> */}
          <F label="Notes">
            <textarea className="input" rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Client notes..." />
          </F>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate('/clients')} className="btn btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Client'}
          </button>
        </div>
      </form>
    </div>
  );
}
