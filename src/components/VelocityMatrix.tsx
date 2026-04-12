import React, { useRef, useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import type { VelocityData, BaselineSignalItem, VelocityAnomalyItem } from '../store/useStore';

// --- Mock data for "Always On" guarantee ---
const FALLBACK_VELOCITY: VelocityData = {
  baseline_signal: [
    { keyword: 'Artificial Intelligence', volume: 95 },
    { keyword: 'Machine Learning', volume: 88 },
    { keyword: 'Cybersecurity', volume: 82 },
    { keyword: 'Blockchain', volume: 74 },
    { keyword: 'Quantum Computing', volume: 71 },
  ],
  velocity_anomalies: [
    { keyword: 'AGI Breakthrough', spike: 4100, source: 'Signal' },
    { keyword: 'SpaceX Starship', spike: 2850, source: 'Signal' },
    { keyword: 'AI Stock Crash', spike: 1940, source: 'Noise' },
    { keyword: 'GPT-5 Launch', spike: 1200, source: 'Signal' },
    { keyword: 'Deepfake Senate', spike: 980, source: 'Noise' },
  ],
  generated_at: Date.now(),
};

// --- Micro Sparkline Component (SVG) ---
const MicroSparkline: React.FC<{ volume: number; index: number }> = ({ volume, index }) => {
  // Generate pseudo-historic data driven by volume for visual consistency
  const points = [0, 1, 2, 3, 4, 5].map((i) => {
    const seed = (volume * (i + 1) * (index + 1)) % 100;
    return Math.max(10, Math.min(90, seed));
  });
  const max = Math.max(...points);
  const normalized = points.map((p) => (p / max) * 28);
  const w = 48;
  const h = 28;
  const step = w / (points.length - 1);
  const pathD = normalized
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * step},${h - v}`)
    .join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <defs>
        <linearGradient id={`spark-grad-${index}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(49,154,255,0.3)" />
          <stop offset="100%" stopColor="rgba(49,154,255,0)" />
        </linearGradient>
      </defs>
      <path
        d={`${pathD} L ${w},${h} L 0,${h} Z`}
        fill={`url(#spark-grad-${index})`}
      />
      <path d={pathD} fill="none" stroke="#319AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// --- Burn Rate Flame ---
const BurnRateFlame: React.FC<{ spike: number }> = ({ spike }) => {
  const intensity = spike >= 1000 ? 3 : spike >= 500 ? 2 : 1;
  const size = 10 + intensity * 4;
  const opacity = 0.5 + intensity * 0.17;
  return (
    <span
      title={`Burn Rate: ${intensity === 3 ? 'Critical' : intensity === 2 ? 'High' : 'Moderate'}`}
      style={{
        fontSize: `${size}px`,
        opacity,
        filter: spike >= 1000 ? 'drop-shadow(0 0 4px rgba(239,68,68,0.8))' : undefined,
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      🔥
    </span>
  );
};

// --- Source Tag Badge ---
const SourceTag: React.FC<{ source: 'Signal' | 'Noise' }> = ({ source }) => (
  <span
    style={{
      fontSize: '8px',
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: 700,
      letterSpacing: '0.06em',
      padding: '2px 7px',
      borderRadius: '6px',
      background:
        source === 'Signal'
          ? 'rgba(49,154,255,0.12)'
          : 'rgba(245,158,11,0.12)',
      border:
        source === 'Signal'
          ? '1px solid rgba(49,154,255,0.25)'
          : '1px solid rgba(245,158,11,0.25)',
      color: source === 'Signal' ? '#60a5fa' : '#fcd34d',
      textTransform: 'uppercase',
      flexShrink: 0,
    }}
  >
    {source}
  </span>
);

// --- Spike Percentage chip ---
const SpikeChip: React.FC<{ spike: number; isPulse: boolean }> = ({ spike, isPulse }) => {
  const isCritical = spike >= 1000;
  const isCyan = spike < 500;

  const color = isCritical
    ? '#ff4444'
    : isCyan
    ? '#22d3ee'
    : '#f97316';

  const glow = isCritical
    ? '0 0 12px rgba(255,68,68,0.6)'
    : isCyan
    ? '0 0 8px rgba(34,211,238,0.4)'
    : '0 0 8px rgba(249,115,22,0.4)';

  return (
    <span
      data-pulse={isPulse}
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 800,
        fontSize: '12px',
        color,
        textShadow: glow,
        letterSpacing: '-0.02em',
        padding: '3px 10px',
        borderRadius: '8px',
        background: isCritical
          ? 'rgba(255,68,68,0.08)'
          : isCyan
          ? 'rgba(34,211,238,0.08)'
          : 'rgba(249,115,22,0.08)',
        border: `1px solid ${color}33`,
        flexShrink: 0,
        animation: isPulse ? 'velocity-pulse 1.8s ease-in-out infinite' : undefined,
      }}
    >
      +{spike.toLocaleString()}%
    </span>
  );
};

// --- Props ---
interface VelocityMatrixProps {
  isVisible: boolean;
}

const VelocityMatrix: React.FC<VelocityMatrixProps> = ({ isVisible }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const { velocityData, selectedCountry } = useStore();

  const [isEntered, setIsEntered] = useState(false);

  // Spring-in entrance when made visible
  useEffect(() => {
    if (isVisible) {
      // requestAnimationFrame to allow layout before triggering spring
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsEntered(true);
        });
      });
    } else {
      setIsEntered(false);
    }
  }, [isVisible]);

  // Use Firestore data if available, else fallback (Always On)
  const data: VelocityData = velocityData ?? FALLBACK_VELOCITY;

  // Find the top anomaly (highest spike) for the pulse effect
  const maxSpike = data.velocity_anomalies.length > 0
    ? Math.max(...data.velocity_anomalies.map((a) => a.spike))
    : 0;

  return (
    <div
      ref={panelRef}
      style={{
        position: 'absolute',
        right: '32px',
        top: '50%',
        width: '540px',
        zIndex: 20,
        transform: isEntered
          ? 'translateX(0px) translateY(-50%)'
          : 'translateX(60px) translateY(-50%)',
        opacity: isEntered ? 1 : 0,
        // --spring-snappy from CSS vars applied via inline transition
        transition: `transform 0.6s var(--spring-snappy), opacity 0.5s ease`,
        pointerEvents: isEntered ? 'all' : 'none',
      }}
    >
      {/* Main Panel */}
      <div
        className="liquid-glass"
        style={{
          borderRadius: '28px',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.12)',
          backdropFilter: 'blur(24px)',
          overflow: 'hidden',
        }}
      >
        {/* --- Header --- */}
        <div
          style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <p
              style={{
                fontSize: '9px',
                letterSpacing: '0.38em',
                textTransform: 'uppercase',
                color: '#60a5fa',
                fontWeight: 700,
                marginBottom: '3px',
              }}
            >
              Space 02 · Velocity Matrix
            </p>
            <h2
              style={{
                fontSize: '1.15rem',
                fontWeight: 900,
                color: 'white',
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}
            >
              {selectedCountry ? `${selectedCountry} Intel` : 'Global Signal Feed'}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {selectedCountry && (
              <span
                style={{
                  fontSize: '9px',
                  fontFamily: "'JetBrains Mono', monospace",
                  padding: '4px 10px',
                  borderRadius: '8px',
                  background: 'rgba(99,102,241,0.12)',
                  border: '1px solid rgba(99,102,241,0.25)',
                  color: '#a78bfa',
                  fontWeight: 700,
                }}
              >
                ◎ REGION LOCKED
              </span>
            )}
            {/* Live indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#22d3ee',
                  boxShadow: '0 0 8px rgba(34,211,238,0.8)',
                  animation: 'velocity-breath 2s ease-in-out infinite',
                  display: 'block',
                }}
              />
              <span
                style={{
                  fontSize: '9px',
                  fontFamily: "'JetBrains Mono', monospace",
                  color: 'rgba(255,255,255,0.4)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                LIVE
              </span>
            </div>
          </div>
        </div>

        {/* --- Dual Column Body --- */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 0,
          }}
        >
          {/* ── Left: Baseline Signal ── */}
          <div
            style={{
              padding: '20px 20px 20px 24px',
              borderRight: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <p
              style={{
                fontSize: '9px',
                textTransform: 'uppercase',
                letterSpacing: '0.28em',
                color: 'rgba(255,255,255,0.3)',
                fontWeight: 700,
                marginBottom: '14px',
              }}
            >
              Baseline Signal
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.baseline_signal.map((item: BaselineSignalItem, i: number) => (
                <div
                  key={item.keyword}
                  className="reveal-item revealed"
                  style={{
                    animationDelay: `${i * 60}ms`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '5px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MicroSparkline volume={item.volume} index={i} />
                      <span
                        style={{
                          fontSize: '11.5px',
                          color: 'rgba(255,255,255,0.65)',
                          fontWeight: 500,
                          letterSpacing: '-0.01em',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '100px',
                        }}
                      >
                        {item.keyword}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: "'JetBrains Mono', monospace",
                        color: '#60a5fa',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {item.volume}
                    </span>
                  </div>
                  {/* Volume bar */}
                  <div
                    style={{
                      height: '2px',
                      width: '100%',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${item.volume}%`,
                        background: 'linear-gradient(90deg, #1d4ed8, #319AFF)',
                        borderRadius: '2px',
                        transition: 'width 0.8s var(--spring-snappy)',
                        boxShadow: '0 0 6px rgba(49,154,255,0.4)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Velocity Anomalies ── */}
          <div style={{ padding: '20px 24px 20px 20px' }}>
            <p
              style={{
                fontSize: '9px',
                textTransform: 'uppercase',
                letterSpacing: '0.28em',
                color: 'rgba(255,255,255,0.3)',
                fontWeight: 700,
                marginBottom: '14px',
              }}
            >
              Velocity Anomalies
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.velocity_anomalies.map((item: VelocityAnomalyItem, i: number) => {
                const isPulse = item.spike === maxSpike;
                const isCritical = item.spike >= 1000;
                return (
                  <div
                    key={item.keyword}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '10px',
                      background: isCritical
                        ? 'rgba(255,68,68,0.04)'
                        : 'rgba(255,255,255,0.02)',
                      border: isCritical
                        ? '1px solid rgba(255,68,68,0.15)'
                        : '1px solid transparent',
                      transition: 'border-color 0.3s ease',
                      animationDelay: `${i * 70}ms`,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '6px',
                        gap: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0 }}>
                        <BurnRateFlame spike={item.spike} />
                        <span
                          style={{
                            fontSize: '11.5px',
                            color: isCritical ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.65)',
                            fontWeight: isCritical ? 700 : 500,
                            letterSpacing: '-0.01em',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.keyword}
                        </span>
                      </div>
                      <SpikeChip spike={item.spike} isPulse={isPulse} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <SourceTag source={item.source} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* --- Footer pulse bar --- */}
        <div
          style={{
            height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.4), rgba(99,102,241,0.4), transparent)',
            animation: 'velocity-scanline 3s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  );
};

export default VelocityMatrix;
