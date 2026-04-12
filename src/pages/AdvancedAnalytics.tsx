/**
 * AdvancedAnalytics.tsx — "Velocity Intelligence Grid"
 * Anomix · Cyber-Minimalist War Room · Dynamic Anomaly Protocol
 *
 * Design: leonxlnx/taste tokens · pbakaus/impeccable grid · emilkowalski/skill springs
 * Motion: Native CSS spring curves · rAF scroll triggers · Zero Framer Motion
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Zap, ArrowUpRight, ArrowDownRight, Minus, Activity,
  TrendingUp, Globe, Clock, Tag, Search, Filter, Download,
  ChevronDown, Radio, Shield, AlertTriangle
} from 'lucide-react';
import { useMagneticCursor } from '../hooks/useMagneticCursor';

// ─── Data ────────────────────────────────────────────────────────────────────

interface TrendEntry {
  rank: number;
  query: string;
  volume: string;
  velocity: string;
  velocityDir: 'up' | 'down' | 'flat' | 'breakout';
  sparklinePoints: string;
  sparklineType: 'spike' | 'surge' | 'decline' | 'wave' | 'steady';
  started: string;
  breakdown: string[];
  source: 'Google' | 'Reddit' | 'Twitter';
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

const TREND_DATA: TrendEntry[] = [
  { rank: 1, query: 'AGI Leak — OpenAI Internal Memo', volume: '2M+', velocity: '+3,550%', velocityDir: 'breakout', sparklinePoints: '0,45 10,42 20,38 30,20 40,5 50,2 60,8 70,12', sparklineType: 'spike', started: '2h ago', breakdown: ['GPT-5 benchmarks', 'Altman leak', '+ 161 more'], source: 'Reddit', category: 'AI', severity: 'critical' },
  { rank: 2, query: 'Meta Quest 4 Pro — Launch Announcement', volume: '1.5M+', velocity: '+2,850%', velocityDir: 'breakout', sparklinePoints: '0,40 10,35 20,28 30,15 40,8 50,10 60,14 70,18', sparklineType: 'surge', started: '3h ago', breakdown: ['Quest 4 specs', 'Mixed reality OS', '+ 76 more'], source: 'Twitter', category: 'Tech', severity: 'critical' },
  { rank: 3, query: 'IPL Anomaly — Match Fixing Allegations', volume: '900k+', velocity: '+1,900%', velocityDir: 'up', sparklinePoints: '0,44 10,40 20,32 30,22 40,14 50,12 60,15 70,18', sparklineType: 'surge', started: '4h ago', breakdown: ['CSK vs DC', 'BCCI investigation', '+ 54 more'], source: 'Twitter', category: 'Sports', severity: 'high' },
  { rank: 4, query: 'Crypto Crash — Bitcoin 22% Drop', volume: '750k+', velocity: '+1,200%', velocityDir: 'up', sparklinePoints: '0,30 10,28 20,22 30,18 40,25 50,35 60,38 70,40', sparklineType: 'wave', started: '5h ago', breakdown: ['BTC liquidations', 'ETH corr', '+ 88 more'], source: 'Reddit', category: 'Finance', severity: 'high' },
  { rank: 5, query: 'SpaceX Starship — Orbital Test Success', volume: '550k+', velocity: '+990%', velocityDir: 'up', sparklinePoints: '0,42 10,36 20,25 30,12 40,6 50,8 60,10 70,14', sparklineType: 'spike', started: '6h ago', breakdown: ['Mars trajectory', 'Booster recovery', '+ 41 more'], source: 'Reddit', category: 'Space', severity: 'high' },
  { rank: 6, query: 'Llama 4 Benchmarks — Meta AI', volume: '400k+', velocity: '+780%', velocityDir: 'up', sparklinePoints: '0,38 10,32 20,26 30,20 40,15 50,18 60,22 70,26', sparklineType: 'wave', started: '8h ago', breakdown: ['LLM comparison', 'Claude vs Llama', '+ 29 more'], source: 'Reddit', category: 'AI', severity: 'medium' },
  { rank: 7, query: 'WW3 Alert — NATO Emergency Session', volume: '300k+', velocity: '+650%', velocityDir: 'up', sparklinePoints: '0,35 10,28 20,18 30,8 40,5 50,7 60,12 70,20', sparklineType: 'spike', started: '10h ago', breakdown: ['Ukraine escalation', 'Russia sanctions', '+ 112 more'], source: 'Twitter', category: 'Geopolitics', severity: 'critical' },
  { rank: 8, query: 'Apple WWDC 2025 — iOS 19 Leaks', volume: '250k+', velocity: '+420%', velocityDir: 'up', sparklinePoints: '0,40 10,36 20,30 30,24 40,20 50,22 60,26 70,30', sparklineType: 'wave', started: '11h ago', breakdown: ['Siri overhaul', 'Vision Pro gen 2', '+ 33 more'], source: 'Twitter', category: 'Tech', severity: 'medium' },
  { rank: 9, query: 'Nvidia RTX 5090 — Stock Alert', volume: '200k+', velocity: '+380%', velocityDir: 'up', sparklinePoints: '0,44 10,40 20,34 30,26 40,20 50,22 60,25 70,28', sparklineType: 'steady', started: '13h ago', breakdown: ['GPU benchmark leak', 'Jensen Huang', '+ 18 more'], source: 'Reddit', category: 'Hardware', severity: 'medium' },
  { rank: 10, query: 'DeepSeek R2 — China AI Dominance', volume: '180k+', velocity: '+290%', velocityDir: 'up', sparklinePoints: '0,42 10,36 20,28 30,22 40,18 50,20 60,23 70,26', sparklineType: 'wave', started: '14h ago', breakdown: ['Reasoning benchmark', 'US export ban', '+ 22 more'], source: 'Google', category: 'AI', severity: 'medium' },
  { rank: 11, query: 'Tesla Cybertruck Recall — Safety Issue', volume: '150k+', velocity: '+180%', velocityDir: 'up', sparklinePoints: '0,36 10,38 20,40 30,42 40,38 50,34 60,30 70,28', sparklineType: 'decline', started: '16h ago', breakdown: ['NHTSA investigation', 'Musk response', '+ 14 more'], source: 'Twitter', category: 'Automotive', severity: 'low' },
  { rank: 12, query: 'Fed Rate Cut — Emergency Meeting', volume: '120k+', velocity: '+140%', velocityDir: 'up', sparklinePoints: '0,32 10,30 20,28 30,26 40,24 50,25 60,27 70,30', sparklineType: 'steady', started: '18h ago', breakdown: ['Jerome Powell', 'Inflation data', '+ 9 more'], source: 'Google', category: 'Finance', severity: 'low' },
  { rank: 13, query: 'GitHub Copilot Workspace — GA Launch', volume: '90k+', velocity: '+95%', velocityDir: 'up', sparklinePoints: '0,30 10,28 20,25 30,23 40,22 50,24 60,27 70,30', sparklineType: 'steady', started: '19h ago', breakdown: ['AI coding agent', 'VS Code integration', '+ 6 more'], source: 'Reddit', category: 'Dev', severity: 'low' },
  { rank: 14, query: 'GTA 6 — Leaked Gameplay Footage', volume: '80k+', velocity: '-20%', velocityDir: 'down', sparklinePoints: '0,10 10,14 20,18 30,24 40,30 50,34 60,36 70,38', sparklineType: 'decline', started: '21h ago', breakdown: ['Rockstar response', 'Release date', '+ 197 more'], source: 'Twitter', category: 'Gaming', severity: 'low' },
  { rank: 15, query: 'WHO Pandemic Alert — Novel Pathogen', volume: '60k+', velocity: '+55%', velocityDir: 'flat', sparklinePoints: '0,28 10,27 20,26 30,26 40,27 50,28 60,28 70,29', sparklineType: 'steady', started: '23h ago', breakdown: ['SE Asia origin', 'Travel advisory', '+ 31 more'], source: 'Google', category: 'Health', severity: 'low' },
];

// ─── Config Maps ─────────────────────────────────────────────────────────────

const SEVERITY_CONFIG = {
  critical: { glow: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', dot: '#ef4444', label: 'CRITICAL' },
  high:     { glow: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', dot: '#f59e0b', label: 'HIGH' },
  medium:   { glow: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.18)', dot: '#3b82f6', label: 'MEDIUM' },
  low:      { glow: 'rgba(255,255,255,0.02)', border: 'rgba(255,255,255,0.07)', dot: '#6b7280', label: 'LOW' },
};

const VELOCITY_CONFIG = {
  breakout: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)', color: '#10b981' },
  up:       { bg: 'rgba(6,182,212,0.08)',  border: 'rgba(6,182,212,0.25)',  color: '#06b6d4' },
  down:     { bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)',  color: '#ef4444' },
  flat:     { bg: 'rgba(107,114,128,0.08)',border: 'rgba(107,114,128,0.2)', color: '#6b7280' },
};

const SPARKLINE_COLORS = {
  spike: '#10b981', surge: '#06b6d4', decline: '#ef4444', wave: '#8b5cf6', steady: '#6b7280',
};

const SOURCE_CONFIG = {
  Google:  { color: '#60a5fa', dot: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
  Reddit:  { color: '#fb923c', dot: '#ea580c', bg: 'rgba(234,88,12,0.08)' },
  Twitter: { color: '#a78bfa', dot: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
};

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ points, type }: { points: string; type: TrendEntry['sparklineType'] }) {
  const color = SPARKLINE_COLORS[type];
  const id = `sg-${type}-${Math.random().toString(36).slice(2)}`;
  return (
    <svg width="88" height="36" viewBox="0 0 70 50" fill="none" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Fill area */}
      <polygon
        points={`0,50 ${points} 70,50`}
        fill={`url(#${id})`}
      />
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 4px ${color}60)` }}
      />
      {/* Live dot at end */}
      <circle cx="70" cy="12" r="2.5" fill={color} style={{ filter: `drop-shadow(0 0 5px ${color})` }} />
    </svg>
  );
}

// ─── Rank Badge ───────────────────────────────────────────────────────────────

function RankBadge({ rank, severity }: { rank: number; severity: TrendEntry['severity'] }) {
  const sev = SEVERITY_CONFIG[severity];
  const isTop = rank <= 3;
  return (
    <div style={{
      width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: isTop ? `rgba(239,68,68,0.12)` : 'rgba(255,255,255,0.03)',
      border: `1px solid ${isTop ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.07)'}`,
      position: 'relative',
    }}>
      {isTop && (
        <div style={{
          position: 'absolute', inset: '-1px', borderRadius: '10px',
          background: 'rgba(239,68,68,0.08)',
          animation: 'rankGlow 2s ease-in-out infinite',
        }} />
      )}
      <span style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 800,
        color: isTop ? '#f87171' : 'rgba(255,255,255,0.35)',
        position: 'relative', zIndex: 1,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {String(rank).padStart(2, '0')}
      </span>
    </div>
  );
}

