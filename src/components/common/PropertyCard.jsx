import { useNavigate } from 'react-router-dom';
import { formatAED, getPropertyTypeIcon } from '../../utils/helpers';
import Badge from './Badge';

export default function PropertyCard({ property }) {
  const navigate = useNavigate();

  return (
    <div
      className="card overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/properties/${property._id}`)}
    >
      {/* Image placeholder */}
      <div className="h-36 bg-gradient-to-br from-brand-navy to-slate-600 flex items-center justify-center relative">
        <span className="text-5xl opacity-40">{getPropertyTypeIcon(property.propertyType)}</span>
        <div className="absolute top-2 right-2">
          <Badge status={property.status} />
        </div>
        <div className="absolute top-2 left-2">
          <span className="badge bg-brand-gold/90 text-white capitalize text-xs">
            {property.purpose}
          </span>
        </div>
      </div>
      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-sm truncate mb-1">
          {property.title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">
          📍 {property.community ? `${property.community}, ` : ''}{property.emirate}
        </p>
        <p className="text-brand-gold font-bold text-base mb-2">
          {property.purpose === 'rent'
            ? `${formatAED(property.rentPrice)}/yr`
            : formatAED(property.price)}
        </p>
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400">
          {property.bedrooms > 0 && <span>🛏 {property.bedrooms} BR</span>}
          {property.bathrooms > 0 && <span>🚿 {property.bathrooms} BA</span>}
          {property.areaSqft && <span>📐 {property.areaSqft.toLocaleString()} sqft</span>}
        </div>
      </div>
    </div>
  );
}
