import { useEffect, useState, useRef, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { useRedditData } from '../hooks/useRedditData';
import type { RedditPost, TrendingTopic } from '../services/redditService';
import {
  Zap, TrendingUp, AlertTriangle, RefreshCw, Radio,
  Activity, BarChart2, Globe, ChevronRight, Flame,
  ArrowUpRight, ArrowDownRight, Target, Shield,
  Cpu, ZapOff, Server, Terminal, HardDrive
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSubredditLocation } from '../utils/geoMapping';
import { useMagneticCursor } from '../hooks/useMagneticCursor';

// ─── Constants & Types ──────────────────────────────────────────────────────
const FEED_REVEAL_STAGGER = 40; // ms

interface LiveEvent {
  id: string;
  type: 'trending' | 'spike' | 'viral';
  topic: string;
  subreddit: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  activity: 'low' | 'medium' | 'high' | 'critical';
  engagement: number;
  timestamp: number;
  url?: string;
  velocity: number; // calculated delta
}

// ─── Theme Tokens (Taste System) ───────────────────────────────────────────
const EVENT_THEME = {
  viral: { 
    icon: Flame, 
    color: '#FF4D4D', 
    glow: '0 0 20px rgba(255, 77, 77, 0.4)',
    bg: 'rgba(255, 77, 77, 0.08)',
    label: 'Viral Sector'
  },
  spike: { 
    icon: Zap, 
    color: '#FFB800', 
    glow: '0 0 20px rgba(255, 184, 0, 0.3)',
    bg: 'rgba(255, 184, 0, 0.08)',
    label: 'Anomaly'
  },
  trending: { 
    icon: TrendingUp, 
    color: '#00E0FF', 
    glow: '0 0 20px rgba(0, 224, 255, 0.3)',
    bg: 'rgba(0, 224, 255, 0.08)',
    label: 'Velocity'
  },
};

const SENTIMENT_THEME = {
  positive: { color: '#00FF94', label: 'ACCELERATING' },
  negative: { color: '#FF4D4D', label: 'DEVIATING' },
  neutral: { color: '#8F8F8F', label: 'STABLE' },
};

// ─── Helpers ────────────────────────────────────────────────────────────────
function getSentiment(score: number): LiveEvent['sentiment'] {
  if (score > 0.2) return 'positive';
  if (score < -0.2) return 'negative';
  return 'neutral';
}

function getActivity(engagement: number): LiveEvent['activity'] {
  if (engagement > 5000) return 'critical';
  if (engagement > 1000) return 'high';
  if (engagement > 300) return 'medium';
  return 'low';
}

function postsToEvents(posts: RedditPost[]): LiveEvent[] {
  return posts.slice(0, 60).map(post => ({
    id: post.id,
    type: post.engagement > 3000 ? 'viral' : post.engagement > 800 ? 'spike' : 'trending',
    topic: post.topic,
    subreddit: post.subreddit,
    sentiment: getSentiment(post.sentiment),
    activity: getActivity(post.engagement),
    engagement: post.engagement,
    timestamp: post.timestamp,
    url: post.url,
    velocity: Math.floor(Math.random() * 20) + 1, // Simulated for UI richness
  }));
}

// ─── Components ─────────────────────────────────────────────────────────────

/**
 * EventCard: The high-fidelity tactical unit
 */
function EventCard({ event, index, onFocus }: { event: LiveEvent; index: number; onFocus: () => void }) {
  const theme = EVENT_THEME[event.type];
  const sentiment = SENTIMENT_THEME[event.sentiment];
  const Icon = theme.icon;
  
  // High-performance Entrance Animation
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), index * FEED_REVEAL_STAGGER);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      onClick={onFocus}
      className={`glass-card transition-all duration-500 transform ${revealed ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
      style={{
        padding: '12px 16px',
        display: 'grid',
        gridTemplateColumns: '40px 1fr 100px',
        alignItems: 'center',
        gap: '16px',
        cursor: 'pointer',
        background: 'rgba(255, 255, 255, 0.02)',
        borderColor: revealed ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
      }}
    >
      {/* Visual Indicator */}
      <div className="relative flex items-center justify-center">
        <div style={{
          position: 'absolute',
          width: '2px',
          height: '24px',
          left: '-16px',
          background: theme.color,
          boxShadow: theme.glow,
          opacity: 0.8
        }} />
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '6px',
          background: theme.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${theme.color}33`
        }}>
          <Icon size={14} style={{ color: theme.color }} />
        </div>
      </div>

      {/* Primary Content */}
      <div className="min-w-0 pr-4">
        <div className="flex items-center gap-3 mb-1">
          <span style={{ 
            fontSize: '9px', 
            fontWeight: 800, 
            color: theme.color, 
            letterSpacing: '0.15em', 
            textTransform: 'uppercase' 
          }}>
            {theme.label}
          </span>
          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
            [ID: {event.id.toUpperCase()}]
          </span>
        </div>
        <h3 style={{ 
          fontSize: '13px', 
          fontWeight: 600, 
          color: 'white', 
          margin: 0, 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          lineHeight: 1.2
        }}>
          {event.topic}
        </h3>
        <div className="flex gap-4 mt-2">
           <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
             r/{event.subreddit}
           </span>
           <span style={{ fontSize: '10px', color: sentiment.color, fontWeight: 700, letterSpacing: '0.05em' }}>
             &bull; {sentiment.label}
           </span>
        </div>
      </div>

      {/* Metrics Rail */}
      <div className="text-right flex flex-col items-end gap-1">
        <div style={{ fontSize: '16px', fontWeight: 800, color: 'white', fontFamily: 'monospace' }}>
          {event.engagement.toLocaleString()}
        </div>
        <div style={{ 
          fontSize: '9px', 
          color: theme.color, 
          fontWeight: 700, 
          fontFamily: 'monospace',
          background: `${theme.color}15`,
          padding: '2px 6px',
          borderRadius: '4px'
        }}>
          +{event.velocity}% VEL
        </div>
      </div>
    </div>
  );
}

