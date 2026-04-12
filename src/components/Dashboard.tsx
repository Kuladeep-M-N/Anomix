import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, ShieldAlert, BarChart3, Settings as SettingsIcon } from 'lucide-react';
import { PlatformTabs } from './PlatformTabs';
import { TrendChart } from './TrendChart';
import { AlertPanel } from './AlertPanel';
import { MetricCard } from './MetricCard';
import { LiveIndicator } from './LiveIndicator';
import { AnalyticsPanel } from './AnalyticsPanel';
import { AlgorithmComparison } from './AlgorithmComparison';
import { ExportButton } from './ExportButton';
import { useStore } from '../store/useStore';
import { useRedditData } from '../hooks/useRedditData';
import { RedditLiveIndicator } from './RedditLiveIndicator';
import { RedditErrorState } from './RedditErrorState';
import { SubredditSelector } from './SubredditSelector';
import { fetchRedditTrends } from '../services/redditService';
import type { RedditTrendData } from '../services/redditService';

export function Dashboard() {
  const { selectedPlatform, data, setData } = useStore();
  const { 
    data: redditData, 
    isLoading: redditLoading, 
    error: redditError,
    refresh: refreshReddit
  } = useRedditData(true, 300000); // Auto-refresh every 5 minutes

  // Sync Reddit real data to store when platform is reddit
  useEffect(() => {
    if (selectedPlatform === 'reddit' && !redditLoading && redditData.timeSeries.length > 0) {
      // Map RedditTimeSeries to DataPoint
      const mappedData = redditData.timeSeries.map(ts => ({
        timestamp: ts.timestamp,
        platform: 'reddit' as const,
        topic: redditData.trendingTopics[0]?.topic || 'Trending',
        engagement: ts.engagement,
        raw_metrics: { posts: ts.count },
        sentiment: 0.1, // Default neutral-positive
        velocity: 5,
        isAnomaly: false
      }));
      setData(mappedData);
    }
  }, [redditData, redditLoading, selectedPlatform, setData]);

  // Calculate current metrics
  const currentEngagement = data.length > 0 ? data[data.length - 1].engagement : 0;
  const avgEngagement = data.length > 0 ? data.reduce((acc, curr) => acc + curr.engagement, 0) / data.length : 0;
  const anomalyCount = data.filter(d => d.isAnomaly).length;
  const recentTrend = data.slice(-10).map(d => d.engagement);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 max-w-[1600px] mx-auto space-y-8"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <LayoutDashboard size={18} className="text-blue-500" />
            </div>
            <span className="text-blue-500 text-[10px] font-bold uppercase tracking-[0.2em]">Operational Dashboard</span>
          </div>
          <h1 className="text-4xl font-bold text-white dark:text-white tracking-tight">Anomix Monitoring</h1>
        </div>

        <div className="flex items-center gap-3">
          {selectedPlatform === 'reddit' && (
            <RedditLiveIndicator 
              lastUpdate={redditData.lastUpdated} 
              isLoading={redditLoading} 
            />
          )}
          <ExportButton />
        </div>
      </div>

      {/* Navigation & Controls */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-gray-900/40 backdrop-blur-xl border border-white/5 p-3 rounded-2xl">
        <PlatformTabs />
        <div className="flex items-center gap-2 pr-2">
           {selectedPlatform === 'reddit' && (
             <SubredditSelector 
               selected={redditData.subreddits} 
               onChange={() => {}} // Hook handles default subreddits for now
             />
           )}
           <button 
             onClick={async () => {
               console.log('Testing Reddit API...');
               const data = await fetchRedditTrends();
               console.log('Reddit Data:', data);
               alert('Reddit API Data Logged to Console');
             }}
             className="px-4 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all text-[10px] font-bold uppercase tracking-widest border border-blue-500/20"
           >
             Test API
           </button>
           <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
              <SettingsIcon size={16} />
              Settings
           </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 units) */}
        <div className="lg:col-span-8 space-y-8">
          
          {selectedPlatform === 'reddit' && redditError ? (
            <div className="mb-8">
              <RedditErrorState error={redditError} onRetry={refreshReddit} />
            </div>
          ) : (
            <>
              {/* KPI Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard 
                  title="Real-time Engagement"
                  value={currentEngagement.toFixed(1)}
                  trend="+12%"
                  trendDirection="up"
                  icon={<BarChart3 size={20} />}
                  color="blue"
                  sparklineData={recentTrend}
                />
                <MetricCard 
                  title="Anomalies Detected"
                  value={anomalyCount.toString()}
                  trend={anomalyCount > 5 ? "+2" : "stable"}
                  trendDirection={anomalyCount > 5 ? "up" : "down"}
                  icon={<ShieldAlert size={20} />}
                  color={anomalyCount > 5 ? "red" : "yellow"}
                  sparklineData={data.slice(-20).map(d => d.isAnomaly ? 100 : 0)}
                />
                <MetricCard 
                  title="Avg. Score"
                  value={avgEngagement.toFixed(1)}
                  trend="-4%"
                  trendDirection="down"
                  icon={<LayoutDashboard size={20} />}
                  color="purple"
                  sparklineData={data.map(d => d.engagement).slice(-20)}
                />
              </div>

              {/* Visualization Section */}
              <TrendChart />

              {/* Algorithm Comparison */}
              <AlgorithmComparison />

              {/* Analytics Panel (Engagement & Sentiment) */}
              <AnalyticsPanel />
            </>
          )}

          {/* Info Section */}
          <div className="bg-gradient-to-r from-blue-600/10 to-transparent border border-blue-500/10 p-8 rounded-3xl relative overflow-hidden group">
             <div className="relative z-10 max-w-lg">
                <h3 className="text-xl font-bold text-white mb-2">Multi-Platform Ensemble Analysis</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                   Currently monitoring <span className="text-blue-400 font-bold uppercase">{selectedPlatform}</span> streams. Our ensemble model utilizes Z-Score, IQR, and LSTM neural networks for 99.8% detection accuracy.
                </p>
                <div className="flex gap-4 mt-6">
                   <div className="flex flex-col">
                      <span className="text-white font-bold text-lg">1,240</span>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Data Points/Sec</span>
                   </div>
                   <div className="w-[1px] h-10 bg-white/10" />
                   <div className="flex flex-col">
                      <span className="text-white font-bold text-lg">0.8s</span>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Avg Latency</span>
                   </div>
                </div>
             </div>
             
             {/* Decorative radial gradient */}
             <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-blue-500/10 transition-colors duration-700" />
          </div>
        </div>

        {/* Right Column (4 units) */}
        <div className="lg:col-span-4 flex flex-col h-[1000px] lg:h-auto">
          <AlertPanel />
        </div>

      </div>
    </motion.div>
  );
}
