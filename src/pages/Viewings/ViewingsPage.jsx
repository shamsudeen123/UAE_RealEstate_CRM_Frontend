import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import { formatDateTime, formatDate } from '../../utils/helpers';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useAuth } from '../../contexts/AuthContext';

const LIMIT = 20;

const STATUS_OPTIONS = ['scheduled', 'completed', 'cancelled', 'no-show'];
const BLANK_FORM = { property: '', client: '', scheduledAt: '', feedback: '', status: 'scheduled' };

export default function ViewingsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { can } = useAuth();
  const [viewings, setViewings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useState({ status: '' });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...BLANK_FORM, property: searchParams.get('property') || '' });
  const [properties, setProperties] = useState([]);
  const [clients, setClients] = useState([]);
  // const [agents, setAgents] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchViewings = async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT, ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const { data } = await api.get('/viewings', { params });
      setViewings(data.viewings);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchViewings(); }, [page, filters]);

  useEffect(() => {
    Promise.all([
      api.get('/properties', { params: { limit: 500 } }),
      api.get('/clients', { params: { limit: 200 } }),
      // api.get('/auth/users'),
    ]).then(([p, c]) => {
      setProperties(p.data.properties);
      setClients(c.data.clients);
      // setAgents(u.data.users.filter((x) => x.role === 'agent' || x.role === 'admin'));
    }).catch(() => {});

    if (searchParams.get('property')) setShowForm(true);
  }, []);

  const handleCloseForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm(BLANK_FORM);
  };

  const handleEditClick = (row) => {
    setEditId(row._id);
    setForm({
      property: row.property?._id || '',
      client: row.client?._id || '',
      scheduledAt: row.scheduledAt ? new Date(row.scheduledAt).toISOString().slice(0, 16) : '',
      feedback: row.feedback || '',
      status: row.status || 'scheduled',
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/viewings/${deleteId}`);
      setDeleteId(null);
      fetchViewings();
    } catch (err) { console.error(err); }
  };

  const handleStatusChange = async (viewingId, newStatus) => {
    try {
      await api.put(`/viewings/${viewingId}`, { status: newStatus });
      setViewings((prev) => prev.map((v) => v._id === viewingId ? { ...v, status: newStatus } : v));
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form /*, agent: form.agent || undefined */ };
      if (editId) {
        await api.put(`/viewings/${editId}`, payload);
      } else {
        await api.post('/viewings', payload);
      }
      handleCloseForm();
      fetchViewings();
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const columns = [
    { key: 'property', label: 'Property', render: (row) => (
      <div>
        <p className="font-medium text-sm text-gray-800 dark:text-slate-200 truncate max-w-[160px]">{row.property?.title || '—'}</p>
        <p className="text-xs text-gray-400 dark:text-slate-500">{row.property?.emirate}</p>
      </div>
    )},
    { key: 'client', label: 'Client', render: (row) => (
      <div>
        <p className="text-sm text-gray-700 dark:text-slate-300">{row.client?.name || '—'}</p>
        <p className="text-xs text-gray-400 dark:text-slate-500">{row.client?.phone}</p>
      </div>
    )},
    // { key: 'agent', label: 'Agent', render: (row) => <span className="text-sm text-gray-600 dark:text-slate-400">{row.agent?.name || '—'}</span> },
    { key: 'scheduledAt', label: 'Scheduled', render: (row) => <span className="text-sm text-gray-700 dark:text-slate-300">{formatDateTime(row.scheduledAt)}</span> },
    { key: 'status', label: 'Status', render: (row) => (
      <select
        value={row.status}
        onChange={(e) => handleStatusChange(row._id, e.target.value)}
        className="text-xs border border-gray-200 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300"
      >
        {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
      </select>
    )},
    { key: 'feedback', label: 'Feedback', render: (row) => (
      <p className="text-xs text-gray-400 dark:text-slate-500 truncate max-w-[140px]">{row.feedback || '—'}</p>
    )},
    { key: 'actions', label: '', render: (row) => can('admin', 'agent') && (
      <div className="flex items-center gap-1">
        <button onClick={() => handleEditClick(row)} className="btn btn-ghost btn-sm">✏️</button>
        <button onClick={() => setDeleteId(row._id)} className="btn btn-ghost btn-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">🗑️</button>
      </div>
    )},
  ];

  return (
    <div className="space-y-5">
      <div className="section-header">
        <div>
          <h1 className="page-title">Viewings</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">{total} viewings</p>
        </div>
        <button onClick={() => { setEditId(null); setForm(BLANK_FORM); setShowForm(true); }} className="btn btn-primary">+ Schedule Viewing</button>
      </div>

      <div className="card p-4">
        <select className="select max-w-xs" value={filters.status} onChange={(e) => { setFilters({ status: e.target.value }); setPage(1); }}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <Table columns={columns} data={viewings} loading={loading} emptyMessage="No viewings scheduled" />
      </div>

      <Pagination page={page} pages={pages} total={total} limit={LIMIT} onPage={setPage} />

      {/* Schedule / Edit Viewing Modal */}
      <Modal isOpen={showForm} onClose={handleCloseForm} title={editId ? 'Edit Viewing' : 'Schedule Viewing'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="label">Property *</label>
            <select className="select" required value={form.property} onChange={(e) => setForm((f) => ({ ...f, property: e.target.value }))}>
              <option value="">Select property…</option>
              {properties.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Client *</label>
            <select className="select" required value={form.client} onChange={(e) => setForm((f) => ({ ...f, client: e.target.value }))}>
              <option value="">Select client…</option>
              {clients.map((c) => <option key={c._id} value={c._id}>{c.name} — {c.phone || ''}</option>)}
            </select>
          </div>
          {/* Agent — disabled
          <div className="form-group">
            <label className="label">Agent</label>
            <select className="select" value={form.agent} onChange={(e) => setForm((f) => ({ ...f, agent: e.target.value }))}>
              <option value="">Select agent…</option>
              {agents.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
            </select>
          </div> */}
          <div className="form-group">
            <label className="label">Date & Time *</label>
            <input type="datetime-local" className="input" required value={form.scheduledAt} onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))} />
          </div>
          {editId && (
            <div className="form-group">
              <label className="label">Status</label>
              <select className="select" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          )}
          <div className="form-group">
            <label className="label">Feedback / Notes</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Optional notes or feedback…"
              value={form.feedback}
              onChange={(e) => setForm((f) => ({ ...f, feedback: e.target.value }))}
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={handleCloseForm} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {editId ? (saving ? 'Saving…' : 'Save Changes') : (saving ? 'Scheduling…' : 'Schedule')}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        message="This viewing will be permanently deleted."
      />
    </div>
  );
}
