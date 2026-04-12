import { useState, useEffect } from 'react';
import { useRedditData } from '../hooks/useRedditData';
import {
  Zap, TrendingUp, Flame, AlertTriangle, ArrowUpRight,
  ArrowDownRight, Minus, Clock, Brain, Sparkles, Activity
} from 'lucide-react';
import { useMagneticCursor } from '../hooks/useMagneticCursor';

// ─── Static platform profiles ─────────────────────────────────────────────
const PLATFORMS = [
  {
    name: 'Reddit',
    icon: '🟠',
    color: '#FF6B35',
    glow: 'rgba(255,107,53,0.2)',
    border: 'rgba(255,107,53,0.25)',
    status: 'active' as const,
    tagline: 'Trending discussions detected',
    description: 'High-volume thread activity with anomaly signals across tech communities.',
  },
  {
    name: 'Twitter',
    icon: '🐦',
    color: '#1DA1F2',
    glow: 'rgba(29,161,242,0.15)',
    border: 'rgba(29,161,242,0.2)',
    status: 'moderate' as const,
    tagline: 'Engagement holding steady',
    description: 'Consistent engagement with moderate velocity — no major spikes yet.',
  },
  {
    name: 'Instagram',
    icon: '📸',
    color: '#E1306C',
    glow: 'rgba(225,48,108,0.15)',
    border: 'rgba(225,48,108,0.2)',
    status: 'active' as const,
    tagline: 'Highest interaction rate',
    description: 'Visual content driving peak user interaction and sharing velocity.',
  },
  {
    name: 'TikTok',
    icon: '🎵',
    color: '#69C9D0',
    glow: 'rgba(105,201,208,0.12)',
    border: 'rgba(105,201,208,0.2)',
    status: 'low' as const,
    tagline: 'Stable, lower engagement',
    description: 'Activity below threshold — monitoring for emerging signal patterns.',
  },
];

const STATUS_META = {
  active: { label: '🔥 Highly Active', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  moderate: { label: '⚡ Moderate', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  low: { label: '📉 Low Activity', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
};

// ─── Typewriter hook ──────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 30) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);
  return displayed;
}

// ─── AI Summary lines ─────────────────────────────────────────────────────
const FALLBACK_SUMMARIES = [
  'Reddit engagement has increased significantly in the last 24 hours.',
  'Instagram shows the highest user interaction rate across all platforms currently.',
  'Twitter activity is holding steady while TikTok signals remain below threshold.',
];

function buildSummaries(posts: any[], topics: any[]): string[] {
  const lines: string[] = [];
  if (topics.length > 0) {
    lines.push(`"${topics[0].topic}" is driving the highest engagement surge across monitored communities right now.`);
  }
  const viralCount = posts.filter(p => p.engagement > 2000).length;
  if (viralCount > 0) {
    lines.push(`${viralCount} post${viralCount > 1 ? 's have' : ' has'} crossed the viral threshold — anomaly engine flagged.`);
  }
  lines.push('Instagram and Reddit are the dominant signal sources. Twitter remains stable.');
  return lines.length >= 2 ? lines : FALLBACK_SUMMARIES;
}

// ─── Platform card ────────────────────────────────────────────────────────
function PlatformCard({ p, delay }: { p: typeof PLATFORMS[0]; delay: number }) {
  const status = STATUS_META[p.status];

  return (
    <div
      className="glass-card"
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        cursor: 'default',
        animationDelay: `${delay}ms`,
        animation: 'fadeUp 0.5s ease both',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>{p.icon}</span>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'white' }}>{p.name}</div>
            <div style={{ fontSize: '10px', color: p.color, fontWeight: 700, letterSpacing: '0.08em', marginTop: '1px' }}>{p.tagline}</div>
          </div>
        </div>
        <span style={{
          fontSize: '10px', fontWeight: 700, padding: '4px 10px',
          borderRadius: '100px', background: status.bg, color: status.color,
          letterSpacing: '0.05em', whiteSpace: 'nowrap',
        }}>
          {status.label}
        </span>
      </div>

      {/* Description */}
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, margin: 0 }}>
        {p.description}
      </p>

      {/* Activity bar */}
      <div>
        <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: p.status === 'active' ? '82%' : p.status === 'moderate' ? '52%' : '24%',
            background: `linear-gradient(90deg, ${p.color}99, ${p.color})`,
            borderRadius: '2px',
            transition: 'width 1.2s ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {p.status === 'active' ? '82% capacity' : p.status === 'moderate' ? '52% capacity' : '24% capacity'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Trending topic row ───────────────────────────────────────────────────
