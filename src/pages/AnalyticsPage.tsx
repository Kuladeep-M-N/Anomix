import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, AlertTriangle, BarChart3 } from 'lucide-react';
import { useStore } from '../store/useStore';

const PLATFORM_COLORS: Record<string, string> = {
  Reddit: '#FF6B35',
  Twitter: '#1DA1F2',
  Instagram: '#E1306C',
  TikTok: '#69C9D0',
};

const ANOMALY_DATA = [
  { name: 'Reddit', value: 12, color: '#FF6B35' },
  { name: 'Twitter', value: 8, color: '#1DA1F2' },
  { name: 'Instagram', value: 15, color: '#E1306C' },
  { name: 'TikTok', value: 6, color: '#69C9D0' },
];

function MetricCard({
  title, value, trend, isPositive, icon
}: {
  title: string;
  value: string;
  trend: string;
  isPositive: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="glass-card"
      style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
          {title}
        </span>
        <span style={{ color: '#3b82f6', opacity: 0.7 }}>{icon}</span>
      </div>
      <div className="font-display" style={{ fontSize: '2rem', fontWeight: 800, color: 'white', letterSpacing: '-0.03em' }}>
        {value}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {isPositive ? (
          <TrendingUp size={14} style={{ color: '#22c55e' }} />
        ) : (
          <TrendingDown size={14} style={{ color: '#ef4444' }} />
        )}
        <span style={{ fontSize: '12px', color: isPositive ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
          {trend}
        </span>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data } = useStore();

  // Build time-series from store data
  const timeSeriesData = Array.from({ length: 24 }, (_, i) => {
    const hour = `${String(i).padStart(2, '0')}:00`;
    const sliceIndex = Math.floor((i / 24) * data.length);
    const point = data[sliceIndex];
    return {
      hour,
      Reddit: point ? Math.round(point.engagement * 0.9 + Math.random() * 20) : Math.floor(Math.random() * 100 + 50),
      Twitter: Math.floor(Math.random() * 100 + 30),
      Instagram: Math.floor(Math.random() * 100 + 40),
      TikTok: Math.floor(Math.random() * 100 + 60),
    };
  });

  const totalAnomalies = data.filter(d => d.isAnomaly).length;
  const avgEngagement = data.length > 0
    ? Math.round(data.reduce((a, b) => a + b.engagement, 0) / data.length)
    : 0;
  const peakEngagement = data.length > 0 ? Math.max(...data.map(d => d.engagement)) : 0;

  const tooltipStyle = {
    backgroundColor: '#111827',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '12px',
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{ padding: '8px', background: 'rgba(59,130,246,0.1)', borderRadius: '10px' }}>
            <BarChart3 size={18} style={{ color: '#3b82f6' }} />
          </div>
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#60a5fa' }}>
            Analytics Dashboard
          </span>
        </div>
        <h1 className="font-display" style={{ fontSize: '2.5rem', color: 'white', letterSpacing: '-0.03em', margin: 0 }}>
          Performance Insights
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '8px', fontSize: '0.9rem' }}>
          Comprehensive metrics across all monitored platforms
        </p>
      </div>

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <MetricCard
          title="Total Anomalies"
          value={totalAnomalies.toString()}
          trend={totalAnomalies > 5 ? '+2 this hour' : 'Stable'}
          isPositive={false}
          icon={<AlertTriangle size={18} />}
        />
        <MetricCard
          title="Avg Engagement"
          value={avgEngagement.toLocaleString()}
          trend="+12% vs yesterday"
          isPositive={true}
          icon={<Activity size={18} />}
        />
        <MetricCard
          title="Peak Score"
          value={peakEngagement.toLocaleString()}
          trend="New record"
          isPositive={true}
          icon={<TrendingUp size={18} />}
        />
        <MetricCard
          title="Data Points"
          value={data.length.toLocaleString()}
          trend="Live stream"
          isPositive={true}
          icon={<BarChart3 size={18} />}
        />
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Platform Engagement Timeline */}
        <div
          className="glass-card"
          style={{ padding: '28px', borderRadius: '24px' }}
        >
          <h3 style={{ color: 'white', fontWeight: 700, fontSize: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
            Platform Engagement (24h)
          </h3>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="hour" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} interval={3} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }} />
                {Object.entries(PLATFORM_COLORS).map(([name, color]) => (
                  <Line key={name} type="monotone" dataKey={name} stroke={color} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Anomaly Distribution Pie */}
        <div
          className="glass-card"
          style={{ padding: '28px', borderRadius: '24px' }}
        >
          <h3 style={{ color: 'white', fontWeight: 700, fontSize: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
            Anomaly Distribution
          </h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ANOMALY_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {ANOMALY_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bar Chart - Platform comparison */}
      <div
        className="glass-card"
        style={{ padding: '28px', borderRadius: '24px' }}
      >
        <h3 style={{ color: 'white', fontWeight: 700, fontSize: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a855f7', display: 'inline-block' }} />
          Average Hourly Engagement by Platform
        </h3>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ANOMALY_DATA.map(d => ({ name: d.name, value: Math.floor(Math.random() * 500 + 200), color: d.color }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {ANOMALY_DATA.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.color} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
