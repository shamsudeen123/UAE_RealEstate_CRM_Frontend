import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { formatDate, LEAD_STATUSES, getStatusColor } from '../../utils/helpers';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmModal from '../../components/common/ConfirmModal';
import WhatsAppModal from '../../components/common/WhatsAppModal';

const WA_ICON = (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current flex-shrink-0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.094.541 4.065 1.487 5.782L0 24l6.395-1.677A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.85 0-3.58-.5-5.07-1.37l-.36-.22-3.8.996.996-3.799-.23-.37A9.937 9.937 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
  </svg>
);

const STATUS_LABELS = {
  new: 'New', contacted: 'Contacted', qualified: 'Qualified',
  viewing: 'Viewing', negotiation: 'Negotiation', closed: 'Closed', lost: 'Lost',
};

const LIMIT = 50;

function PipelineBoard({ leads, onStatusChange }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {LEAD_STATUSES.map((status) => {
        const cards = leads.filter((l) => l.status === status);
        return (
          <div key={status} className="pipeline-column">
            <div className="flex items-center justify-between mb-2">
              <span className={`badge ${getStatusColor(status)}`}>{STATUS_LABELS[status]}</span>
              <span className="text-xs text-gray-400 dark:text-slate-500">{cards.length}</span>
            </div>
            {cards.length === 0 ? (
              <div className="h-20 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-gray-300 dark:text-slate-600 text-xs">
                Empty
              </div>
            ) : (
              cards.map((lead) => (
                <div key={lead._id} className="card p-3 hover:shadow-md transition-shadow">
                  <p className="font-medium text-sm text-gray-800 dark:text-slate-200 mb-1 truncate">
                    {lead.client?.name || 'Unknown Client'}
                  </p>
                  {lead.property && (
                    <p className="text-xs text-gray-400 dark:text-slate-500 mb-2 truncate">
                      🏢 {lead.property.title}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 dark:text-slate-500 capitalize">{lead.source}</span>
                    <select
                      value={lead.status}
                      onChange={(e) => onStatusChange(lead._id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs border border-gray-200 dark:border-slate-600 rounded px-1 py-0.5 bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300"
                    >
                      {LEAD_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                  </div>
                  {lead.followUpDate && (
                    <p className="text-xs text-brand-gold mt-1.5">📅 Follow up: {formatDate(lead.followUpDate)}</p>
                  )}
                </div>
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function LeadsPage() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('kanban');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useState({ status: '', source: '' });
  const [deleteId, setDeleteId] = useState(null);
  const [waClient, setWaClient] = useState(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT, ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const { data } = await api.get('/leads', { params });
      setLeads(data.leads);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, [page, filters]);

  const handleFilter = (key, val) => { setFilters((f) => ({ ...f, [key]: val })); setPage(1); };

  const handleDelete = async () => {
    try {
      await api.delete(`/leads/${deleteId}`);
      setDeleteId(null);
      fetchLeads();
    } catch (err) { console.error(err); }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await api.put(`/leads/${leadId}`, { status: newStatus });
      setLeads((prev) => prev.map((l) => l._id === leadId ? { ...l, status: newStatus } : l));
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { key: 'client', label: 'Client', render: (row) => (
      <div>
        <p className="font-medium text-sm text-gray-800 dark:text-slate-200">{row.client?.name || '—'}</p>
        <p className="text-xs text-gray-400 dark:text-slate-500">{row.client?.phone}</p>
      </div>
    )},
    { key: 'property', label: 'Property Interest', render: (row) => (
      <p className="text-sm text-gray-600 dark:text-slate-400 truncate max-w-[160px]">
        {row.property?.title || '—'}
      </p>
    )},
    { key: 'source', label: 'Source', render: (row) => <span className="text-xs capitalize text-gray-500 dark:text-slate-400">{row.source}</span> },
    { key: 'status', label: 'Status', render: (row) => <Badge status={row.status} label={STATUS_LABELS[row.status]} /> },
    // { key: 'assignedAgent', label: 'Agent', render: (row) => <span className="text-sm text-gray-600 dark:text-slate-400">{row.assignedAgent?.name || '—'}</span> },
    { key: 'followUpDate', label: 'Follow Up', render: (row) => <span className="text-xs text-gray-400 dark:text-slate-500">{formatDate(row.followUpDate)}</span> },
    { key: 'actions', label: '', render: (row) => (
      <div className="flex items-center gap-1">
        {row.client?.phone && (
          <button
            onClick={() => setWaClient({ name: row.client?.name, phone: row.client?.phone })}
            className="btn btn-ghost btn-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
            title="WhatsApp"
          >
            {WA_ICON}
          </button>
        )}
        {can('admin', 'agent') && (
          <button onClick={() => navigate(`/leads/${row._id}/edit`)} className="btn btn-ghost btn-sm">✏️</button>
        )}
        {can('admin') && (
          <button onClick={() => setDeleteId(row._id)} className="btn btn-ghost btn-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">🗑️</button>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-5">
      <div className="section-header">
        <div>
          <h1 className="page-title">Leads Pipeline</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">{total} leads</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView(view === 'kanban' ? 'table' : 'kanban')} className="btn btn-secondary btn-sm">
            {view === 'kanban' ? '☰ Table' : '⊞ Kanban'}
          </button>
          {can('admin', 'agent') && (
            <button onClick={() => navigate('/leads/new')} className="btn btn-primary">+ Add Lead</button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select className="select" value={filters.status} onChange={(e) => handleFilter('status', e.target.value)}>
            <option value="">All Statuses</option>
            {LEAD_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
          <select className="select" value={filters.source} onChange={(e) => handleFilter('source', e.target.value)}>
            <option value="">All Sources</option>
            {['website', 'referral', 'phone', 'walk-in', 'propertyfinder', 'bayut', 'dubizzle', 'other'].map((s) => (
              <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-4xl animate-pulse">📋</div>
      ) : view === 'kanban' ? (
        <PipelineBoard leads={leads} onStatusChange={handleStatusChange} />
      ) : (
        <>
          <div className="card overflow-hidden">
            <Table columns={columns} data={leads} loading={false} emptyMessage="No leads found" />
          </div>
          <Pagination page={page} pages={pages} total={total} limit={LIMIT} onPage={setPage} />
        </>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        message="This lead will be permanently deleted."
      />

      <WhatsAppModal
        isOpen={!!waClient}
        onClose={() => setWaClient(null)}
        client={waClient}
      />
    </div>
  );
}