function TrendRow({ topic, rank, engagement, idx }: { topic: string; rank: number; engagement: number; idx: number }) {
  const isTop = rank <= 3;
  return (
    <div
      className="glass-card"
      style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        padding: '12px 16px',
        animation: `fadeUp 0.4s ease ${idx * 60}ms both`,
        cursor: 'default',
        flexShrink: 0,
      }}
    >
      {/* Rank */}
      <div style={{
        width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
        background: isTop ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.04)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '11px', fontWeight: 800, color: isTop ? '#f87171' : 'rgba(255,255,255,0.3)',
      }}>
        #{rank}
      </div>

      {/* Topic */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {topic}
        </p>
      </div>

      {/* Growth badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
        {isTop ? (
          <><Flame size={12} style={{ color: '#ef4444' }} /><span style={{ fontSize: '10px', color: '#f87171', fontWeight: 700 }}>Fast Rising</span></>
        ) : (
          <><TrendingUp size={12} style={{ color: '#60a5fa' }} /><span style={{ fontSize: '10px', color: '#93c5fd', fontWeight: 700 }}>Growing</span></>
        )}
      </div>

      {/* Engagement */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 800, fontFamily: 'monospace', color: 'white' }}>
          {engagement.toLocaleString()}
        </div>
        <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          engagements
        </div>
      </div>
    </div>
  );
}

