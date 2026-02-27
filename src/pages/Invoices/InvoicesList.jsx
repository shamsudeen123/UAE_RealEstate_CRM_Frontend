import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { formatAED, formatDate } from '../../utils/helpers';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../contexts/AuthContext';

const LIMIT = 20;

export default function InvoicesList() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useState({ invoiceStatus: '' });

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT, ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const { data } = await api.get('/invoices', { params });
      setInvoices(data.invoices);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchInvoices(); }, [page, filters]);

  const columns = [
    { key: 'invoiceNo', label: 'Invoice #', render: (row) => (
      <button onClick={() => navigate(`/invoices/${row._id}`)} className="font-mono text-sm font-semibold text-brand-gold hover:underline">
        {row.invoiceNo}
      </button>
    )},
    { key: 'client', label: 'Client', render: (row) => (
      <div>
        <p className="text-sm text-gray-800 dark:text-slate-200">{row.client?.name || '—'}</p>
        <p className="text-xs text-gray-400 dark:text-slate-500">{row.client?.phone}</p>
      </div>
    )},
    { key: 'deal', label: 'Deal', render: (row) => (
      <span className="text-xs text-gray-500 dark:text-slate-400 capitalize">{row.deal?.dealType || 'General'}</span>
    )},
    { key: 'grandTotal', label: 'Total', render: (row) => <span className="font-semibold text-sm text-brand-gold">{formatAED(row.grandTotal)}</span> },
    { key: 'paidAmount', label: 'Paid', render: (row) => <span className="text-sm text-gray-600 dark:text-slate-400">{formatAED(row.paidAmount)}</span> },
    { key: 'invoiceStatus', label: 'Status', render: (row) => <Badge status={row.invoiceStatus} /> },
    { key: 'createdAt', label: 'Date', render: (row) => <span className="text-xs text-gray-400 dark:text-slate-500">{formatDate(row.createdAt)}</span> },
    { key: 'actions', label: '', render: (row) => (
      <button onClick={() => navigate(`/invoices/${row._id}`)} className="btn btn-ghost btn-sm">👁️</button>
    )},
  ];

  return (
    <div className="space-y-5">
      <div className="section-header">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">{total} invoices</p>
        </div>
      </div>

      <div className="card p-4">
        <select className="select max-w-[200px]" value={filters.invoiceStatus} onChange={(e) => { setFilters({ invoiceStatus: e.target.value }); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="unpaid">Unpaid</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <Table columns={columns} data={invoices} loading={loading} emptyMessage="No invoices found" />
      </div>

      <Pagination page={page} pages={pages} total={total} limit={LIMIT} onPage={setPage} />
    </div>
  );
}
