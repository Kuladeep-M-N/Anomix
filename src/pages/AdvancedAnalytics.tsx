/**
 * AdvancedAnalytics.tsx
 * Anomix – Velocity Intelligence Grid (Tabular Protocol)
 * Google Trends-style columnar layout with Cyber-Minimalist War Room aesthetic.
 * 
 * Protocol: leonxlnx/taste + pbakaus/impeccable + emilkowalski/skill springs
 * ZERO external data fetching — fully hardcoded mock dataset (15 entries).
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Globe, Clock, Tag, Search, Filter, Download, ChevronDown,
  ArrowUpRight, ArrowDownRight, Minus, Zap, Activity, TrendingUp
} from 'lucide-react';

// ─── Mock Data (15 Hardcoded Trend Entries) ─────────────────────────────────

interface TrendEntry {
  rank: number;
  query: string;
  volume: string;
  velocity: string;
  velocityDir: 'up' | 'down' | 'flat' | 'breakout';
  sparklinePoints: string; // SVG polyline points
  sparklineType: 'spike' | 'surge' | 'decline' | 'wave' | 'steady';
  started: string;
  status: 'Active';
  breakdown: string[];
  source: 'Google' | 'Reddit' | 'Twitter';
  category: string;
}

const TREND_DATA: TrendEntry[] = [
  {
    rank: 1, query: 'AGI Leak — OpenAI Internal Memo', volume: '2M+', velocity: '+3,550%',
    velocityDir: 'breakout', sparklinePoints: '0,45 10,42 20,38 30,20 40,5 50,2 60,8 70,12',
    sparklineType: 'spike', started: '2h ago', status: 'Active',
    breakdown: ['GPT-5 benchmarks', 'Altman leak', '+ 161 more'], source: 'Reddit', category: 'AI'
  },
  {
    rank: 2, query: 'Meta Quest 4 Pro — Launch Announcement', volume: '1.5M+', velocity: '+2,850%',
    velocityDir: 'breakout', sparklinePoints: '0,40 10,35 20,28 30,15 40,8 50,10 60,14 70,18',
    sparklineType: 'surge', started: '3h ago', status: 'Active',
    breakdown: ['Quest 4 specs', 'Mixed reality OS', '+ 76 more'], source: 'Twitter', category: 'Tech'
  },
  {
    rank: 3, query: 'IPL Anomaly — Match Fixing Allegations', volume: '900k+', velocity: '+1,900%',
    velocityDir: 'up', sparklinePoints: '0,44 10,40 20,32 30,22 40,14 50,12 60,15 70,18',
    sparklineType: 'surge', started: '4h ago', status: 'Active',
    breakdown: ['CSK vs DC', 'BCCI investigation', '+ 54 more'], source: 'Twitter', category: 'Sports'
  },
  {
    rank: 4, query: 'Crypto Crash — Bitcoin 22% Drop', volume: '750k+', velocity: '+1,200%',
    velocityDir: 'up', sparklinePoints: '0,30 10,28 20,22 30,18 40,25 50,35 60,38 70,40',
    sparklineType: 'wave', started: '5h ago', status: 'Active',
    breakdown: ['BTC liquidations', 'ETH corr', '+ 88 more'], source: 'Reddit', category: 'Finance'
  },
  {
    rank: 5, query: 'SpaceX Starship — Orbital Test Success', volume: '550k+', velocity: '+990%',
    velocityDir: 'up', sparklinePoints: '0,42 10,36 20,25 30,12 40,6 50,8 60,10 70,14',
    sparklineType: 'spike', started: '6h ago', status: 'Active',
    breakdown: ['Mars trajectory', 'Booster recovery', '+ 41 more'], source: 'Reddit', category: 'Space'
  },
  {
    rank: 6, query: 'Llama 4 Benchmarks — Meta AI', volume: '400k+', velocity: '+780%',
    velocityDir: 'up', sparklinePoints: '0,38 10,32 20,26 30,20 40,15 50,18 60,22 70,26',
    sparklineType: 'wave', started: '8h ago', status: 'Active',
    breakdown: ['LLM comparison', 'Claude vs Llama', '+ 29 more'], source: 'Reddit', category: 'AI'
  },
  {
    rank: 7, query: 'WW3 Alert — NATO Emergency Session', volume: '300k+', velocity: '+650%',
    velocityDir: 'up', sparklinePoints: '0,35 10,28 20,18 30,8 40,5 50,7 60,12 70,20',
    sparklineType: 'spike', started: '10h ago', status: 'Active',
    breakdown: ['Ukraine escalation', 'Russia sanctions', '+ 112 more'], source: 'Twitter', category: 'Geopolitics'
  },
  {
    rank: 8, query: 'Apple WWDC 2025 — iOS 19 Leaks', volume: '250k+', velocity: '+420%',
    velocityDir: 'up', sparklinePoints: '0,40 10,36 20,30 30,24 40,20 50,22 60,26 70,30',
    sparklineType: 'wave', started: '11h ago', status: 'Active',
    breakdown: ['Siri overhaul', 'Vision Pro gen 2', '+ 33 more'], source: 'Twitter', category: 'Tech'
  },
  {
    rank: 9, query: 'Nvidia RTX 5090 — Stock Alert', volume: '200k+', velocity: '+380%',
    velocityDir: 'up', sparklinePoints: '0,44 10,40 20,34 30,26 40,20 50,22 60,25 70,28',
    sparklineType: 'steady', started: '13h ago', status: 'Active',
    breakdown: ['GPU benchmark leak', 'Jensen Huang', '+ 18 more'], source: 'Reddit', category: 'Hardware'
  },
  {
    rank: 10, query: 'DeepSeek R2 — China AI Dominance', volume: '180k+', velocity: '+290%',
    velocityDir: 'up', sparklinePoints: '0,42 10,36 20,28 30,22 40,18 50,20 60,23 70,26',
    sparklineType: 'wave', started: '14h ago', status: 'Active',
    breakdown: ['Reasoning benchmark', 'US export ban', '+ 22 more'], source: 'Google', category: 'AI'
  },
  {
    rank: 11, query: 'Tesla Cybertruck Recall — Safety Issue', volume: '150k+', velocity: '+180%',
    velocityDir: 'up', sparklinePoints: '0,36 10,38 20,40 30,42 40,38 50,34 60,30 70,28',
    sparklineType: 'decline', started: '16h ago', status: 'Active',
    breakdown: ['NHTSA investigation', 'Musk response', '+ 14 more'], source: 'Twitter', category: 'Automotive'
  },
  {
    rank: 12, query: 'Fed Rate Cut — Emergency Meeting', volume: '120k+', velocity: '+140%',
    velocityDir: 'up', sparklinePoints: '0,32 10,30 20,28 30,26 40,24 50,25 60,27 70,30',
    sparklineType: 'steady', started: '18h ago', status: 'Active',
    breakdown: ['Jerome Powell', 'Inflation data', '+ 9 more'], source: 'Google', category: 'Finance'
  },
  {
    rank: 13, query: 'GitHub Copilot Workspace — GA Launch', volume: '90k+', velocity: '+95%',
    velocityDir: 'up', sparklinePoints: '0,30 10,28 20,25 30,23 40,22 50,24 60,27 70,30',
    sparklineType: 'steady', started: '19h ago', status: 'Active',
    breakdown: ['AI coding agent', 'VS Code integration', '+ 6 more'], source: 'Reddit', category: 'Dev'
  },
  {
    rank: 14, query: 'GTA 6 — Leaked Gameplay Footage', volume: '80k+', velocity: '-20%',
    velocityDir: 'down', sparklinePoints: '0,10 10,14 20,18 30,24 40,30 50,34 60,36 70,38',
    sparklineType: 'decline', started: '21h ago', status: 'Active',
    breakdown: ['Rockstar response', 'Release date', '+ 197 more'], source: 'Twitter', category: 'Gaming'
  },
  {
    rank: 15, query: 'WHO Pandemic Alert — Novel Pathogen', volume: '60k+', velocity: '+55%',
    velocityDir: 'flat', sparklinePoints: '0,28 10,27 20,26 30,26 40,27 50,28 60,28 70,29',
    sparklineType: 'steady', started: '23h ago', status: 'Active',
    breakdown: ['Southeast Asia origin', 'Travel advisory', '+ 31 more'], source: 'Google', category: 'Health'
  }
];

// ─── Sparkline SVG Component ─────────────────────────────────────────────────

const SPARKLINE_COLORS = {
  spike: '#10b981',
  surge: '#06b6d4',
  decline: '#ef4444',
  wave: '#8b5cf6',
  steady: '#6b7280',
};

function Sparkline({ points, type }: { points: string; type: TrendEntry['sparklineType'] }) {
  const color = SPARKLINE_COLORS[type];
  return (
    <svg width="80" height="40" viewBox="0 0 70 50" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`grad-${type}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Velocity Badge ──────────────────────────────────────────────────────────

function VelocityBadge({ value, dir }: { value: string; dir: TrendEntry['velocityDir'] }) {
  const config = {
    breakout: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', text: '#10b981', icon: <Zap size={10} className="inline mb-0.5" /> },
    up:       { bg: 'rgba(6,182,212,0.08)',  border: 'rgba(6,182,212,0.25)',  text: '#06b6d4', icon: <ArrowUpRight size={10} className="inline mb-0.5" /> },
    down:     { bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)',  text: '#ef4444', icon: <ArrowDownRight size={10} className="inline mb-0.5" /> },
    flat:     { bg: 'rgba(107,114,128,0.08)',border: 'rgba(107,114,128,0.2)', text: '#6b7280', icon: <Minus size={10} className="inline mb-0.5" /> },
  };
  const c = config[dir];
  return (
    <span style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text, fontFamily: "'JetBrains Mono', monospace", fontVariantNumeric: 'tabular-nums' }}>
      {c.icon}{value}
    </span>
  );
}

// ─── Source Badge ─────────────────────────────────────────────────────────────

const SOURCE_CONFIG = {
  Google:  { color: '#60a5fa', dot: '#3b82f6' },
  Reddit:  { color: '#f97316', dot: '#ea580c' },
  Twitter: { color: '#a78bfa', dot: '#8b5cf6' },
};
function SourceBadge({ source }: { source: TrendEntry['source'] }) {
  const c = SOURCE_CONFIG[source];
  return (
    <span className="inline-flex items-center gap-1.5" style={{ color: c.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
      <span className="text-[9px] font-bold uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{source}</span>
    </span>
  );
}

// ─── Dropdown Component ───────────────────────────────────────────────────────

function FilterDropdown({ icon, label, options }: { icon: React.ReactNode; label: string; options: string[] }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(options[0]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all group"
        style={{
          background: open ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${open ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)'}`,
          color: '#c4c4c4',
          transition: 'all 0.15s ease',
        }}
      >
        <span className="text-cyan-400/70">{icon}</span>
        <span className="uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px' }}>{selected}</span>
        <ChevronDown size={10} className="opacity-50" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s ease' }} />
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 min-w-max rounded-xl shadow-2xl overflow-hidden"
          style={{ background: 'rgba(8,8,12,0.95)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
          {options.map((opt) => (
            <button key={opt} onClick={() => { setSelected(opt); setOpen(false); }}
              className="w-full px-4 py-2.5 text-left text-xs transition-colors"
              style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
                background: opt === selected ? 'rgba(6,182,212,0.1)' : 'transparent',
                color: opt === selected ? '#06b6d4' : '#9ca3af',
              }}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Table Row Component ──────────────────────────────────────────────────────

function TrendRow({ entry, index }: { entry: TrendEntry; index: number }) {
  const [hovered, setHovered] = useState(false);
  const rowRef = useRef<HTMLTableRowElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 55);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <tr
      ref={rowRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
        transition: 'all 0.25s var(--spring-snappy, ease)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0px)' : 'translateY(12px)',
        cursor: 'default',
      }}
    >
      {/* RANK */}
      <td className="py-4 pl-6 pr-3 w-12">
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontVariantNumeric: 'tabular-nums',
          fontSize: '12px', fontWeight: 700,
          color: entry.rank <= 3 ? '#06b6d4' : 'rgba(255,255,255,0.3)',
        }}>
          {String(entry.rank).padStart(2, '0')}
        </span>
      </td>

      {/* QUERY + SOURCE */}
      <td className="py-4 pr-6" style={{ minWidth: '260px' }}>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white/90 leading-tight hover:text-cyan-400 transition-colors cursor-pointer">
              {entry.query}
            </span>
            <SourceBadge source={entry.source} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
            style={{ color: 'rgba(255,255,255,0.2)', fontFamily: "'JetBrains Mono', monospace" }}>
            {entry.category}
          </span>
        </div>
      </td>

      {/* SEARCH VOLUME */}
      <td className="py-4 pr-8" style={{ minWidth: '100px' }}>
        <div className="flex flex-col gap-0.5">
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontVariantNumeric: 'tabular-nums', fontSize: '13px', fontWeight: 700, color: '#f1f5f9' }}>
            {entry.volume}
          </span>
          <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: "'JetBrains Mono', monospace" }}>searches</span>
        </div>
      </td>

      {/* VELOCITY */}
      <td className="py-4 pr-8" style={{ minWidth: '110px' }}>
        <VelocityBadge value={entry.velocity} dir={entry.velocityDir} />
      </td>

      {/* STARTED */}
      <td className="py-4 pr-8" style={{ minWidth: '100px' }}>
        <div className="flex flex-col gap-0.5">
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontVariantNumeric: 'tabular-nums', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
            {entry.started}
          </span>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" style={{ animation: 'pulse 2s infinite', boxShadow: '0 0 6px rgba(52,211,153,0.6)' }} />
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Active</span>
          </div>
        </div>
      </td>

      {/* TREND BREAKDOWN */}
      <td className="py-4 pr-6" style={{ minWidth: '240px' }}>
        <div className="flex flex-col gap-1">
          {entry.breakdown.map((item, i) => (
            <span key={i} className="text-xs transition-colors"
              style={{ color: i < 2 ? 'rgba(255,255,255,0.5)' : '#06b6d4', cursor: 'pointer', fontFamily: i === 2 ? "'JetBrains Mono', monospace" : 'Inter, sans-serif', fontSize: i === 2 ? '10px' : '11px' }}>
              {item}
            </span>
          ))}
        </div>
      </td>

      {/* SPARKLINE */}
      <td className="py-4 pr-6" style={{ minWidth: '100px' }}>
        <Sparkline points={entry.sparklinePoints} type={entry.sparklineType} />
      </td>
    </tr>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

