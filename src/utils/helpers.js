export const formatAED = (amount) => {
  if (amount === null || amount === undefined) return 'AED 0';
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusColor = (status) => {
  const map = {
    // Property status
    available: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    reserved: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    sold: 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300',
    rented: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    'off-market': 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    // Lead status
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    qualified: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    viewing: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
    negotiation: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    closed: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    lost: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    // Deal status
    'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    'pending-docs': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    // Viewing status
    scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    'no-show': 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    // Invoice status
    unpaid: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    paid: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  };
  return map[status] || 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300';
};

export const getPropertyTypeIcon = (type) => {
  const icons = {
    apartment: '🏢',
    villa: '🏡',
    townhouse: '🏘️',
    office: '🏢',
    retail: '🏪',
    land: '🌿',
    warehouse: '🏭',
  };
  return icons[type] || '🏠';
};

export const getDealTypeColor = (type) => {
  const map = {
    sale: 'bg-brand-light text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    rent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    renewal: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  };
  return map[type] || 'bg-gray-100 text-gray-700';
};

export const getClientTypeColor = (type) => {
  const map = {
    buyer: 'bg-brand-light text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    tenant: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    investor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    landlord: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  };
  return map[type] || 'bg-gray-100 text-gray-700';
};

export const EMIRATES = [
  'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman',
  'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain',
];

export const PROPERTY_TYPES = [
  'apartment', 'villa', 'townhouse', 'office', 'retail', 'land', 'warehouse',
];

export const LEAD_SOURCES = [
  'website', 'referral', 'phone', 'walk-in', 'propertyfinder', 'bayut', 'dubizzle', 'other',
];

export const LEAD_STATUSES = [
  'new', 'contacted', 'qualified', 'viewing', 'negotiation', 'closed', 'lost',
];

export const AMENITIES_LIST = [
  'Pool', 'Gym', 'Parking', 'Balcony', 'Garden', 'Sea View', 'City View',
  'Beach Access', 'Concierge', 'Security', 'Maid Room', 'Study Room',
  'Built-in Wardrobes', 'Central A/C', 'Covered Parking', 'Metro Access',
];

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
