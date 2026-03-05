import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { formatAED, formatDate } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import DealTrendChart from '../components/charts/DealTrendChart';
import PropertyTypePieChart from '../components/charts/PropertyTypePieChart';

const KPICard = ({ icon, label, value, sub, color }) => (
  <div className="stat-card">
    <div className={`stat-icon flex-shrink-0 ${color}`}>
      <span>{icon}</span>
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] leading-tight text-gray-500 dark:text-slate-400">{label}</p>
      <p className="text-sm font-bold text-gray-900 dark:text-slate-100 mt-0.5 leading-tight break-words">{value}</p>
      {sub && <p className="text-[10px] leading-tight text-gray-400 dark:text-slate-500 mt-0.5">{sub}</p>}
    </div>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState(null);
  const [trend, setTrend] = useState([]);
  const [typeData, setTypeData] = useState([]);
  const [recentDeals, setRecentDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [kpiRes, trendRes, typeRes, dealsRes] = await Promise.all([
          api.get('/dashboard/kpis'),
          api.get('/dashboard/deal-trend'),
          api.get('/dashboard/properties-by-type'),
          api.get('/dashboard/recent-deals'),
        ]);
        setKpis(kpiRes.data.kpis);
        setTrend(trendRes.data.trend);
        setTypeData(typeRes.data.data);
        setRecentDeals(dealsRes.data.deals);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="section-header items-start">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button onClick={() => navigate('/properties/new')} className="btn btn-primary shrink-0">
          + Add Property
        </button>
      </div>

      {/* KPI Cards */}
      {kpis && (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
          <KPICard icon="🏢" label="Active Listings" value={kpis.totalListings} color="bg-brand-light/50" />
          <KPICard icon="🤝" label="Deals Closed (MTD)" value={kpis.dealsClosedThisMonth} color="bg-green-100 dark:bg-green-900/30" />
          <KPICard icon="💰" label="Commission (MTD)" value={formatAED(kpis.commissionThisMonth)} color="bg-amber-100 dark:bg-amber-900/30" />
          <KPICard icon="📋" label="New Leads (7d)" value={kpis.newLeadsThisWeek} color="bg-blue-100 dark:bg-blue-900/30" />
          <KPICard icon="📅" label="Viewings Upcoming" value={kpis.viewingsScheduled} color="bg-purple-100 dark:bg-purple-900/30" />
          <KPICard icon="📊" label="Pipeline Value" value={formatAED(kpis.pipelineValue)} sub="In-progress deals" color="bg-slate-100 dark:bg-slate-700" />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="card p-5 lg:col-span-3">
          <h2 className="font-semibold text-gray-800 dark:text-slate-200 mb-4">Deal Revenue Trend (12 months)</h2>
          <DealTrendChart data={trend} />
        </div>
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-semibold text-gray-800 dark:text-slate-200 mb-4">Properties by Type</h2>
          {typeData.length > 0 ? (
            <PropertyTypePieChart data={typeData} />
          ) : (
            <div className="flex items-center justify-center h-52 text-gray-400 dark:text-slate-500 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Recent Deals */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800 dark:text-slate-200">Recent Deals</h2>
          <button onClick={() => navigate('/deals')} className="text-brand-gold text-sm hover:underline">
            View all →
          </button>
        </div>
        {recentDeals.length === 0 ? (
          <p className="text-gray-400 dark:text-slate-500 text-sm text-center py-8">No deals yet</p>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="table min-w-[480px]">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Client</th>
                  <th className="col-mobile-hide">Type</th>
                  <th>Value</th>
                  <th className="col-mobile-hide">Status</th>
                  <th className="col-mobile-hide">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800">
                {recentDeals.map((deal) => (
                  <tr
                    key={deal._id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/deals`)}
                  >
                    <td>
                      <p className="font-medium text-xs text-gray-800 dark:text-slate-200 truncate max-w-[130px] sm:max-w-[160px]">
                        {deal.property?.title || '—'}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-slate-500">{deal.property?.emirate}</p>
                    </td>
                    <td className="text-sm text-gray-700 dark:text-slate-300 whitespace-nowrap">{deal.client?.name}</td>
                    <td className="col-mobile-hide">
                      <span className="badge bg-brand-light text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 capitalize">
                        {deal.dealType}
                      </span>
                    </td>
                    <td className="font-semibold text-sm text-gray-800 dark:text-slate-200 whitespace-nowrap">
                      {formatAED(deal.agreedPrice)}
                    </td>
                    <td className="col-mobile-hide"><Badge status={deal.status} /></td>
                    <td className="col-mobile-hide text-xs text-gray-400 dark:text-slate-500">{formatDate(deal.dealDate || deal.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: '🏢', label: 'Browse Properties', path: '/properties' },
          { icon: '👥', label: 'View Clients', path: '/clients' },
          { icon: '📋', label: 'Lead Pipeline', path: '/leads' },
          { icon: '📅', label: 'Viewings', path: '/viewings' },
        ].map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="card p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow cursor-pointer text-center"
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
