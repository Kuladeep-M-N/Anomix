import React, { useRef, useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import type { VelocityData, VelocityAnomalyItem, BaselineSignalItem } from '../store/useStore';

const FALLBACK_VELOCITY: VelocityData = {
  baseline_signal: [
    { keyword: "Artificial Intelligence", volume: 95, vector: "up", summary: "Steady upward trajectory in enterprise adoption queries.", threat_level: "emerging" },
    { keyword: "Machine Learning", volume: 88, vector: "steady", summary: "Consistent high volume across academic and tech sectors.", threat_level: "emerging" },
    { keyword: "Cybersecurity", volume: 82, vector: "up", summary: "Recent high-profile breaches driving sustained search volume.", threat_level: "elevated" },
  ],
  velocity_anomalies: [
    { keyword: "AGI Breakthrough", spike: 4100, source: "Signal", vector: "up", threat_level: "critical", summary: "Sudden search spike following alleged leaked research benchmarks." },
    { keyword: "SpaceX Starship", spike: 2850, source: "Signal", vector: "up", threat_level: "critical", summary: "Massive global interest surge leading up to orbital test flight." },
    { keyword: "AI Stock Crash", spike: 1940, source: "Noise", vector: "up", threat_level: "elevated", summary: "Panic selling queries trending due to unverified regulatory rumors." },
    { keyword: "GPT-5 Launch", spike: 1200, source: "Signal", vector: "up", threat_level: "elevated", summary: "Anticipatory searches spiking after cryptic executive tweets." },
    { keyword: "Deepfake Senate", spike: 980, source: "Noise", vector: "up", threat_level: "emerging", summary: "Viral video debunked, but search volume maintains long-tail presence." },
  ],
  generated_at: Date.now(),
};

// Unified item type for the grid
type GridRowData = {
  id: string;
  source: string;
  keyword: string;
  metrics: string;
  vector: 'up' | 'down' | 'steady';
  summary: string;
  threat_level: 'critical' | 'elevated' | 'emerging';
};

const getVectorIcon = (vector: 'up' | 'down' | 'steady') => {
  switch (vector) {
    case 'up': return '↗';
    case 'down': return '↘';
    case 'steady': return '→';
  }
};

const getThreatColor = (level: string) => {
  switch (level) {
    case 'critical': return '#ef4444'; // Red
    case 'elevated': return '#f97316'; // Orange
    case 'emerging': return '#22d3ee'; // Cyan
    default: return '#94a3b8'; // Slate
  }
};

const HoverInsight: React.FC<{ summary: string; mousePos: {x: number, y: number} | null }> = ({ summary, mousePos }) => {
  if (!mousePos) return null;
  return (
    <div
      style={{
        position: 'fixed',
        left: mousePos.x + 15,
        top: Math.max(20, mousePos.y - 40),
        width: '280px',
        padding: '12px 16px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        zIndex: 100,
        pointerEvents: 'none',
        // Entrance animation
        animation: 'insight-enter 0.2s cubic-bezier(0.32, 0.72, 0, 1) forwards',
      }}
    >
      <p style={{
        fontSize: '11px',
        color: '#e2e8f0',
        fontFamily: "'Inter', sans-serif",
        lineHeight: 1.5,
        margin: 0
      }}>
        {summary}
      </p>
    </div>
  );
};

const GridRow: React.FC<{ data: GridRowData; index: number; onHover: (summary: string | null, e?: React.MouseEvent) => void }> = ({ data, index, onHover }) => {
  const isCritical = data.threat_level === 'critical';
  const color = getThreatColor(data.threat_level);
  
  return (
    <div
      className={`grid-row magnetic-row ${isCritical ? 'glitch-enter' : 'streaming-enter'}`}
      onMouseEnter={(e) => onHover(data.summary, e)}
      onMouseMove={(e) => onHover(data.summary, e)}
      onMouseLeave={() => onHover(null)}
      style={{
        animationDelay: `${index * 40}ms`,
        display: 'grid',
        gridTemplateColumns: '60px 1fr 100px',
        alignItems: 'center',
        padding: '10px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        cursor: 'crosshair',
        position: 'relative',
        transition: 'all 0.3s var(--spring-snappy)',
      }}
    >
      {/* Source Icon Segment */}
      <div style={{
        fontSize: '10px',
        fontFamily: "'JetBrains Mono', monospace",
        color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase',
      }}>
        [{data.source.substring(0, 3)}]
      </div>
      
      {/* Nomenclature Segment */}
      <div className="grid-nomenclature" style={{
        color: isCritical ? '#fff' : 'rgba(255,255,255,0.85)',
        textShadow: isCritical ? `0 0 10px ${color}88` : 'none',
      }}>
        {data.keyword}
      </div>
      
      {/* Metrics Segment */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '8px',
        color: color,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '13px',
        fontWeight: isCritical ? 800 : 600,
        textShadow: `0 0 8px ${color}44`,
        animation: data.threat_level === 'elevated' ? 'pulse-opacity 2s ease-in-out infinite' : undefined,
      }}>
        <span>{data.metrics}</span>
        <span style={{ fontSize: '14px' }}>{getVectorIcon(data.vector)}</span>
      </div>
    </div>
  );
};


