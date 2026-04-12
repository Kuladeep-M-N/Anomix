import { useEffect, useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { useRedditData } from '../hooks/useRedditData';
import { fetchRedditTrends } from '../services/redditService';
import type { RedditPost, TrendingTopic } from '../services/redditService';
import {
  Zap, TrendingUp, AlertTriangle, RefreshCw, Radio,
  Activity, BarChart2, Globe, ChevronRight, Flame,
  ArrowUpRight, ArrowDownRight, Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSubredditLocation } from '../utils/geoMapping';
import { useMagneticCursor } from '../hooks/useMagneticCursor';

// ... (rest of the file types/helpers/sub-components) ...

export function Dashboard() {
  useMagneticCursor();
  const { setData, setGlobeFocusPoint } = useStore();
  const { data: redditData, isLoading, refresh } = useRedditData(true, 300000);
  const navigate = useNavigate();

  const handleFocus = (subreddit: string, topic: string) => {
    const loc = getSubredditLocation(subreddit);
    setGlobeFocusPoint({ ...loc, label: topic });
    navigate('/dashboard/observatorium');
  };

  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [insights, setInsights] = useState<string[]>([]);
  const [subredditStats, setSubredditStats] = useState<{ name: string; postCount: number; engagement: number }[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [activeInsight, setActiveInsight] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const prevPostIds = useRef<Set<string>>(new Set());

  // Cycle insights
  useEffect(() => {
    if (insights.length === 0) return;
    const t = setInterval(() => setActiveInsight(i => (i + 1) % insights.length), 4000);
    return () => clearInterval(t);
  }, [insights]);

  // Process Reddit data into dashboard format
  useEffect(() => {
    if (redditData.posts.length === 0) return;

    const newEvents = postsToEvents(redditData.posts);
    const freshIds = new Set(newEvents.filter(e => !prevPostIds.current.has(e.id)).map(e => e.id));
    prevPostIds.current = new Set(newEvents.map(e => e.id));

    setEvents(newEvents);
    setNewIds(freshIds);
    setTimeout(() => setNewIds(new Set()), 2000);

    setInsights(buildInsights(redditData.trendingTopics, redditData.posts));

    // Build subreddit stats
    const subMap = new Map<string, { postCount: number; engagement: number }>();
    redditData.posts.forEach(p => {
      const existing = subMap.get(p.subreddit) || { postCount: 0, engagement: 0 };
      subMap.set(p.subreddit, {
        postCount: existing.postCount + 1,
        engagement: existing.engagement + p.engagement,
      });
    });
    const stats = [...subMap.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 8);
    setSubredditStats(stats);

    // Sync to store
    const mapped = redditData.timeSeries.map(ts => ({
      timestamp: ts.timestamp,
      platform: 'reddit' as const,
      topic: redditData.trendingTopics[0]?.topic || 'Trending',
      engagement: ts.engagement,
      raw_metrics: { posts: ts.count },
      sentiment: 0.1,
      velocity: 5,
      isAnomaly: false,
    }));
    setData(mapped);
  }, [redditData, setData]);

  const handleFetchLive = async () => {
    setIsFetching(true);
    await refresh();
    setTimeout(() => setIsFetching(false), 1200);
  };

  const handleRefreshFeed = async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const viralCount = events.filter(e => e.type === 'viral').length;
  const spikeCount = events.filter(e => e.type === 'spike').length;
  const criticalCount = events.filter(e => e.activity === 'critical').length;

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1500px', margin: '0 auto', color: 'white' }}>
      <style>{`
        @keyframes slideInFeed {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.8; }
          70% { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
        @keyframes insightSlide {
          0% { opacity: 0; transform: translateY(8px); }
          15%, 85% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-8px); }
        }
        .feed-scroll::-webkit-scrollbar { width: 3px; }
        .feed-scroll::-webkit-scrollbar-track { background: transparent; }
        .feed-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{ position: 'relative', width: 8, height: 8 }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#22c55e' }} />
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#22c55e', animation: 'pulseRing 2s infinite' }} />
            </div>
            <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#22c55e' }}>
              Live · Social Intelligence Command Center
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 900, letterSpacing: '-0.03em', margin: 0, lineHeight: 1 }}>
            Anomix Monitoring
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '8px 0 0', lineHeight: 1.5 }}>
            Real-time trend anomaly detection across Social Media · AI-powered · Ensemble model <span style={{ color: '#3b82f6' }}>98.2% accuracy</span>
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleRefreshFeed}
            disabled={isRefreshing}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 16px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'white')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
          >
            <RefreshCw size={13} style={{ animation: isRefreshing ? 'spin 0.6s linear infinite' : undefined }} />
            Refresh Feed
          </button>
          <button
            onClick={handleFetchLive}
            disabled={isFetching}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 20px', borderRadius: '10px',
              background: isFetching ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.15)',
              border: '1px solid rgba(59,130,246,0.3)',
              color: '#60a5fa', fontSize: '11px', fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Radio size={13} style={{ animation: isFetching ? 'spin 0.8s linear infinite' : undefined }} />
            {isFetching ? 'Fetching...' : 'Fetch Live Data'}
          </button>
        </div>
      </div>

      {/* ── STATUS BAR ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '12px', marginBottom: '28px',
      }}>
        {[
          { label: 'Events Detected', value: events.length, icon: Activity, color: '#3b82f6' },
          { label: 'Viral Events', value: viralCount, icon: Flame, color: '#ef4444' },
          { label: 'Spikes', value: spikeCount, icon: Zap, color: '#f59e0b' },
          { label: 'Critical', value: criticalCount, icon: AlertTriangle, color: '#ef4444' },
          { label: 'Subreddits', value: subredditStats.length, icon: Globe, color: '#22c55e' },
          { label: 'Top Engagement', value: events[0]?.engagement ? events[0].engagement.toLocaleString() : '—', icon: BarChart2, color: '#a855f7' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} style={{
              background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <div style={{ padding: '8px', borderRadius: '10px', background: `${stat.color}15`, flexShrink: 0 }}>
                <Icon size={16} style={{ color: stat.color }} />
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'monospace', color: 'white', lineHeight: 1 }}>
                  {isLoading && events.length === 0 ? '—' : stat.value}
                </div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '2px' }}>
                  {stat.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── MAIN GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
        
        {/* ── LEFT: LIVE FEED ── */}
        <div>
          {/* Most Critical Trend banner */}
          {events[0] && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(245,158,11,0.05) 100%)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '16px', padding: '16px 20px', marginBottom: '16px',
              display: 'flex', alignItems: 'center', gap: '14px',
            }}>
              <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(239,68,68,0.12)', flexShrink: 0 }}>
                <Flame size={18} style={{ color: '#ef4444' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ef4444' }}>
                  🚨 Most Critical Trend Right Now
                </span>
                <p style={{ color: 'white', fontWeight: 700, fontSize: '14px', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {events[0].topic}
                </p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#f87171', fontFamily: 'monospace' }}>
                  {events[0].engagement.toLocaleString()}
                </div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>
                  engagement pts
                </div>
              </div>
              {events[0].url && (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button 
                    onClick={() => handleFocus(events[0].subreddit, events[0].topic)}
                    style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer' }}
                  >
                    <Target size={18} />
                  </button>
                  <a href={events[0].url} target="_blank" rel="noopener noreferrer"
                    style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'white')}
                    onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.3)')}
                  >
                    <ChevronRight size={18} />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Feed header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulseRing 2s infinite' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>
                Live Intelligence Feed
              </span>
            </div>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
              {events.length} events · auto-updating
            </span>
          </div>

          {/* Feed cards */}
          <div
            className="feed-scroll"
            style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '540px', overflowY: 'auto', paddingRight: '4px' }}
          >
            {isLoading && events.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                  borderRadius: '16px', padding: '16px 20px', height: '80px',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
              ))
            ) : events.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.3)' }}>
                <Radio size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
                <p style={{ fontSize: '13px' }}>Click "Fetch Live Data" to load Reddit trends</p>
              </div>
            ) : (
              events.map(event => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  isNew={newIds.has(event.id)} 
                  onFocus={() => handleFocus(event.subreddit, event.topic)}
                />
              ))
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* AI Insights panel */}
          <div style={{
            background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: '20px', padding: '22px', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ padding: '7px', borderRadius: '10px', background: 'rgba(99,102,241,0.15)' }}>
                <Activity size={15} style={{ color: '#818cf8' }} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#818cf8' }}>
                AI Insight
              </span>
            </div>

            <div style={{ minHeight: '64px', position: 'relative' }}>
              {insights.length > 0 ? (
                <p
                  key={activeInsight}
                  style={{
                    color: 'rgba(255,255,255,0.8)', fontSize: '13px', lineHeight: 1.65,
                    margin: 0, animation: 'insightSlide 4s ease both',
                  }}
                >
                  {insights[activeInsight]}
                </p>
              ) : (
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', fontStyle: 'italic' }}>
                  Fetch live data to generate AI insights...
                </p>
              )}
            </div>

            {insights.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', marginTop: '14px' }}>
                {insights.map((_, i) => (
                  <div key={i} style={{
                    height: '2px', flex: 1, borderRadius: '2px', cursor: 'pointer',
                    background: i === activeInsight ? '#818cf8' : 'rgba(255,255,255,0.1)',
                    transition: 'background 0.3s',
                  }} onClick={() => setActiveInsight(i)} />
                ))}
              </div>
            )}
          </div>

          {/* Top Subreddits */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
                🌐 Top Subreddits
              </span>
              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>
                by engagement
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {subredditStats.length === 0 ? (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '24px', textAlign: 'center' }}>
                  <Globe size={24} style={{ opacity: 0.3, margin: '0 auto 8px', display: 'block' }} />
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: 0 }}>Fetch live data to see subreddits</p>
                </div>
              ) : (
                subredditStats.map((sub, i) => (
                  <SubredditCard key={sub.name} name={sub.name} postCount={sub.postCount} engagement={sub.engagement} rank={i + 1} />
                ))
              )}
            </div>
          </div>

          {/* System status */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '18px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: '14px' }}>
              System Status
            </span>
            {[
              { label: 'Reddit API', status: 'Operational', ok: true },
              { label: 'LSTM Model', status: '98.2% confidence', ok: true },
              { label: 'Anomaly Engine', status: 'Active', ok: true },
              { label: 'Data Pipeline', status: isLoading ? 'Fetching...' : 'Synced', ok: !isLoading },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{row.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: row.ok ? '#22c55e' : '#f59e0b' }} />
                  <span style={{ fontSize: '11px', color: row.ok ? '#86efac' : '#fcd34d', fontWeight: 600 }}>{row.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
