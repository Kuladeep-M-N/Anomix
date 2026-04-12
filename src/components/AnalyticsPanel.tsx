import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { useStore } from '../store/useStore';

export function AnalyticsPanel() {
  const { data } = useStore();

  // Engagement per platform (simulated aggregation)
  const platformComparison = [
    { name: 'Reddit', engagement: 82 },
    { name: 'Twitter', engagement: 65 },
    { name: 'Instagram', engagement: 45 },
    { name: 'TikTok', engagement: 91 },
  ];

  const sentimentData = [
    { name: 'Positive', value: 400, color: '#10B981' },
    { name: 'Neutral', value: 300, color: '#6B7280' },
    { name: 'Negative', value: 200, color: '#EF4444' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      
      {/* Platform Comparison */}
      <div className="bg-gray-900/40 backdrop-blur-xl border border-white/5 p-6 rounded-3xl">
        <h4 className="text-white font-bold mb-6 text-sm flex items-center gap-2 uppercase tracking-widest">
           <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
           Market Share vs Engagement
        </h4>
        <div className="h-[250px] w-full">
           <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformComparison}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                 <XAxis dataKey="name" stroke="#ffffff30" fontSize={10} axisLine={false} tickLine={false} />
                 <YAxis hide />
                 <Tooltip 
                    cursor={{ fill: '#ffffff05' }}
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #ffffff10', borderRadius: '12px' }}
                 />
                 <Bar dataKey="engagement" radius={[6, 6, 0, 0]}>
                    {platformComparison.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3B82F6' : '#6366F1'} fillOpacity={0.8} />
                    ))}
                 </Bar>
              </BarChart>
           </ResponsiveContainer>
        </div>
      </div>

      {/* Sentiment Distribution */}
      <div className="bg-gray-900/40 backdrop-blur-xl border border-white/5 p-6 rounded-3xl">
        <h4 className="text-white font-bold mb-6 text-sm flex items-center gap-2 uppercase tracking-widest">
           <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
           Audience Sentiment
        </h4>
        <div className="h-[250px] w-full flex items-center justify-center">
           <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                 <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                 >
                    {sentimentData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                 </Pie>
                 <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #ffffff10', borderRadius: '12px' }}
                 />
              </PieChart>
           </ResponsiveContainer>
           
           <div className="absolute flex flex-col items-center">
              <span className="text-white font-bold text-2xl">72%</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase">Positive</span>
           </div>
        </div>
      </div>

    </div>
  );
}