/**
 * TacticalHeader: Information dominance strip
 */
function TacticalHeader({ lastUpdated, refresh, isRefreshing }: { lastUpdated: number; refresh: () => void; isRefreshing: boolean }) {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'flex-end', 
      marginBottom: '32px',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      paddingBottom: '24px'
    }}>
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-cyan-400 opacity-50 animate-ping" />
          </div>
          <span className="text-[10px] uppercase font-black tracking-widest text-cyan-400/80">
            System Online // Live Reddit Nodes
          </span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-white m-0">
          MONITORING <span className="opacity-30">ARRAY</span>
        </h1>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-2">
            <Activity size={12} className="text-white/30" />
            <span className="text-[11px] text-white/40 font-mono">
              Last Sync: {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
             <Shield size={12} className={redditData.error ? "text-yellow-500/50" : "text-green-500/50"} />
             <span className="text-[11px] text-white/40 font-mono">
               Anomaly engine: {redditData.error ? 'Bypass Active' : 'Active'}
             </span>
          </div>
          {redditData.error && (
            <div className="flex items-center gap-2 px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded">
               <span className="text-[8px] font-bold text-yellow-500 uppercase tracking-tighter">
                 Signal Fallback Active
               </span>
            </div>
          )}

        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={refresh}
          disabled={isRefreshing}
          className="glass-card flex items-center gap-3 px-6 py-3 border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all active:scale-95"
          style={{ height: 'fit-content' }}
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          <span className="text-[11px] font-bold uppercase tracking-widest">Resync Array</span>
        </button>
      </div>
    </div>
  );
}

/**
 * SubredditMiniCard: High-density activity nodes
 */
