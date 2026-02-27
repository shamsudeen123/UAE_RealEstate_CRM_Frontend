import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { formatAED, getPropertyTypeIcon, EMIRATES, PROPERTY_TYPES } from '../../utils/helpers';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import PropertyCard from '../../components/common/PropertyCard';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmModal from '../../components/common/ConfirmModal';

const LIMIT = 16;

export default function PropertiesList() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [view, setView] = useState('table');
  const [filters, setFilters] = useState({ propertyType: '', purpose: '', status: '', emirate: '', search: '' });
  const [deleteId, setDeleteId] = useState(null);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT, ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const { data } = await api.get('/properties', { params });
      setProperties(data.properties);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProperties(); }, [page, filters]);

  const handleFilter = (key, val) => {
    setFilters((f) => ({ ...f, [key]: val }));
    setPage(1);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/properties/${deleteId}`);
      setDeleteId(null);
      fetchProperties();
    } catch (err) { console.error(err); }
  };

  const columns = [
    {
      key: 'title', label: 'Property',
      render: (row) => (
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/properties/${row._id}`)}>
          <div className="w-10 h-10 rounded-lg bg-brand-navy/10 dark:bg-slate-700 flex items-center justify-center text-lg flex-shrink-0">
            {getPropertyTypeIcon(row.propertyType)}
          </div>
          <div>
            <p className="font-medium text-sm text-gray-800 dark:text-slate-200 hover:text-brand-gold transition truncate max-w-[200px]">{row.title}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500">
              {row.community ? `${row.community}, ` : ''}{row.emirate}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'propertyType', label: 'Type',
      render: (row) => (
        <span className="badge bg-brand-light text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 capitalize">
          {row.propertyType}
        </span>
      ),
    },
    { key: 'purpose', label: 'Purpose', render: (row) => <span className="capitalize text-sm">{row.purpose}</span> },
    {
      key: 'price', label: 'Price',
      render: (row) => (
        <div>
          <p className="font-semibold text-brand-gold text-sm">
            {row.purpose === 'rent' ? `${formatAED(row.rentPrice)}/yr` : formatAED(row.price)}
          </p>
          {row.purpose === 'both' && (
            <p className="text-xs text-gray-400">Sale: {formatAED(row.price)}</p>
          )}
        </div>
      ),
    },
    {
      key: 'details', label: 'Details',
      render: (row) => (
        <div className="text-xs text-gray-500 dark:text-slate-400 space-y-0.5">
          {row.bedrooms > 0 && <p>🛏 {row.bedrooms} BR • 🚿 {row.bathrooms} BA</p>}
          {row.areaSqft && <p>📐 {row.areaSqft.toLocaleString()} sqft</p>}
        </div>
      ),
    },
    {
      key: 'status', label: 'Status',
      render: (row) => <Badge status={row.status} />,
    },
    // Agent column — disabled
    // { key: 'listingAgent', label: 'Agent', render: (row) => <span className="text-sm text-gray-600 dark:text-slate-400">{row.listingAgent?.name || '—'}</span> },
    {
      key: 'actions', label: '',
      render: (row) => (
        <div className="flex items-center gap-1">
          {can('admin', 'agent') && (
            <button onClick={(e) => { e.stopPropagation(); navigate(`/properties/${row._id}/edit`); }} className="btn btn-ghost btn-sm">✏️</button>
          )}
          {can('admin') && (
            <button onClick={(e) => { e.stopPropagation(); setDeleteId(row._id); }} className="btn btn-ghost btn-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">🗑️</button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="page-title">Properties</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">{total} listings</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setView(view === 'table' ? 'grid' : 'table')} className="btn btn-secondary btn-sm">
            {view === 'table' ? '⊞ Grid' : '☰ Table'}
          </button>
          {can('admin', 'agent') && (
            <button onClick={() => navigate('/properties/new')} className="btn btn-primary">
              + Add Property
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="space-y-3">
        <input
          type="text"
          className="input w-full"
          placeholder="Search by title, community, address or developer..."
          value={filters.search}
          onChange={(e) => handleFilter('search', e.target.value)}
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <select className="select" value={filters.propertyType} onChange={(e) => handleFilter('propertyType', e.target.value)}>
            <option value="">All Types</option>
            {PROPERTY_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
          <select className="select" value={filters.purpose} onChange={(e) => handleFilter('purpose', e.target.value)}>
            <option value="">All Purposes</option>
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
            <option value="both">Sale & Rent</option>
          </select>
          <select className="select" value={filters.status} onChange={(e) => handleFilter('status', e.target.value)}>
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
            <option value="rented">Rented</option>
            <option value="off-market">Off Market</option>
          </select>
          <select className="select" value={filters.emirate} onChange={(e) => handleFilter('emirate', e.target.value)}>
            <option value="">All Emirates</option>
            {EMIRATES.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        </div>
      </div>

      {/* Content */}
      {view === 'grid' ? (
        <>
          {loading ? (
            <div className="flex justify-center py-16"><div className="text-4xl animate-pulse">🏠</div></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {properties.map((p) => <PropertyCard key={p._id} property={p} />)}
              {properties.length === 0 && (
                <div className="col-span-full text-center py-16 text-gray-400 dark:text-slate-500">No properties found</div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="card overflow-hidden">
          <Table columns={columns} data={properties} loading={loading} emptyMessage="No properties found" />
        </div>
      )}

      <Pagination page={page} pages={pages} total={total} limit={LIMIT} onPage={setPage} />

      <ConfirmModal
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        message="This property will be permanently deleted."
      />
    </div>
  );
}
