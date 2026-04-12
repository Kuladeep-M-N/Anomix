import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  trend: string;
  trendDirection: 'up' | 'down';
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'yellow' | 'purple' | 'red';
  sparklineData?: number[];
}

const COLOR_MAP = {
  green: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  yellow: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  red: 'text-red-400 bg-red-400/10 border-red-400/20',
};

export function MetricCard({ title, value, trend, trendDirection, icon, color, sparklineData }: MetricCardProps) {
  const isPositive = trendDirection === 'up';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-gray-900/40 backdrop-blur-xl border border-white/5 p-5 rounded-2xl shadow-xl"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl border ${COLOR_MAP[color]}`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {trend}
        </div>
      </div>

      <div>
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
      </div>

      {sparklineData && (
        <div className="mt-4 h-8 flex items-end gap-1">
          {sparklineData.map((v, i) => (
            <div 
              key={i} 
              className={`flex-1 rounded-full ${COLOR_MAP[color].split(' ')[0]}`}
              style={{ height: `${(v / Math.max(...sparklineData)) * 100}%`, opacity: 0.2 + (i / sparklineData.length) * 0.8 }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