const CLOCK_TICK = 1000;

export function AdvancedAnalytics() {
  const [clock, setClock] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'volume' | 'velocity'>('relevance');
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), CLOCK_TICK);
    const hTimer = setTimeout(() => setHeaderVisible(true), 100);
    return () => { clearInterval(timer); clearTimeout(hTimer); };
  }, []);

  const filtered = TREND_DATA.filter(t =>
    t.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'volume') {
      const parseVol = (v: string) => parseFloat(v.replace(/[^0-9.]/g, '')) * (v.includes('M') ? 1000 : v.includes('k') ? 1 : 0.001);
      return parseVol(b.volume) - parseVol(a.volume);
    }
    if (sortBy === 'velocity') {
      const parseVel = (v: string) => v === 'Breakout' ? 9999 : parseFloat(v.replace(/[^0-9.\-]/g, ''));
      return parseVel(b.velocity) - parseVel(a.velocity);
    }
    return a.rank - b.rank;
  });

  const formatClock = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-void, #030303)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div style={{
        background: 'rgba(3,3,5,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 40,
        opacity: headerVisible ? 1 : 0, transform: headerVisible ? 'translateY(0)' : 'translateY(-12px)',
        transition: 'all 0.5s var(--spring-snappy, ease)',
      }}>
        
        {/* Status bar */}
        <div className="flex items-center justify-between px-6 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="flex items-center gap-2">
            <Activity size={10} className="text-emerald-400" />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em' }}>
              ANOMIX // VELOCITY_INTELLIGENCE_GRID // LIVE
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em' }}>
              LATENCY: 24ms
            </span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: '#06b6d4', letterSpacing: '0.1em' }}>
              {formatClock(clock)}
            </span>
          </div>
        </div>

        {/* Main header */}
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-1.5 rounded-lg" style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}>
                <TrendingUp size={16} className="text-cyan-400" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">Advanced Analytics</h1>
              <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', color: '#06b6d4', fontFamily: "'JetBrains Mono', monospace" }}>
                INTEL FEED
              </span>
            </div>
            <p className="text-xs text-white/30 tracking-wide">High-density velocity intelligence for emerging signals and anomaly events</p>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px rgba(52,211,153,0.6)' }} />
            Trends Updated {clock.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 flex-wrap px-6 pb-4">
          <FilterDropdown icon={<Globe size={11} />} label="Region" options={['Global', 'India', 'USA', 'Europe', 'Asia Pacific', 'Latin America']} />
          <FilterDropdown icon={<Clock size={11} />} label="Timeframe" options={['Past 24 hours', 'Past 7 days', 'Past 30 days', 'Past 90 days', 'Custom range']} />
          <FilterDropdown icon={<Tag size={11} />} label="Category" options={['All categories', 'AI / Tech', 'Finance', 'Sports', 'Geopolitics', 'Gaming', 'Health', 'Dev']} />
          <FilterDropdown icon={<Search size={11} />} label="Type" options={['All trends', 'Breakout signals', 'Anomalies only', 'Sustained surges']} />
          <FilterDropdown icon={<Filter size={11} />} label="Sort" options={['By relevance', 'By volume', 'By velocity']} />

          {/* Search field */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
            <input
              type="text"
              placeholder="Filter signals..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-4 py-2 rounded-lg text-xs outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter, sans-serif', fontSize: '11px',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(6,182,212,0.4)'; e.target.style.background = 'rgba(6,182,212,0.04)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.04)'; }}
            />
          </div>

          {/* Export */}
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
            style={{
              background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)',
              color: '#06b6d4', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(6,182,212,0.2)'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.background = 'rgba(6,182,212,0.1)'; }}>
            <Download size={11} />
            Export
          </button>
        </div>
      </div>

      {/* ── Intelligence Grid ────────────────────────────────────────────── */}
      <div className="px-4 py-4">
        <div style={{
          background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px', overflow: 'hidden',
          backdropFilter: 'blur(8px)',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            
            {/* ─── Column Headers ─── */}
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                {/* Rank */}
                <th className="py-3 pl-6 pr-3 text-left w-12">
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>#</span>
                </th>
                {/* Query */}
                <th className="py-3 pr-6 text-left">
                  <div className="flex items-center gap-2">
                    <Search size={10} className="text-white/20" />
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Signal / Query</span>
                  </div>
                </th>
                {/* Volume */}
                <th className="py-3 pr-8 text-left">
                  <button onClick={() => setSortBy('volume')} className="flex items-center gap-1.5 transition-colors" style={{ color: sortBy === 'volume' ? '#06b6d4' : 'rgba(255,255,255,0.3)' }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Volume</span>
                    {sortBy === 'volume' && <ArrowUpRight size={9} />}
                  </button>
                </th>
                {/* Velocity */}
                <th className="py-3 pr-8 text-left">
                  <button onClick={() => setSortBy('velocity')} className="flex items-center gap-1.5 transition-colors" style={{ color: sortBy === 'velocity' ? '#06b6d4' : 'rgba(255,255,255,0.3)' }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Δ Velocity</span>
                    {sortBy === 'velocity' && <ArrowUpRight size={9} />}
                  </button>
                </th>
                {/* Started */}
                <th className="py-3 pr-8 text-left">
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Started</span>
                </th>
                {/* Breakdown */}
                <th className="py-3 pr-6 text-left">
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Trend Breakdown</span>
                </th>
                {/* Sparkline */}
                <th className="py-3 pr-6 text-left">
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Past 24h</span>
                </th>
              </tr>
            </thead>

            {/* ─── Rows ─── */}
            <tbody>
              {sorted.map((entry, i) => (
                <TrendRow key={entry.rank} entry={entry} index={i} />
              ))}
            </tbody>
          </table>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>
              SHOWING {sorted.length} / 15 SIGNALS — GLOBAL ANOMALY FEED
            </span>
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px rgba(52,211,153,0.5)', animation: 'pulse 2s infinite' }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>
                STREAM LIVE — REFRESH 24S
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Supplementary Panels ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 pb-8">
        
        {/* Signal Distribution */}
        <div className="col-span-1 p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Zap size={12} className="text-cyan-400" />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Source Distribution</span>
          </div>
          {[
            { label: 'Google', pct: 33, color: '#3b82f6' },
            { label: 'Reddit', pct: 40, color: '#ea580c' },
            { label: 'Twitter', pct: 27, color: '#8b5cf6' },
          ].map(s => (
            <div key={s.label} className="mb-3">
              <div className="flex justify-between mb-1">
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>{s.label}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 700, color: s.color }}>{s.pct}%</span>
              </div>
              <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
                <div style={{ width: `${s.pct}%`, height: '100%', background: s.color, borderRadius: '2px', opacity: 0.7 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Category Heatmap */}
        <div className="col-span-1 p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Activity size={12} className="text-purple-400" />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Category Heatmap</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {['AI', 'Finance', 'Tech', 'Sports', 'Geo', 'Gaming', 'Space', 'Health', 'Dev'].map((cat, i) => {
              const intensity = [0.9, 0.7, 0.6, 0.8, 0.5, 0.4, 0.5, 0.3, 0.3][i];
              return (
                <div key={cat} className="p-2 rounded-lg text-center" style={{
                  background: `rgba(6,182,212,${intensity * 0.15})`,
                  border: `1px solid rgba(6,182,212,${intensity * 0.25})`,
                }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: `rgba(6,182,212,${0.4 + intensity * 0.6})`, fontWeight: 700 }}>{cat}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Breakouts */}
        <div className="col-span-1 p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 mb-4">
            <ArrowUpRight size={12} className="text-emerald-400" />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Top Breakout Signals</span>
          </div>
          {TREND_DATA.filter(t => t.velocityDir === 'breakout' || parseFloat(t.velocity.replace(/[^0-9]/g, '')) > 1000).slice(0, 4).map((t, i) => (
            <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="flex items-center gap-2">
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'rgba(255,255,255,0.25)', minWidth: '16px' }}>{t.rank}</span>
                <span className="text-xs text-white/70 truncate max-w-[130px]">{t.query.split('—')[0].trim()}</span>
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 700, color: '#10b981' }}>{t.velocity}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
