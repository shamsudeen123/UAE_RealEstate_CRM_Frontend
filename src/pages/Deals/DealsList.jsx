import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { formatAED, formatDate, getDealTypeColor } from '../../utils/helpers';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmModal from '../../components/common/ConfirmModal';
import WhatsAppModal from '../../components/common/WhatsAppModal';

const WA_ICON = (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current flex-shrink-0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.094.541 4.065 1.487 5.782L0 24l6.395-1.677A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.85 0-3.58-.5-5.07-1.37l-.36-.22-3.8.996.996-3.799-.23-.37A9.937 9.937 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
  </svg>
);

const LIMIT = 20;

export default function DealsList() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const [deals, setDeals] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [waClient, setWaClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useState({ dealType: '', status: '' });

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT, ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const { data } = await api.get('/deals', { params });
      setDeals(data.deals);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDeals(); }, [page, filters]);

  const handleFilter = (key, val) => { setFilters((f) => ({ ...f, [key]: val })); setPage(1); };

  const handleDelete = async () => {
    try {
      await api.delete(`/deals/${deleteId}`);
      setDeleteId(null);
      fetchDeals();
    } catch (err) { console.error(err); }
  };

  const columns = [
    { key: 'property', label: 'Property', render: (row) => (
      <div className="cursor-pointer" onClick={() => navigate(`/deals/${row._id}`)}>
        <p className="font-medium text-sm text-gray-800 dark:text-slate-200 hover:text-brand-gold transition truncate max-w-[180px]">
          {row.property?.title || '—'}
        </p>
        <p className="text-xs text-gray-400 dark:text-slate-500">{row.property?.emirate}</p>
      </div>
    )},
    { key: 'client', label: 'Client', render: (row) => (
      <div>
        <p className="text-sm text-gray-700 dark:text-slate-300">{row.client?.name || '—'}</p>
        <p className="text-xs text-gray-400 dark:text-slate-500">{row.client?.phone}</p>
      </div>
    )},
    { key: 'dealType', label: 'Type', render: (row) => (
      <span className={`badge capitalize ${getDealTypeColor(row.dealType)}`}>{row.dealType}</span>
    )},
    { key: 'agreedPrice', label: 'Deal Value', render: (row) => (
      <div>
        <p className="font-semibold text-brand-gold text-sm">{formatAED(row.agreedPrice)}</p>
        <p className="text-xs text-gray-400 dark:text-slate-500">Commission: {formatAED(row.commissionAmount)}</p>
      </div>
    )},
    // { key: 'agent', label: 'Agent', render: (row) => (
    //   <span className="text-sm text-gray-600 dark:text-slate-400">{row.agent?.name || '—'}</span>
    // )},
    { key: 'status', label: 'Status', render: (row) => <Badge status={row.status} /> },
    { key: 'dealDate', label: 'Date', render: (row) => (
      <span className="text-xs text-gray-400 dark:text-slate-500">{formatDate(row.dealDate)}</span>
    )},
    { key: 'actions', label: '', render: (row) => (
      <div className="flex items-center gap-1">
        {row.client?.phone && (
          <button
            onClick={(e) => { e.stopPropagation(); setWaClient({ name: row.client?.name, phone: row.client?.phone }); }}
            className="btn btn-ghost btn-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
            title="WhatsApp"
          >
            {WA_ICON}
          </button>
        )}
        {can('admin', 'agent') && (
          <button onClick={(e) => { e.stopPropagation(); navigate(`/deals/${row._id}/edit`); }} className="btn btn-ghost btn-sm">✏️</button>
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
          <h1 className="page-title">Deals</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">{total} deals</p>
        </div>
        {can('admin', 'agent') && (
          <button onClick={() => navigate('/deals/new')} className="btn btn-primary">+ New Deal</button>
        )}
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-2 gap-3">
          <select className="select" value={filters.dealType} onChange={(e) => handleFilter('dealType', e.target.value)}>
            <option value="">All Types</option>
            <option value="sale">Sale</option>
            <option value="rent">Rent</option>
            <option value="renewal">Renewal</option>
          </select>
          <select className="select" value={filters.status} onChange={(e) => handleFilter('status', e.target.value)}>
            <option value="">All Statuses</option>
            <option value="in-progress">In Progress</option>
            <option value="pending-docs">Pending Docs</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <Table columns={columns} data={deals} loading={loading} emptyMessage="No deals found" />
      </div>

      <Pagination page={page} pages={pages} total={total} limit={LIMIT} onPage={setPage} />

      <ConfirmModal
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        message="This deal will be permanently deleted."
      />

      <WhatsAppModal
        isOpen={!!waClient}
        onClose={() => setWaClient(null)}
        client={waClient}
      />
    </div>
  );
}
