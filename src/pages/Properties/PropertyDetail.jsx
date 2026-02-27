import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { formatAED, formatDate, getPropertyTypeIcon } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../contexts/AuthContext';

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/properties/${id}`)
      .then(({ data }) => setProperty(data.property))
      .catch(() => navigate('/properties'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!property) return null;

  const Row = ({ label, value }) => value ? (
    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-700 last:border-0">
      <span className="text-sm text-gray-500 dark:text-slate-400">{label}</span>
      <span className="text-sm font-medium text-gray-800 dark:text-slate-200">{value}</span>
    </div>
  ) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button onClick={() => navigate('/properties')} className="text-sm text-brand-gold hover:underline mb-2 block">
            ← Back to Properties
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">{property.title}</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
            📍 {property.community ? `${property.community}, ` : ''}{property.address ? `${property.address}, ` : ''}{property.emirate}
          </p>
        </div>
        {can('admin', 'agent') && (
          <button onClick={() => navigate(`/properties/${id}/edit`)} className="btn btn-primary btn-sm flex-shrink-0">
            ✏️ Edit
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Image placeholder */}
          <div className="card overflow-hidden">
            <div className="h-52 bg-gradient-to-br from-brand-navy to-slate-600 flex items-center justify-center">
              <span className="text-7xl opacity-30">{getPropertyTypeIcon(property.propertyType)}</span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-brand-gold">
                  {property.purpose === 'rent' ? `${formatAED(property.rentPrice)}/yr` : formatAED(property.price)}
                </p>
                {property.purpose === 'both' && (
                  <p className="text-sm text-gray-400">Also for rent: {formatAED(property.rentPrice)}/yr</p>
                )}
              </div>
              <div className="flex gap-2">
                <span className="badge bg-brand-light text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 capitalize">{property.purpose}</span>
                <Badge status={property.status} />
              </div>
            </div>
          </div>

          {/* Key facts */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-700 dark:text-slate-300 mb-4">Property Details</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {property.bedrooms > 0 && (
                <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-slate-700">
                  <p className="text-2xl">🛏</p>
                  <p className="font-bold text-gray-800 dark:text-slate-200">{property.bedrooms}</p>
                  <p className="text-xs text-gray-400">Bedrooms</p>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-slate-700">
                  <p className="text-2xl">🚿</p>
                  <p className="font-bold text-gray-800 dark:text-slate-200">{property.bathrooms}</p>
                  <p className="text-xs text-gray-400">Bathrooms</p>
                </div>
              )}
              {property.areaSqft && (
                <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-slate-700">
                  <p className="text-2xl">📐</p>
                  <p className="font-bold text-gray-800 dark:text-slate-200">{property.areaSqft.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">Sqft</p>
                </div>
              )}
            </div>
            <div>
              <Row label="Type" value={<span className="capitalize">{property.propertyType}</span>} />
              <Row label="Furnishing" value={<span className="capitalize">{property.furnishing}</span>} />
              <Row label="Floor" value={property.floor} />
              <Row label="Developer" value={property.developer} />
              <Row label="RERA No." value={property.reraNo} />
              <Row label="Permit No." value={property.permitNo} />
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-700 dark:text-slate-300 mb-2">Description</h2>
              <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">{property.description}</p>
            </div>
          )}

          {/* Amenities */}
          {property.amenities?.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-700 dark:text-slate-300 mb-3">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((a) => (
                  <span key={a} className="px-3 py-1 bg-brand-light/60 dark:bg-slate-700 text-amber-800 dark:text-slate-300 rounded-full text-xs font-medium">
                    ✓ {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Listing agent */}
          {property.listingAgent && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-700 dark:text-slate-300 mb-3">Listing Agent</h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center text-white font-bold flex-shrink-0">
                  {property.listingAgent.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-800 dark:text-slate-200">{property.listingAgent.name}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">{property.listingAgent.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Owner info */}
          {property.owner?.name && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-700 dark:text-slate-300 mb-3">Owner</h2>
              <div className="space-y-1 text-sm">
                <p className="font-medium text-gray-800 dark:text-slate-200">{property.owner.name}</p>
                {property.owner.phone && <p className="text-gray-500 dark:text-slate-400">📞 {property.owner.phone}</p>}
                {property.owner.email && <p className="text-gray-500 dark:text-slate-400">✉️ {property.owner.email}</p>}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-700 dark:text-slate-300 mb-3">Listing Info</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">Listed on</span>
                <span className="text-gray-700 dark:text-slate-300">{formatDate(property.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">Added by</span>
                <span className="text-gray-700 dark:text-slate-300">{property.createdBy?.name}</span>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="card p-5 space-y-2">
            <button onClick={() => navigate(`/leads/new?property=${id}`)} className="btn btn-primary w-full">
              + Create Lead
            </button>
            <button onClick={() => navigate(`/viewings/new?property=${id}`)} className="btn btn-secondary w-full">
              📅 Schedule Viewing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
