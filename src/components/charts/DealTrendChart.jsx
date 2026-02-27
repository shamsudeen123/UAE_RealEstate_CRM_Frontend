import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const formatM = (v) => {
  if (v >= 1000000) return `AED ${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `AED ${(v / 1000).toFixed(0)}K`;
  return `AED ${v}`;
};

export default function DealTrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#c9a227" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#c9a227" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={formatM} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={75} />
        <Tooltip
          formatter={(value, name) => [formatM(value), name === 'revenue' ? 'Revenue' : 'Commission']}
          contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
        />
        <Legend />
        <Area type="monotone" dataKey="revenue" name="revenue" stroke="#c9a227" strokeWidth={2} fill="url(#revGrad)" />
        <Area type="monotone" dataKey="commission" name="commission" stroke="#3b82f6" strokeWidth={2} fill="url(#commGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
