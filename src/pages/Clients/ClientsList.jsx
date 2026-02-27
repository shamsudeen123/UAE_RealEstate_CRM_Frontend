import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { formatAED, getClientTypeColor, EMIRATES } from '../../utils/helpers';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmModal from '../../components/common/ConfirmModal';
import WhatsAppModal from '../../components/common/WhatsAppModal';
import WhatsAppBulkModal from '../../components/common/WhatsAppBulkModal';

const LIMIT = 20;

const WA_ICON = (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current flex-shrink-0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.094.541 4.065 1.487 5.782L0 24l6.395-1.677A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.85 0-3.58-.5-5.07-1.37l-.36-.22-3.8.996.996-3.799-.23-.37A9.937 9.937 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
  </svg>
);

export default function ClientsList() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ clientType: '', preferredEmirate: '' });
  const [deleteId, setDeleteId] = useState(null);

  // WhatsApp
  const [waClient, setWaClient] = useState(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [showBulk, setShowBulk] = useState(false);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT, search, ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const { data } = await api.get('/clients', { params });
      setClients(data.clients);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, [page, filters, search]);

  const handleFilter = (key, val) => { setFilters((f) => ({ ...f, [key]: val })); setPage(1); };

  const handleDelete = async () => {
    try {
      await api.delete(`/clients/${deleteId}`);
      setDeleteId(null);
      fetchClients();
    } catch (err) { console.error(err); }
  };

  // Selection helpers
  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === clients.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(clients.map((c) => c._id)));
    }
  };

  const exitSelectMode = () => { setSelectMode(false); setSelected(new Set()); };

  const selectedClients = clients.filter((c) => selected.has(c._id));

  const columns = [
    // Checkbox column — only in select mode
    ...(selectMode ? [{
      key: '_select',
      label: (
        <input
          type="checkbox"
          checked={clients.length > 0 && selected.size === clients.length}
          onChange={toggleSelectAll}
          className="w-4 h-4 accent-brand-gold cursor-pointer"
        />
      ),
      render: (row) => (
        <input
          type="checkbox"
          checked={selected.has(row._id)}
          onChange={() => toggleSelect(row._id)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 accent-brand-gold cursor-pointer"
        />
      ),
    }] : []),
    {
      key: 'name', label: 'Client',
      render: (row) => (
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/clients/${row._id}`)}>
          <div className="w-9 h-9 rounded-full bg-brand-gold flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {row.name?.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-sm text-gray-800 dark:text-slate-200 hover:text-brand-gold transition">{row.name}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500">{row.nationality || '—'}</p>
          </div>
        </div>
      ),
    },
    { key: 'phone', label: 'Contact', render: (row) => (
      <div className="text-sm">
        <p className="text-gray-700 dark:text-slate-300">{row.phone || '—'}</p>
        <p className="text-xs text-gray-400 dark:text-slate-500">{row.email || ''}</p>
      </div>
    )},
    { key: 'clientType', label: 'Type', render: (row) => (
      <span className={`badge capitalize ${getClientTypeColor(row.clientType)}`}>{row.clientType}</span>
    )},
    { key: 'budget', label: 'Budget', render: (row) => (
      <div className="text-xs text-gray-500 dark:text-slate-400">
        {row.budgetMin || row.budgetMax ? (
          <span>{formatAED(row.budgetMin)} – {formatAED(row.budgetMax)}</span>
        ) : '—'}
      </div>
    )},
    { key: 'preferredEmirate', label: 'Prefers', render: (row) => (
      <span className="text-sm text-gray-600 dark:text-slate-400">{row.preferredEmirate || '—'}</span>
    )},
    // Agent column — disabled
    // { key: 'assignedAgent', label: 'Agent', render: (row) => <span className="text-sm text-gray-600 dark:text-slate-400">{row.assignedAgent?.name || '—'}</span> },
    { key: 'source', label: 'Source', render: (row) => (
      <span className="text-xs text-gray-400 dark:text-slate-500 capitalize">{row.source}</span>
    )},
    { key: 'actions', label: '', render: (row) => (
      <div className="flex items-center gap-1">
        {row.phone && (
          <button
            onClick={(e) => { e.stopPropagation(); setWaClient(row); }}
            className="btn btn-ghost btn-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
            title="WhatsApp"
          >
            {WA_ICON}
          </button>
        )}
        {can('admin', 'agent') && (
          <button onClick={(e) => { e.stopPropagation(); navigate(`/clients/${row._id}/edit`); }} className="btn btn-ghost btn-sm">✏️</button>
        )}
        {can('admin') && (
          <button onClick={(e) => { e.stopPropagation(); setDeleteId(row._id); }} className="btn btn-ghost btn-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">🗑️</button>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-5">
      <div className="section-header">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">{total} clients</p>
        </div>
        <div className="flex items-center gap-2">
          {selectMode ? (
            <>
              <span className="text-sm text-gray-600 dark:text-slate-400">{selected.size} selected</span>
              <button
                onClick={() => { if (selected.size > 0) setShowBulk(true); }}
                disabled={selected.size === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {WA_ICON} WhatsApp Broadcast
              </button>
              <button onClick={exitSelectMode} className="btn btn-secondary btn-sm">Cancel</button>
            </>
          ) : (
            <>
              <button
                onClick={() => setSelectMode(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-500 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 text-sm font-medium transition"
              >
                {WA_ICON} Broadcast
              </button>
              {can('admin', 'agent') && (
                <button onClick={() => navigate('/clients/new')} className="btn btn-primary">+ Add Client</button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            className="input" placeholder="Search name, email, phone…"
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <select className="select" value={filters.clientType} onChange={(e) => handleFilter('clientType', e.target.value)}>
            <option value="">All Types</option>
            <option value="buyer">Buyer</option>
            <option value="tenant">Tenant</option>
            <option value="investor">Investor</option>
            <option value="landlord">Landlord</option>
          </select>
          <select className="select" value={filters.preferredEmirate} onChange={(e) => handleFilter('preferredEmirate', e.target.value)}>
            <option value="">All Emirates</option>
            {EMIRATES.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <Table columns={columns} data={clients} loading={loading} emptyMessage="No clients found" />
      </div>

      <Pagination page={page} pages={pages} total={total} limit={LIMIT} onPage={setPage} />

      <ConfirmModal
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        message="This client will be permanently deleted."
      />

      <WhatsAppModal
        isOpen={!!waClient}
        onClose={() => setWaClient(null)}
        client={waClient}
      />

      <WhatsAppBulkModal
        isOpen={showBulk}
        onClose={() => setShowBulk(false)}
        clients={selectedClients}
      />
    </div>
  );
}
