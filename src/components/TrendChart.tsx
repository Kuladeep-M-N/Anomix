import { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceArea, ReferenceLine 
} from 'recharts';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';

export function TrendChart() {
  const { data, alerts } = useStore();

  const chartData = useMemo(() => {
    return data.map(d => ({
      ...d,
      time: format(d.timestamp, 'HH:mm:ss'),
      fullTime: format(d.timestamp, 'MMM d, HH:mm:ss'),
    }));
  }, [data]);

  const anomalies = useMemo(() => {
    return data.filter(d => d.isAnomaly);
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-gray-900/40 rounded-3xl border border-white/5">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm font-medium">Synchronizing data streams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full bg-gray-900/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5 relative group">
      <div className="absolute top-6 left-8 z-10">
        <h3 className="text-white font-bold tracking-tight">Engagement Velocity</h3>
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Real-time Metrics</p>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 60, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="anomalyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
          <XAxis 
            dataKey="time" 
            hide 
            padding={{ left: 0, right: 0 }}
          />
          <YAxis 
            hide 
            domain={[0, 'auto']} 
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-gray-900 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-xl">
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">{item.fullTime}</p>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-blue-500" />
                       <span className="text-white font-bold text-lg">{item.engagement.toFixed(1)}</span>
                    </div>
                    {item.isAnomaly && (
                      <div className="mt-2 pt-2 border-t border-white/5">
                        <span className="text-red-400 text-[10px] font-bold uppercase">{item.anomalyDetails?.severity} ANOMALY</span>
                        <p className="text-white text-xs mt-1">{item.anomalyDetails?.reasoning}</p>
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Area 
            type="monotone" 
            dataKey="engagement" 
            stroke="#3B82F6" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#engagementGradient)" 
            isAnimationActive={false}
          />
          
          {anomalies.map((a, i) => (
            <ReferenceLine 
              key={i}
              x={format(a.timestamp, 'HH:mm:ss')} 
              stroke="#EF4444" 
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