// ─── Velocity Badge ───────────────────────────────────────────────────────────

function VelocityBadge({ value, dir }: { value: string; dir: TrendEntry['velocityDir'] }) {
  const c = VELOCITY_CONFIG[dir];
  const Icon = dir === 'breakout' ? Zap : dir === 'up' ? ArrowUpRight : dir === 'down' ? ArrowDownRight : Minus;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '4px 9px', borderRadius: '7px',
      background: c.bg, border: `1px solid ${c.border}`, color: c.color,
      fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 800,
      fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em',
      whiteSpace: 'nowrap',
    }}>
      <Icon size={10} />
      {value}
    </span>
  );
}

// ─── Source Tag ───────────────────────────────────────────────────────────────

function SourceTag({ source }: { source: TrendEntry['source'] }) {
  const c = SOURCE_CONFIG[source];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '2px 7px', borderRadius: '5px',
      background: c.bg, color: c.color,
      fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', fontWeight: 700,
      letterSpacing: '0.12em', textTransform: 'uppercase',
    }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {source}
    </span>
  );
}

// ─── Filter Dropdown ──────────────────────────────────────────────────────────

function FilterDropdown({ icon, label, options }: { icon: React.ReactNode; label: string; options: string[] }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(options[0]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: '7px',
          padding: '7px 12px', borderRadius: '9px',
          background: open ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${open ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)'}`,
          color: open ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.45)',
          cursor: 'pointer', transition: 'all 0.2s ease',
          fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 700,
          letterSpacing: '0.08em',
        }}
        onMouseEnter={e => { if (!open) { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}}
        onMouseLeave={e => { if (!open) { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}}
      >
        <span style={{ color: '#06b6d4', opacity: 0.7 }}>{icon}</span>
        <span style={{ textTransform: 'uppercase' }}>{selected}</span>
        <ChevronDown size={9} style={{ opacity: 0.5, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 100,
          minWidth: '160px', borderRadius: '12px',
          background: 'rgba(6,6,10,0.96)', border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(24px)', overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          animation: 'dropdownOpen 0.18s cubic-bezier(0.32, 0.72, 0, 1) both',
        }}>
          {options.map(opt => (
            <button key={opt} onClick={() => { setSelected(opt); setOpen(false); }}
              style={{
                width: '100%', padding: '9px 16px', textAlign: 'left',
                background: opt === selected ? 'rgba(6,182,212,0.1)' : 'transparent',
                color: opt === selected ? '#06b6d4' : 'rgba(255,255,255,0.45)',
                fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 600,
                cursor: 'pointer', border: 'none', transition: 'all 0.12s',
                letterSpacing: '0.05em',
              }}
              onMouseEnter={e => { if (opt !== selected) { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}}
              onMouseLeave={e => { if (opt !== selected) { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Trend Card Row ───────────────────────────────────────────────────────────

function TrendCard({ entry, index }: { entry: TrendEntry; index: number }) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const sev = SEVERITY_CONFIG[entry.severity];
  const isCritical = entry.severity === 'critical';

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 55 + 80);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      className="glass-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '16px 22px',
        display: 'grid',
        gridTemplateColumns: '52px 1fr 100px 120px 88px 80px 200px',
        gap: '16px',
        alignItems: 'center',
        background: hovered
          ? `linear-gradient(135deg, ${sev.glow} 0%, rgba(255,255,255,0.015) 100%)`
          : `linear-gradient(145deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.008) 100%)`,
        borderColor: hovered ? sev.border : 'rgba(255,255,255,0.07)',
        boxShadow: hovered
          ? `inset 0 1px 0 rgba(255,255,255,0.12), 0 0 30px ${isCritical ? 'rgba(239,68,68,0.08)' : 'transparent'}, 0 8px 24px rgba(0,0,0,0.5)`
          : 'inset 0 1px 0 rgba(255,255,255,0.06)',
        opacity: visible ? 1 : 0,
        transform: visible
          ? hovered ? 'translateY(-2px) scale(1.003)' : 'translateY(0) scale(1)'
          : 'translateY(20px)',
        transition: `opacity 0.45s ease ${index * 0.04}s, transform 0.5s var(--spring-snappy), background 0.25s ease, border-color 0.25s ease, box-shadow 0.3s ease`,
        cursor: 'default',
      }}
    >
      {/* Rank */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <RankBadge rank={entry.rank} severity={entry.severity} />
      </div>

      {/* Query + Meta */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
          <p style={{
            margin: 0, fontSize: '13px', fontWeight: 700,
            color: hovered ? 'white' : 'rgba(255,255,255,0.88)',
            lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            transition: 'color 0.2s',
          }}>
            {entry.query}
          </p>
          <SourceTag source={entry.source} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '5px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {entry.category}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{
              width: '5px', height: '5px', borderRadius: '50%', background: sev.dot,
              boxShadow: `0 0 5px ${sev.dot}`,
              animation: isCritical ? 'sevPulse 1.5s ease-in-out infinite' : undefined,
            }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', fontWeight: 700, color: sev.dot, letterSpacing: '0.1em' }}>
              {sev.label}
            </span>
          </span>
        </div>
      </div>

      {/* Volume */}
      <div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontVariantNumeric: 'tabular-nums', fontSize: '14px', fontWeight: 800, color: hovered ? 'white' : 'rgba(255,255,255,0.85)', lineHeight: 1 }}>
          {entry.volume}
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'rgba(255,255,255,0.25)', marginTop: '3px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          searches
        </div>
      </div>

      {/* Velocity */}
      <div>
        <VelocityBadge value={entry.velocity} dir={entry.velocityDir} />
      </div>

      {/* Time */}
      <div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', lineHeight: 1 }}>
          {entry.started}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 5px rgba(34,197,94,0.7)', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: '9px', fontWeight: 700, color: '#22c55e', letterSpacing: '0.1em', fontFamily: "'JetBrains Mono', monospace" }}>ACTIVE</span>
        </div>
      </div>

      {/* Sparkline */}
      <div>
        <Sparkline points={entry.sparklinePoints} type={entry.sparklineType} />
      </div>

      {/* Breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {entry.breakdown.map((item, i) => (
          <span key={i} style={{
            fontSize: i === 2 ? '10px' : '11px',
            color: i < 2 ? 'rgba(255,255,255,0.45)' : '#06b6d4',
            fontFamily: i === 2 ? "'JetBrains Mono', monospace" : 'Inter, sans-serif',
            letterSpacing: i === 2 ? '0.06em' : 'normal',
            cursor: i === 2 ? 'pointer' : 'default',
            transition: 'color 0.15s',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Live Clock ───────────────────────────────────────────────────────────────

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#06b6d4', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.08em' }}>
      {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
    </span>
  );
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────

function StatPill({ icon, value, label, color }: { icon: React.ReactNode; value: string | number; label: string; color: string }) {
  return (
    <div className="glass-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ padding: '8px', borderRadius: '10px', background: `${color}18`, flexShrink: 0 }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '18px', fontWeight: 800, color: 'white', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '3px', fontWeight: 700 }}>{label}</div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function AdvancedAnalytics() {
  useMagneticCursor();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'volume' | 'velocity'>('relevance');
  const [headerReady, setHeaderReady] = useState(false);
  const [scanLine, setScanLine] = useState(0);

  // Cinematic boot
  useEffect(() => {
    const t = setTimeout(() => setHeaderReady(true), 120);
    return () => clearTimeout(t);
  }, []);

  // Scan line animation driver
  useEffect(() => {
    let raf: number;
    let start: number;
    const animate = (ts: number) => {
      if (!start) start = ts;
      setScanLine(((ts - start) / 40) % 100);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  const filtered = TREND_DATA.filter(t =>
    t.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'volume') {
      const pv = (v: string) => parseFloat(v.replace(/[^0-9.]/g, '')) * (v.includes('M') ? 1000 : 1);
      return pv(b.volume) - pv(a.volume);
    }
    if (sortBy === 'velocity') {
      const pv = (v: string) => parseFloat(v.replace(/[^0-9.\-]/g, '')) || 0;
      return pv(b.velocity) - pv(a.velocity);
    }
    return a.rank - b.rank;
  });

  const critCount = TREND_DATA.filter(t => t.severity === 'critical').length;
  const breakoutCount = TREND_DATA.filter(t => t.velocityDir === 'breakout').length;

  return (
    <div style={{ minHeight: '100vh', position: 'relative', background: 'var(--color-void, #030303)', color: 'white', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Inline keyframes */}
      <style>{`
        @keyframes rankGlow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; box-shadow: 0 0 20px rgba(239,68,68,0.4); }
        }
        @keyframes sevPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.7; box-shadow: 0 0 12px currentColor; }
        }
        @keyframes dropdownOpen {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes headerSlide {
          from { opacity: 0; transform: translateY(-16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scanSlide {
          from { transform: translateY(-100%); }
          to { transform: translateY(100vh); }
        }
        @keyframes gridPulse {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.06; }
        }
        .sort-btn { background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 5px; padding: 2px 0; transition: color 0.2s; }
        .sort-btn:hover { color: rgba(255,255,255,0.8) !important; }
      `}</style>

      {/* Background grid */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        animation: 'gridPulse 6s ease-in-out infinite',
      }} />

      {/* Scan line */}
      <div style={{
        position: 'fixed', left: 0, right: 0, height: '60px', zIndex: 1, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, transparent, rgba(6,182,212,0.025), transparent)',
        top: `${scanLine}%`,
        transition: 'none',
      }} />

      {/* Ambient orbs */}
      <div style={{ position: 'fixed', top: '-200px', right: '-100px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-200px', left: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.05), transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(3,3,5,0.92)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(24px)',
        opacity: headerReady ? 1 : 0,
        transform: headerReady ? 'translateY(0)' : 'translateY(-16px)',
        transition: 'opacity 0.5s ease, transform 0.5s var(--spring-snappy)',
      }}>

        {/* Top system bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 28px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={9} style={{ color: '#22c55e' }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              ANOMIX // VELOCITY_INTELLIGENCE_GRID // STREAM_LIVE
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.1em' }}>
              LATENCY: 24ms
            </span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.1em' }}>
              MODEL: ENSEMBLE v3.1
            </span>
            <LiveClock />
          </div>
        </div>

        {/* Main header */}
        <div style={{ padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}>
                <TrendingUp size={16} style={{ color: '#06b6d4' }} />
              </div>
              <h1 style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.03em', margin: 0, color: 'white' }}>
                Trending Intelligence
              </h1>
              <span style={{
                padding: '3px 10px', borderRadius: '100px',
                background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)',
                fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', fontWeight: 800,
                color: '#06b6d4', letterSpacing: '0.15em',
              }}>
                INTEL FEED
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)', margin: 0, letterSpacing: '0.02em' }}>
              High-density velocity intelligence · Anomaly-grade signal detection · Global scope
            </p>
          </div>

          {/* Stat pills */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, auto)', gap: '10px' }}>
            <StatPill icon={<Activity size={14} />} value={15} label="Active Signals" color="#3b82f6" />
            <StatPill icon={<AlertTriangle size={14} />} value={critCount} label="Critical" color="#ef4444" />
            <StatPill icon={<Zap size={14} />} value={breakoutCount} label="Breakouts" color="#10b981" />
            <StatPill icon={<Globe size={14} />} value="Global" label="Scope" color="#8b5cf6" />
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 28px 14px', flexWrap: 'wrap' }}>
          <FilterDropdown icon={<Globe size={11} />} label="Region" options={['Global', 'India', 'USA', 'Europe', 'Asia Pacific', 'Latin America']} />
          <FilterDropdown icon={<Clock size={11} />} label="Timeframe" options={['Past 24 hours', 'Past 7 days', 'Past 30 days', 'Past 90 days']} />
          <FilterDropdown icon={<Tag size={11} />} label="Category" options={['All categories', 'AI / Tech', 'Finance', 'Sports', 'Geopolitics', 'Gaming', 'Health', 'Dev']} />
          <FilterDropdown icon={<Filter size={11} />} label="Type" options={['All trends', 'Breakout signals', 'Anomalies only', 'Sustained surges']} />

          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '180px', maxWidth: '280px' }}>
            <Search size={11} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Filter signals..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', paddingLeft: '30px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px',
                borderRadius: '9px', outline: 'none',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter, sans-serif', fontSize: '11px',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(6,182,212,0.4)'; e.target.style.background = 'rgba(6,182,212,0.04)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.04)'; }}
            />
          </div>

          {/* Export */}
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '9px',
              background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.22)',
              color: '#06b6d4', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
              fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer', textTransform: 'uppercase',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(6,182,212,0.16)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(6,182,212,0.08)'; }}
          >
            <Download size={11} />
            Export
          </button>
        </div>
      </div>

      {/* ── Intelligence Grid ─────────────────────────────────────────── */}
      <div style={{ padding: '20px 24px 40px', position: 'relative', zIndex: 5 }}>

        {/* Column headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '52px 1fr 100px 120px 88px 80px 200px',
          gap: '16px', alignItems: 'center',
          padding: '10px 22px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          marginBottom: '10px',
        }}>
          {[
            { label: '#', align: 'center' as const },
            { label: 'Signal / Query', align: 'left' as const },
            { label: 'Volume', sort: 'volume' as const, align: 'left' as const },
            { label: 'Δ Velocity', sort: 'velocity' as const, align: 'left' as const },
            { label: 'Past 24h', align: 'left' as const },
            { label: 'Started', align: 'left' as const },
            { label: 'Breakdown', align: 'left' as const },
          ].map(col => (
            <div key={col.label} style={{ textAlign: col.align }}>
              {col.sort ? (
                <button
                  className="sort-btn"
                  onClick={() => setSortBy(col.sort!)}
                  style={{ color: sortBy === col.sort ? '#06b6d4' : 'rgba(255,255,255,0.25)' }}
                >
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                    {col.label}
                  </span>
                  {sortBy === col.sort && <ArrowUpRight size={9} />}
                </button>
              ) : (
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  {col.label}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sorted.map((entry, i) => (
            <TrendCard key={entry.rank} entry={entry} index={i} />
          ))}
          {sorted.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.25)' }}>
              <Search size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
              <p style={{ fontSize: '13px' }}>No signals matching "{searchQuery}"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 22px', marginTop: '16px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(255,255,255,0.01)', borderRadius: '12px',
        }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Showing {sorted.length} / {TREND_DATA.length} signals — Global Anomaly Feed
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.7)', animation: 'pulse 2s infinite', display: 'inline-block' }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Stream Live · Refresh 24s
            </span>
          </div>
        </div>
      </div>

      {/* ── Supplementary Panels ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', padding: '0 24px 60px', position: 'relative', zIndex: 5 }}>

        {/* Source Distribution */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Shield size={13} style={{ color: '#06b6d4' }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Source Distribution</span>
          </div>
          {[
            { label: 'Reddit', pct: 40, color: '#fb923c' },
            { label: 'Google', pct: 33, color: '#3b82f6' },
            { label: 'Twitter', pct: 27, color: '#a78bfa' },
          ].map(s => (
            <div key={s.label} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{s.label}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 800, color: s.color }}>{s.pct}%</span>
              </div>
              <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${s.pct}%`, height: '100%', background: s.color, borderRadius: '2px', opacity: 0.75, transition: 'width 1s ease' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Category Heatmap */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Activity size={13} style={{ color: '#a78bfa' }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Category Heatmap</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {[
              { label: 'AI', intensity: 0.9 }, { label: 'Finance', intensity: 0.7 }, { label: 'Tech', intensity: 0.6 },
              { label: 'Sports', intensity: 0.8 }, { label: 'Geo', intensity: 0.5 }, { label: 'Gaming', intensity: 0.4 },
              { label: 'Space', intensity: 0.5 }, { label: 'Health', intensity: 0.3 }, { label: 'Dev', intensity: 0.3 },
            ].map(cat => (
              <div key={cat.label} style={{
                padding: '8px 6px', borderRadius: '8px', textAlign: 'center',
                background: `rgba(6,182,212,${cat.intensity * 0.14})`,
                border: `1px solid rgba(6,182,212,${cat.intensity * 0.28})`,
                transition: 'all 0.2s',
              }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', fontWeight: 800, color: `rgba(6,182,212,${0.4 + cat.intensity * 0.6})` }}>
                  {cat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Breakouts */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Zap size={13} style={{ color: '#10b981' }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Top Breakout Signals</span>
          </div>
          {TREND_DATA.filter(t => t.velocityDir === 'breakout' || parseFloat(t.velocity.replace(/[^0-9]/g, '')) > 900).slice(0, 5).map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'rgba(255,255,255,0.22)', minWidth: '18px', flexShrink: 0 }}>{t.rank}</span>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.72)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.query.split('—')[0].trim()}
                </span>
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 800, color: '#10b981', flexShrink: 0, marginLeft: '8px' }}>
                {t.velocity}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
