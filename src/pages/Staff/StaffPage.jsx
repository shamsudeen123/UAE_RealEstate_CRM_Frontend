import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { formatDate } from '../../utils/helpers';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';

const ROLE_COLORS = {
  admin: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  agent: 'bg-brand-light text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  accountant: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
};

const INIT = { name: '', email: '', password: '', role: 'agent', branchId: 'HQ' };

export default function StaffPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INIT);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/auth/users');
      setUsers(data.users);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => { setForm(INIT); setEditId(null); setError(''); setShowForm(true); };
  const openEdit = (user) => {
    setForm({ name: user.name, email: user.email, password: '', role: user.role, branchId: user.branchId || 'HQ' });
    setEditId(user._id); setError(''); setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { ...form };
      if (editId && !payload.password) delete payload.password;
      if (editId) {
        await api.put(`/auth/users/${editId}`, payload);
      } else {
        await api.post('/auth/users', payload);
      }
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user');
    } finally { setSaving(false); }
  };

  const toggleActive = async (user) => {
    try {
      await api.put(`/auth/users/${user._id}`, { isActive: !user.isActive });
      fetchUsers();
    } catch (err) { console.error(err); }
  };

  const columns = [
    { key: 'name', label: 'Staff Member', render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-brand-gold flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {row.name?.charAt(0)}
        </div>
        <div>
          <p className="font-medium text-sm text-gray-800 dark:text-slate-200">{row.name}</p>
          <p className="text-xs text-gray-400 dark:text-slate-500">{row.email}</p>
        </div>
      </div>
    )},
    { key: 'role', label: 'Role', render: (row) => (
      <span className={`badge capitalize ${ROLE_COLORS[row.role] || ''}`}>{row.role}</span>
    )},
    { key: 'branchId', label: 'Branch', render: (row) => <span className="text-sm text-gray-600 dark:text-slate-400">{row.branchId}</span> },
    { key: 'isActive', label: 'Status', render: (row) => (
      <span className={`badge ${row.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400'}`}>
        {row.isActive ? 'Active' : 'Inactive'}
      </span>
    )},
    { key: 'createdAt', label: 'Joined', render: (row) => <span className="text-xs text-gray-400 dark:text-slate-500">{formatDate(row.createdAt)}</span> },
    { key: 'actions', label: '', render: (row) => (
      <div className="flex gap-2">
        <button onClick={() => openEdit(row)} className="btn btn-ghost btn-sm">✏️</button>
        <button
          onClick={() => toggleActive(row)}
          className={`btn btn-sm ${row.isActive ? 'btn-danger' : 'btn-secondary'}`}
        >
          {row.isActive ? 'Deactivate' : 'Activate'}
        </button>
      </div>
    )},
  ];

  return (
    <div className="space-y-5">
      <div className="section-header">
        <div>
          <h1 className="page-title">Staff Management</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">{users.length} users</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">+ Add Staff</button>
      </div>

      <div className="card overflow-hidden">
        <Table columns={columns} data={users} loading={loading} emptyMessage="No users found" />
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editId ? 'Edit Staff Member' : 'Add Staff Member'} size="md">
        {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="label">Full Name *</label>
            <input className="input" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="label">Email *</label>
            <input type="email" className="input" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="label">{editId ? 'New Password (leave blank to keep)' : 'Password *'}</label>
            <input type="password" className="input" required={!editId} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Minimum 6 characters" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">Role *</label>
              <select className="select" required value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                <option value="agent">Agent</option>
                <option value="accountant">Accountant</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label className="label">Branch</label>
              <input className="input" value={form.branchId} onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Saving…' : editId ? 'Save Changes' : 'Add Staff'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