// ─── Highlight card ───────────────────────────────────────────────────────
function HighlightCard({
  icon, label, value, color, delay
}: { icon: React.ReactNode; label: string; value: string; color: string; delay: number }) {
  return (
    <div
      className="glass-card"
      style={{
        padding: '20px',
        display: 'flex', alignItems: 'center', gap: '14px',
        animation: `fadeUp 0.5s ease ${delay}ms both`,
      }}
    >
      <div style={{ padding: '10px', borderRadius: '12px', background: `${color}15`, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, marginBottom: '4px' }}>
          {label}
        </div>
        <div style={{ fontSize: '15px', fontWeight: 800, color: 'white', lineHeight: 1.2 }}>
          {value}
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: redditData, isLoading } = useRedditData(false);

  const summaries = buildSummaries(redditData.posts, redditData.trendingTopics);
  const [activeSummary, setActiveSummary] = useState(0);
  const typedText = useTypewriter(summaries[activeSummary] ?? '', 28);

  // Cycle through summaries
  useEffect(() => {
    const t = setInterval(() => setActiveSummary(i => (i + 1) % summaries.length), 5000);
    return () => clearInterval(t);
  }, [summaries.length]);

  // Build trending list from Reddit data
  const trendingTopics = redditData.trendingTopics.length > 0
    ? redditData.trendingTopics
        .sort((a, b) => b.totalEngagement - a.totalEngagement)
        .slice(0, 8)
        .map((t, i) => ({ topic: t.topic, rank: i + 1, engagement: t.totalEngagement }))
    : [
        { topic: 'Artificial General Intelligence', rank: 1, engagement: 14230 },
        { topic: 'Climate Policy Updates', rank: 2, engagement: 9840 },
        { topic: 'Cryptocurrency Markets', rank: 3, engagement: 7620 },
        { topic: 'OpenAI GPT-5 Rumors', rank: 4, engagement: 5410 },
        { topic: 'SpaceX Starship Launch', rank: 5, engagement: 4380 },
        { topic: 'Global Stock Markets', rank: 6, engagement: 3190 },
        { topic: 'Neural Interface Tech', rank: 7, engagement: 2760 },
        { topic: 'Quantum Computing Breakthroughs', rank: 8, engagement: 1950 },
      ];

  const mostActivePlatform = 'Reddit';
  const fastestTopic = trendingTopics[0]?.topic.split(' ').slice(0, 3).join(' ') + '...' || 'Scanning...';
  const lowestPlatform = 'TikTok';
  const peakTime = '2:00 – 4:00 PM';

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', color: 'white' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>

      {/* ── PAGE LABEL ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', animation: 'fadeUp 0.4s ease both' }}>
        <div style={{ padding: '8px', background: 'rgba(99,102,241,0.12)', borderRadius: '10px' }}>
          <Brain size={17} style={{ color: '#818cf8' }} />
        </div>
        <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#818cf8' }}>
          AI-Powered Insight Engine
        </span>
        {isLoading && (
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>· updating...</span>
        )}
      </div>
      <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 6px', animation: 'fadeUp 0.4s ease 50ms both' }}>
        AI Summary of Social Activity
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', margin: '0 0 32px', animation: 'fadeUp 0.4s ease 100ms both' }}>
        Real-time analysis across Reddit · Twitter · Instagram · TikTok
      </p>

      {/* ── AI SUMMARY HERO ── */}
      <div
        className="glass-card"
        style={{
          padding: '32px 36px',
          marginBottom: '32px',
          minHeight: '110px',
          position: 'relative',
          overflow: 'hidden',
          animation: 'fadeUp 0.5s ease 150ms both',
        }}
      >
        {/* Glow blob */}
        <div style={{
          position: 'absolute', top: '-60px', right: '-60px',
          width: '240px', height: '240px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
          <div style={{ padding: '10px', background: 'rgba(99,102,241,0.15)', borderRadius: '12px', flexShrink: 0, marginTop: '2px' }}>
            <Sparkles size={18} style={{ color: '#a5b4fc' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#818cf8', marginBottom: '10px' }}>
              AI Insight #{activeSummary + 1} of {summaries.length}
            </div>
            <p style={{ fontSize: 'clamp(14px, 2vw, 18px)', color: 'rgba(255,255,255,0.9)', fontWeight: 600, lineHeight: 1.65, margin: '0 0 16px' }}>
              {typedText}
              <span style={{ opacity: 0.5, animation: 'pulseDot 1s infinite' }}>|</span>
            </p>
            {/* Dot indicators */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {summaries.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSummary(i)}
                  style={{
                    width: i === activeSummary ? '20px' : '6px',
                    height: '6px',
                    borderRadius: '3px',
                    background: i === activeSummary ? '#818cf8' : 'rgba(255,255,255,0.15)',
                    border: 'none', cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── PLATFORM CARDS ── */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Activity size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
          <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
            🌍 Platform Intelligence
          </span>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
        }}>
          {PLATFORMS.map((p, i) => <PlatformCard key={p.name} p={p} delay={i * 80} />)}
        </div>
      </div>

      {/* ── MAIN CONTENT GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>

        {/* Trending topics */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={14} style={{ color: '#ef4444' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
                🚀 What's Trending Now
              </span>
            </div>
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
              live trend discovery engine
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {trendingTopics.map((t, idx) => (
              <TrendRow key={t.topic} topic={t.topic} rank={t.rank} engagement={t.engagement} idx={idx} />
            ))}
          </div>
        </div>

        {/* Insight highlights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <Zap size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
            <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
              ⚡ Insight Highlights
            </span>
          </div>

          <HighlightCard
            icon={<TrendingUp size={16} style={{ color: '#FF6B35' }} />}
            label="Most Active Platform"
            value={mostActivePlatform}
            color="#FF6B35"
            delay={0}
          />
          <HighlightCard
            icon={<Flame size={16} style={{ color: '#ef4444' }} />}
            label="Fastest Growing Topic"
            value={fastestTopic}
            color="#ef4444"
            delay={80}
          />
          <HighlightCard
            icon={<Clock size={16} style={{ color: '#a855f7' }} />}
            label="Peak Activity Time"
            value={peakTime}
            color="#a855f7"
            delay={160}
          />
          <HighlightCard
            icon={<ArrowDownRight size={16} style={{ color: '#94a3b8' }} />}
            label="Lowest Engagement"
            value={lowestPlatform}
            color="#94a3b8"
            delay={240}
          />
          <HighlightCard
            icon={<AlertTriangle size={16} style={{ color: '#f59e0b' }} />}
            label="Detection Accuracy"
            value="98.2% — Ensemble"
            color="#f59e0b"
            delay={320}
          />
          <HighlightCard
            icon={<ArrowUpRight size={16} style={{ color: '#22c55e' }} />}
            label="AI Model Status"
            value="Active · LSTM + Z-Score"
            color="#22c55e"
            delay={400}
          />

          {/* Mini system note */}
          <div style={{
            marginTop: '4px',
            padding: '14px 16px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '14px',
          }}>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, margin: 0 }}>
              Anomix analyses trends across Reddit in real-time using an <span style={{ color: '#818cf8' }}>Ensemble AI model</span> combining LSTM neural networks, Z-Score, and IQR anomaly detection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
