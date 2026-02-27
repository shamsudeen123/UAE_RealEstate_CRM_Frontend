import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { EMIRATES, PROPERTY_TYPES, AMENITIES_LIST } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const INIT = {
  title: '', description: '', propertyType: 'apartment', purpose: 'sale', status: 'available',
  emirate: 'Dubai', community: '', address: '', price: '', rentPrice: '',
  bedrooms: 0, bathrooms: 0, areaSqft: '', floor: '',
  furnishing: 'unfurnished', amenities: [],
  developer: '', reraNo: '', permitNo: '',
  ownerName: '', ownerPhone: '', ownerEmail: '',
  // listingAgent: '',
};

const F = ({ label, children }) => (
  <div className="form-group">
    <label className="label">{label}</label>
    {children}
  </div>
);

export default function PropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(INIT);
  // const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // api.get('/auth/users').then(({ data }) => {
    //   setAgents(data.users.filter((u) => u.role === 'agent' || u.role === 'admin'));
    // }).catch(() => {});

    if (isEdit) {
      api.get(`/properties/${id}`).then(({ data }) => {
        const p = data.property;
        setForm({
          title: p.title || '', description: p.description || '',
          propertyType: p.propertyType || 'apartment', purpose: p.purpose || 'sale',
          status: p.status || 'available', emirate: p.emirate || 'Dubai',
          community: p.community || '', address: p.address || '',
          price: p.price || '', rentPrice: p.rentPrice || '',
          bedrooms: p.bedrooms ?? 0, bathrooms: p.bathrooms ?? 0,
          areaSqft: p.areaSqft || '', floor: p.floor || '',
          furnishing: p.furnishing || 'unfurnished', amenities: p.amenities || [],
          developer: p.developer || '', reraNo: p.reraNo || '', permitNo: p.permitNo || '',
          ownerName: p.owner?.name || '', ownerPhone: p.owner?.phone || '', ownerEmail: p.owner?.email || '',
          // listingAgent: p.listingAgent?._id || '',
        });
        setLoading(false);
      });
    }
  }, [id, isEdit]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleAmenity = (a) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: form.price ? Number(form.price) : undefined,
        rentPrice: form.rentPrice ? Number(form.rentPrice) : undefined,
        areaSqft: form.areaSqft ? Number(form.areaSqft) : undefined,
        floor: form.floor ? Number(form.floor) : undefined,
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        owner: { name: form.ownerName, phone: form.ownerPhone, email: form.ownerEmail },
        // listingAgent: form.listingAgent || undefined,
      };
      delete payload.ownerName; delete payload.ownerPhone; delete payload.ownerEmail;

      if (isEdit) {
        await api.put(`/properties/${id}`, payload);
      } else {
        await api.post('/properties', payload);
      }
      navigate('/properties');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save property');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="section-header">
        <h1 className="page-title">{isEdit ? 'Edit Property' : 'Add Property'}</h1>
        <button onClick={() => navigate('/properties')} className="btn btn-secondary btn-sm">← Back</button>
      </div>

      {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-700 dark:text-slate-300">Basic Information</h2>
          <F label="Property Title *">
            <input className="input" required value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Luxury 3BR Apartment - Downtown Dubai" />
          </F>
          <F label="Description">
            <textarea className="input" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Property description..." />
          </F>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <F label="Property Type *">
              <select className="select" required value={form.propertyType} onChange={(e) => set('propertyType', e.target.value)}>
                {PROPERTY_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </F>
            <F label="Purpose *">
              <select className="select" required value={form.purpose} onChange={(e) => set('purpose', e.target.value)}>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
                <option value="both">Sale & Rent</option>
              </select>
            </F>
            <F label="Status">
              <select className="select" value={form.status} onChange={(e) => set('status', e.target.value)}>
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
                <option value="off-market">Off Market</option>
              </select>
            </F>
          </div>
        </div>

        {/* Location */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-700 dark:text-slate-300">Location</h2>
          <div className="grid grid-cols-2 gap-4">
            <F label="Emirate *">
              <select className="select" required value={form.emirate} onChange={(e) => set('emirate', e.target.value)}>
                {EMIRATES.map((em) => <option key={em} value={em}>{em}</option>)}
              </select>
            </F>
            <F label="Community / Area">
              <input className="input" value={form.community} onChange={(e) => set('community', e.target.value)} placeholder="e.g. Downtown Dubai" />
            </F>
          </div>
          <F label="Address">
            <input className="input" value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Building/Street name" />
          </F>
        </div>

        {/* Pricing */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-700 dark:text-slate-300">Pricing</h2>
          <div className="grid grid-cols-2 gap-4">
            {(form.purpose === 'sale' || form.purpose === 'both') && (
              <F label="Sale Price (AED)">
                <input type="number" className="input" min={0} value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="0" />
              </F>
            )}
            {(form.purpose === 'rent' || form.purpose === 'both') && (
              <F label="Annual Rent (AED)">
                <input type="number" className="input" min={0} value={form.rentPrice} onChange={(e) => set('rentPrice', e.target.value)} placeholder="0" />
              </F>
            )}
          </div>
        </div>

        {/* Property Details */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-700 dark:text-slate-300">Property Details</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <F label="Bedrooms">
              <input type="number" className="input" min={0} value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} />
            </F>
            <F label="Bathrooms">
              <input type="number" className="input" min={0} value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} />
            </F>
            <F label="Area (sqft)">
              <input type="number" className="input" min={0} value={form.areaSqft} onChange={(e) => set('areaSqft', e.target.value)} />
            </F>
            <F label="Floor">
              <input type="number" className="input" value={form.floor} onChange={(e) => set('floor', e.target.value)} />
            </F>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <F label="Furnishing">
              <select className="select" value={form.furnishing} onChange={(e) => set('furnishing', e.target.value)}>
                <option value="unfurnished">Unfurnished</option>
                <option value="semi-furnished">Semi-Furnished</option>
                <option value="furnished">Furnished</option>
              </select>
            </F>
            <F label="Developer">
              <input className="input" value={form.developer} onChange={(e) => set('developer', e.target.value)} placeholder="e.g. Emaar, Nakheel" />
            </F>
          </div>
          <F label="Amenities">
            <div className="flex flex-wrap gap-2 mt-1">
              {AMENITIES_LIST.map((a) => (
                <button
                  key={a} type="button"
                  onClick={() => toggleAmenity(a)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                    form.amenities.includes(a)
                      ? 'bg-brand-gold text-white border-brand-gold'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:border-brand-gold'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </F>
        </div>

        {/* Legal & Agent */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-700 dark:text-slate-300">Legal & Assignment</h2>
          <div className="grid grid-cols-2 gap-4">
            <F label="RERA No.">
              <input className="input" value={form.reraNo} onChange={(e) => set('reraNo', e.target.value)} placeholder="RERA registration" />
            </F>
            <F label="Permit No.">
              <input className="input" value={form.permitNo} onChange={(e) => set('permitNo', e.target.value)} placeholder="DLD permit" />
            </F>
          </div>
          {/* Listing Agent — disabled
          <F label="Listing Agent">
            <select className="select" value={form.listingAgent} onChange={(e) => set('listingAgent', e.target.value)}>
              <option value="">Select agent...</option>
              {agents.map((a) => <option key={a._id} value={a._id}>{a.name} ({a.role})</option>)}
            </select>
          </F> */}
        </div>

        {/* Owner Info */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-700 dark:text-slate-300">Owner Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <F label="Owner Name">
              <input className="input" value={form.ownerName} onChange={(e) => set('ownerName', e.target.value)} />
            </F>
            <F label="Owner Phone">
              <input className="input" value={form.ownerPhone} onChange={(e) => set('ownerPhone', e.target.value)} />
            </F>
            <F label="Owner Email">
              <input type="email" className="input" value={form.ownerEmail} onChange={(e) => set('ownerEmail', e.target.value)} />
            </F>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate('/properties')} className="btn btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Property'}
          </button>
        </div>
      </form>
    </div>
  );
}
