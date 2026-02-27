import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { formatAED } from '../../utils/helpers';
import DealTrendChart from '../../components/charts/DealTrendChart';
import PropertyTypePieChart from '../../components/charts/PropertyTypePieChart';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ReportsPage() {
  const [trend, setTrend] = useState([]);
  const [typeData, setTypeData] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/kpis'),
      api.get('/dashboard/deal-trend'),
      api.get('/dashboard/properties-by-type'),
    ]).then(([k, t, ty]) => {
      setKpis(k.data.kpis);
      setTrend(t.data.trend);
      setTypeData(ty.data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  const totalRevenue = trend.reduce((s, d) => s + (d.revenue || 0), 0);
  const totalCommission = trend.reduce((s, d) => s + (d.commission || 0), 0);
  const totalDeals = trend.reduce((s, d) => s + (d.count || 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="page-title">Reports & Analytics</h1>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: '12-Month Revenue', value: formatAED(totalRevenue), icon: '💰' },
          { label: '12-Month Commission', value: formatAED(totalCommission), icon: '🏆' },
          { label: 'Total Deals (12mo)', value: totalDeals, icon: '🤝' },
          { label: 'Pipeline Value', value: formatAED(kpis?.pipelineValue || 0), icon: '📊' },
        ].map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-2xl mb-2">{s.icon}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-slate-100">{s.value}</p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="card p-5 lg:col-span-3">
          <h2 className="font-semibold text-gray-800 dark:text-slate-200 mb-4">Revenue & Commission Trend (12 months)</h2>
          <DealTrendChart data={trend} />
        </div>
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-semibold text-gray-800 dark:text-slate-200 mb-4">Listings by Property Type</h2>
          {typeData.length > 0 ? (
            <PropertyTypePieChart data={typeData} />
          ) : (
            <div className="flex items-center justify-center h-52 text-gray-400 dark:text-slate-500 text-sm">No data</div>
          )}
        </div>
      </div>

      {/* Monthly breakdown table */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-800 dark:text-slate-200 mb-4">Monthly Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Deals Closed</th>
                <th>Revenue</th>
                <th>Commission</th>
                <th>Avg Deal</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800">
              {trend.slice().reverse().map((row) => (
                <tr key={row.month}>
                  <td className="font-medium text-gray-700 dark:text-slate-300">{row.month}</td>
                  <td className="text-gray-600 dark:text-slate-400">{row.count}</td>
                  <td className="text-brand-gold font-semibold">{formatAED(row.revenue)}</td>
                  <td className="text-green-600 dark:text-green-400">{formatAED(row.commission)}</td>
                  <td className="text-gray-500 dark:text-slate-400">{row.count > 0 ? formatAED(row.revenue / row.count) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
