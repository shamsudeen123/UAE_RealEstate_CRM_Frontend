import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { formatAED } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const INIT = {
  dealType: 'sale', property: '', client: '', /* agent: '', */
  status: 'in-progress', listingPrice: '', agreedPrice: '',
  commissionRate: 2, paymentMethod: 'cash',
  dealDate: new Date().toISOString().split('T')[0], handoverDate: '', notes: '',
};

const F = ({ label, children }) => (
  <div className="form-group"><label className="label">{label}</label>{children}</div>
);

export default function DealForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(INIT);
  const [properties, setProperties] = useState([]);
  const [clients, setClients] = useState([]);
  // const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const commission = form.agreedPrice && form.commissionRate
    ? (Number(form.agreedPrice) * Number(form.commissionRate)) / 100
    : 0;

  useEffect(() => {
    Promise.all([
      api.get('/properties', { params: { limit: 200 } }),
      api.get('/clients', { params: { limit: 200 } }),
      // api.get('/auth/users'),
    ]).then(([p, c]) => {
      setProperties(p.data.properties);
      setClients(c.data.clients);
      // setAgents(u.data.users.filter((x) => x.role === 'agent' || x.role === 'admin'));
    }).catch(() => {});

    if (isEdit) {
      api.get(`/deals/${id}`).then(({ data }) => {
        const d = data.deal;
        setForm({
          dealType: d.dealType || 'sale', property: d.property?._id || '',
          client: d.client?._id || '', /* agent: d.agent?._id || '', */
          status: d.status || 'in-progress',
          listingPrice: d.listingPrice || '', agreedPrice: d.agreedPrice || '',
          commissionRate: d.commissionRate ?? 2, paymentMethod: d.paymentMethod || 'cash',
          dealDate: d.dealDate ? d.dealDate.split('T')[0] : '',
          handoverDate: d.handoverDate ? d.handoverDate.split('T')[0] : '',
          notes: d.notes || '',
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
        listingPrice: Number(form.listingPrice),
        agreedPrice: Number(form.agreedPrice),
        commissionRate: Number(form.commissionRate),
        // agent: form.agent || undefined,
        handoverDate: form.handoverDate || undefined,
      };
      if (isEdit) {
        await api.put(`/deals/${id}`, payload);
      } else {
        await api.post('/deals', payload);
      }
      navigate('/deals');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save deal');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="section-header">
        <h1 className="page-title">{isEdit ? 'Edit Deal' : 'New Deal'}</h1>
        <button onClick={() => navigate('/deals')} className="btn btn-secondary btn-sm">← Back</button>
      </div>

      {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-700 dark:text-slate-300">Deal Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <F label="Deal Type *">
              <select className="select" required value={form.dealType} onChange={(e) => set('dealType', e.target.value)}>
                <option value="sale">Sale</option>
                <option value="rent">Rent</option>
                <option value="renewal">Renewal</option>
              </select>
            </F>
            <F label="Status">
              <select className="select" value={form.status} onChange={(e) => set('status', e.target.value)}>
                <option value="in-progress">In Progress</option>
                <option value="pending-docs">Pending Docs</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </F>
          </div>
          <F label="Property *">
            <select className="select" required value={form.property} onChange={(e) => set('property', e.target.value)}>
              <option value="">Select property…</option>
              {properties.map((p) => <option key={p._id} value={p._id}>{p.title} — {p.emirate}</option>)}
            </select>
          </F>
          <F label="Client *">
            <select className="select" required value={form.client} onChange={(e) => set('client', e.target.value)}>
              <option value="">Select client…</option>
              {clients.map((c) => <option key={c._id} value={c._id}>{c.name} — {c.phone || c.email}</option>)}
            </select>
          </F>
          {/* Assigned Agent — disabled
          <F label="Assigned Agent">
            <select className="select" value={form.agent} onChange={(e) => set('agent', e.target.value)}>
              <option value="">Select agent…</option>
              {agents.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
            </select>
          </F> */}
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-700 dark:text-slate-300">Financials</h2>
          <div className="grid grid-cols-2 gap-4">
            <F label="Listing Price (AED) *">
              <input type="number" className="input" required min={0} value={form.listingPrice} onChange={(e) => set('listingPrice', e.target.value)} placeholder="0" />
            </F>
            <F label="Agreed Price (AED) *">
              <input type="number" className="input" required min={0} value={form.agreedPrice} onChange={(e) => set('agreedPrice', e.target.value)} placeholder="0" />
            </F>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <F label="Commission Rate (%)">
              <input type="number" className="input" min={0} max={100} step={0.1} value={form.commissionRate} onChange={(e) => set('commissionRate', e.target.value)} />
            </F>
            <F label="Payment Method">
              <select className="select" value={form.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value)}>
                <option value="cash">Cash</option>
                <option value="mortgage">Mortgage</option>
                <option value="installment">Installment</option>
                <option value="cheque">Cheque</option>
              </select>
            </F>
          </div>
          {commission > 0 && (
            <div className="p-3 bg-brand-light/40 dark:bg-amber-900/20 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                💰 Commission: <strong>{formatAED(commission)}</strong>
                {' '}({form.commissionRate}% of {formatAED(Number(form.agreedPrice))})
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <F label="Deal Date">
              <input type="date" className="input" value={form.dealDate} onChange={(e) => set('dealDate', e.target.value)} />
            </F>
            <F label="Handover Date">
              <input type="date" className="input" value={form.handoverDate} onChange={(e) => set('handoverDate', e.target.value)} />
            </F>
          </div>
        </div>

        <div className="card p-5">
          <F label="Notes">
            <textarea className="input" rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Deal notes..." />
          </F>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate('/deals')} className="btn btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Deal'}
          </button>
        </div>
      </form>
    </div>
  );
}
