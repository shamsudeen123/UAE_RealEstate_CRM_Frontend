import { getStatusColor } from '../../utils/helpers';

export default function Badge({ status, label, className = '' }) {
  return (
    <span className={`badge ${getStatusColor(status)} ${className}`}>
      {label || status}
    </span>
  );
}