interface VelocityGridProps {
  isVisible: boolean;
}

const VelocityGrid: React.FC<VelocityGridProps> = ({ isVisible }) => {
  const { velocityData } = useStore();
  const [isEntered, setIsEntered] = useState(false);
  const [hoveredSummary, setHoveredSummary] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{x: number, y: number} | null>(null);

  const [time, setTime] = useState(new Date().toISOString().split('T')[1].substring(0, 8));

  useEffect(() => {
    let interval: any;
    if (isVisible) {
      requestAnimationFrame(() => requestAnimationFrame(() => setIsEntered(true)));
      interval = setInterval(() => {
        setTime(new Date().toISOString().split('T')[1].substring(0, 8));
      }, 1000);
    } else {
      setIsEntered(false);
    }
    return () => clearInterval(interval);
  }, [isVisible]);

  const handleHover = (summary: string | null, e?: React.MouseEvent) => {
    setHoveredSummary(summary);
    if (e) {
      setMousePos({ x: e.clientX, y: e.clientY });
    } else {
      setMousePos(null);
    }
  };

  const data = velocityData ?? FALLBACK_VELOCITY;

  // Compile anomalies and baseline into unified grid format
  const gridData: GridRowData[] = [
    ...data.velocity_anomalies.map(a => ({
      id: `anom-${a.keyword}`,
      source: a.source,
      keyword: a.keyword,
      metrics: `+${a.spike}%`,
      vector: a.vector,
      summary: a.summary,
      threat_level: a.threat_level,
    })),
    ...data.baseline_signal.map(b => ({
      id: `base-${b.keyword}`,
      source: 'BASE',
      keyword: b.keyword,
      metrics: b.volume.toString(),
      vector: b.vector,
      summary: b.summary,
      threat_level: b.threat_level,
    }))
  ];

  return (
    <>
      <div
        style={{
          position: 'absolute',
          right: '32px',
          top: '50%',
          width: '540px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 20,
          transform: isEntered ? 'translateX(0px) translateY(-50%)' : 'translateX(60px) translateY(-50%)',
          opacity: isEntered ? 1 : 0,
          transition: 'transform 0.6s var(--spring-snappy), opacity 0.5s ease',
          pointerEvents: isEntered ? 'all' : 'none',
        }}
      >
        <div
          className="liquid-glass"
          style={{
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.12)',
            backdropFilter: 'blur(24px)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* System Status Header */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(0,0,0,0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '6px', height: '6px', background: '#22d3ee', borderRadius: '50%', boxShadow: '0 0 8px #22d3ee' }} />
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px',
                color: 'rgba(255,255,255,0.5)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                LIVE_STREAM_ANOMALY_LOG
              </span>
            </div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '10px',
              color: 'rgba(255,255,255,0.4)',
              display: 'flex',
              gap: '12px'
            }}>
              <span>SYS: {time} Z</span>
              <span style={{ color: '#86efac' }}>LATENCY: {Math.floor(Math.random() * 5 + 21)}ms</span>
            </div>
          </div>

          {/* Table Headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '60px 1fr 100px',
            padding: '8px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '9px',
            color: 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}>
            <div>SRC</div>
            <div>NOMENCLATURE</div>
            <div style={{ textAlign: 'right' }}>IMPACT</div>
          </div>

          {/* Intelligence Grid */}
          <div className="custom-scrollbar" style={{
            overflowY: 'auto',
            maxHeight: '600px',
          }}>
            {gridData.map((item, index) => (
              <GridRow 
                key={item.id} 
                data={item} 
                index={index} 
                onHover={handleHover} 
              />
            ))}
          </div>

        </div>
      </div>
      
      <HoverInsight summary={hoveredSummary || ''} mousePos={hoveredSummary ? mousePos : null} />
    </>
  );
};

export default VelocityGrid;
