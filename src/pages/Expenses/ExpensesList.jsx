import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { formatAED, formatDate } from '../../utils/helpers';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useAuth } from '../../contexts/AuthContext';

const LIMIT = 20;
const CATEGORIES = ['marketing', 'maintenance', 'office', 'staff', 'utilities', 'other'];

export default function ExpensesList() {
  const { can } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [totalAmount, setTotalAmount] = useState(0);
  const [filters, setFilters] = useState({ category: '' });
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ category: 'marketing', amount: '', description: '', vendor: '', date: new Date().toISOString().split('T')[0] });
  const [saving, setSaving] = useState(false);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT, ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const { data } = await api.get('/expenses', { params });
      setExpenses(data.expenses);
      setTotal(data.total);
      setPages(data.pages);
      setTotalAmount(data.totalAmount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, [page, filters]);

  const handleDelete = async () => {
    try {
      await api.delete(`/expenses/${deleteId}`);
      setDeleteId(null);
      fetchExpenses();
    } catch (err) { console.error(err); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/expenses', { ...form, amount: Number(form.amount) });
      setShowForm(false);
      setForm({ category: 'marketing', amount: '', description: '', vendor: '', date: new Date().toISOString().split('T')[0] });
      fetchExpenses();
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const columns = [
    { key: 'date', label: 'Date', render: (row) => <span className="text-sm text-gray-600 dark:text-slate-400">{formatDate(row.date)}</span> },
    { key: 'category', label: 'Category', render: (row) => (
      <span className="badge bg-brand-light text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 capitalize">{row.category}</span>
    )},
    { key: 'description', label: 'Description', render: (row) => <span className="text-sm text-gray-700 dark:text-slate-300">{row.description || '—'}</span> },
    { key: 'vendor', label: 'Vendor', render: (row) => <span className="text-sm text-gray-600 dark:text-slate-400">{row.vendor || '—'}</span> },
    { key: 'amount', label: 'Amount', render: (row) => <span className="font-semibold text-brand-gold">{formatAED(row.amount)}</span> },
    { key: 'createdBy', label: 'By', render: (row) => <span className="text-xs text-gray-400 dark:text-slate-500">{row.createdBy?.name}</span> },
    { key: 'actions', label: '', render: (row) => can('admin') && (
      <button onClick={() => setDeleteId(row._id)} className="btn btn-ghost btn-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">🗑️</button>
    )},
  ];

  return (
    <div className="space-y-5">
      <div className="section-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">{total} records</p>
        </div>
        {can('admin', 'accountant') && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary">+ Add Expense</button>
        )}
      </div>

      {/* Total summary */}
      <div className="card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <select className="select max-w-[180px]" value={filters.category} onChange={(e) => { setFilters({ category: e.target.value }); setPage(1); }}>
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 dark:text-slate-500">Total (filtered)</p>
          <p className="text-xl font-bold text-brand-gold">{formatAED(totalAmount)}</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <Table columns={columns} data={expenses} loading={loading} emptyMessage="No expenses found" />
      </div>

      <Pagination page={page} pages={pages} total={total} limit={LIMIT} onPage={setPage} />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Expense" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">Category *</label>
              <select className="select" required value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Amount (AED) *</label>
              <input type="number" className="input" required min={0} value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0" />
            </div>
          </div>
          <div className="form-group">
            <label className="label">Description</label>
            <input className="input" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">Vendor</label>
              <input className="input" value={form.vendor} onChange={(e) => setForm((f) => ({ ...f, vendor: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="label">Date</label>
              <input type="date" className="input" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Saving…' : 'Add Expense'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        message="This expense will be permanently deleted."
      />
    </div>
  );
}