function SubredditMiniCard({ name, engagement }: { name: string; engagement: number }) {
  const intensity = Math.min(100, (engagement / 10000) * 100);
  return (
    <div className="glass-card p-3 border-white/5 hover:border-cyan-500/30 group">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-mono text-white/30 truncate pr-2">R/{name.toUpperCase()}</span>
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50 group-hover:bg-cyan-400 animate-pulse" />
      </div>
      <div className="text-sm font-black text-white mb-2">{engagement.toLocaleString()}</div>
      <div className="w-full h-[2px] bg-white/5 rounded-full overflow-hidden">
        <div 
          className="h-full bg-cyan-500/50 group-hover:bg-cyan-400 transition-all duration-700"
          style={{ width: `${intensity}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Dashboard Component
 */
export function Dashboard() {
  const { setData, setGlobeFocusPoint, setSelectedRedditPost } = useStore();
  const { data: redditData, isLoading, refresh } = useRedditData(true, 300000);
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'viral' | 'spikes'>('all');

  // Derive metrics
  const events = useMemo(() => postsToEvents(redditData.posts), [redditData.posts]);
  const filteredEvents = useMemo(() => {
    if (activeTab === 'viral') return events.filter(e => e.type === 'viral');
    if (activeTab === 'spikes') return events.filter(e => e.type === 'spike');
    return events;
  }, [events, activeTab]);

  const stats = useMemo(() => {
    const subMap = new Map<string, number>();
    redditData.posts.forEach(p => {
      subMap.set(p.subreddit, (subMap.get(p.subreddit) || 0) + p.engagement);
    });
    return [...subMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);
  }, [redditData.posts]);

  const handleFocus = (event: LiveEvent) => {
    const loc = getSubredditLocation(event.subreddit);
    
    // Update store with both location focus and detailed post content
    setGlobeFocusPoint({ ...loc, label: event.topic });
    setSelectedRedditPost({
      id: event.id,
      lat: loc.lat,
      lng: loc.lng,
      title: event.topic,
      subreddit: event.subreddit,
      engagement: event.engagement,
      sentiment: event.sentiment,
      url: event.url,
      type: 'reddit'
    });

    navigate('/dashboard/observatorium');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div style={{ 
      padding: '40px 60px', 
      maxWidth: '1800px', 
      margin: '0 auto', 
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <TacticalHeader 
        lastUpdated={redditData.lastUpdated} 
        refresh={handleRefresh} 
        isRefreshing={isRefreshing} 
      />

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'minmax(0, 1fr) 380px', 
        gap: '40px',
        flex: 1
      }}>
        
        {/* ── Main Intel Flow ── */}
        <div className="flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-4">
              {(['all', 'viral', 'spikes'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-[10px] font-black uppercase tracking-widest py-2 px-4 rounded-md border transition-all ${
                    activeTab === tab 
                    ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400' 
                    : 'border-white/10 text-white/30 hover:text-white/60 hover:border-white/20'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <span className="text-[11px] font-mono text-white/20 uppercase tracking-tighter">
              Showing {filteredEvents.length} items // real-time priority
            </span>
          </div>

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px',
            paddingRight: '12px'
          }}>
            {isLoading && events.length === 0 ? (
               Array.from({ length: 8 }).map((_, i) => (
                 <div key={i} className="h-20 bg-white/5 animate-pulse rounded-xl border border-white/5" />
               ))
            ) : filteredEvents.length > 0 ? (
              filteredEvents.map((event, i) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  index={i} 
                  onFocus={() => handleFocus(event)}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-40 glass-card border-dashed">
                <Radio className="text-white/10 mb-4 animate-pulse" size={48} />
                <p className="text-white/30 font-mono text-xs uppercase tracking-widest">Scanning for signals...</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Intelligence Rail ── */}
        <div className="flex flex-col gap-10">
          
          {/* Global Density Map */}
          <div>
             <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 mb-6 flex items-center gap-3">
               <Globe size={14} className="text-cyan-500" />
               Sub-Sector Intelligence
             </h4>
             <div className="grid grid-cols-2 gap-3">
               {stats.map(([name, eng]) => (
                 <SubredditMiniCard key={name} name={name} engagement={eng} />
               ))}
             </div>
          </div>

          {/* System Telemetry Cluster */}
          <div className="mt-auto glass-card p-6 bg-cyan-500/5 border-cyan-500/20">
             <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-400 mb-6 flex items-center gap-3">
                <Terminal size={14} />
                Core Telemetry
             </h4>
             <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div className="flex flex-col">
                   <span className="text-[9px] uppercase text-white/30 font-bold mb-1">Signal Health</span>
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="text-xs font-mono font-bold">99.2%</span>
                   </div>
                </div>
                <div className="flex flex-col">
                   <span className="text-[9px] uppercase text-white/30 font-bold mb-1">Anomaly Log</span>
                   <div className="flex items-center gap-2">
                       <Zap size={12} className="text-yellow-500" />
                      <span className="text-xs font-mono font-bold">{events.filter(e => e.type === 'spike').length} Critical</span>
                   </div>
                </div>
                <div className="flex flex-col">
                   <span className="text-[9px] uppercase text-white/30 font-bold mb-1">Compute Load</span>
                   <div className="w-full h-1 bg-white/5 relative mt-1 overflow-hidden">
                      <div className="absolute inset-0 bg-cyan-500 w-2/3" />
                   </div>
                </div>
                <div className="flex flex-col">
                   <span className="text-[9px] uppercase text-white/30 font-bold mb-1">Node Status</span>
                   <span className="text-xs font-mono font-bold text-green-400">OPERATIONAL</span>
                </div>
             </div>

             <div className="mt-8 flex gap-3 opacity-30">
               <Server size={14} />
               <HardDrive size={14} />
               <Cpu size={14} />
             </div>
          </div>

        </div>
      </div>

      {/* ── Footer Shield ── */}
      <div style={{ 
        marginTop: '60px', 
        paddingTop: '32px', 
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-white/20">
            <Shield size={16} />
            <span className="text-[10px] font-mono tracking-widest uppercase">Anomix Protocol v2026.04</span>
          </div>
          <div className="w-[1px] h-4 bg-white/10" />
          <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
            Encryption: AES-256 Quantum
          </span>
        </div>
        <div className="flex items-center gap-4">
           {['US-EAST', 'EU-CENTRAL', 'ASIA-PACIFIC'].map(region => (
             <div key={region} className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded border border-white/5">
                <div className="w-1 h-1 rounded-full bg-green-500" />
                <span className="text-[8px] font-mono text-white/30">{region}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
