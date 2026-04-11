import { useState, useEffect } from 'react';
import { useProgressiveDisclose } from '../hooks/useProgressiveDisclose';
import { TrendingUp, TrendingDown, AlertTriangle, Info, Shield } from 'lucide-react';

export type Severity = 'critical' | 'warning' | 'info' | 'nominal';

export interface AnomalyCardData {
  id: string;
  title: string;
  value: string;
  delta: string;
  deltaPositive: boolean;
  severity: Severity;
  description: string;
  source: string;
  coordinates: string;
  botConfidence: number;
  trend: number[];
  timestamp: string;
}

function SparkLine({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 30;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <polyline
        points={pts}
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NumberRoll({ value }: { value: string }) {
  const [displayed, setDisplayed] = useState(value);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (value !== displayed) {
      setKey((k) => k + 1);
      setDisplayed(value);
    }
  }, [value]);

  return (
    <span className="font-mono number-roll" key={key}>
      <span className="number-roll-inner">{displayed}</span>
    </span>
  );
}

const SEVERITY_CONFIG: Record<
  Severity,
  { badgeClass: string; icon: React.ReactNode; label: string }
> = {
  critical: {
    badgeClass: 'badge-critical',
    icon: <AlertTriangle size={11} />,
    label: 'Critical',
  },
  warning: {
    badgeClass: 'badge-warning',
    icon: <AlertTriangle size={11} />,
    label: 'Warning',
  },
  info: {
    badgeClass: 'badge-info',
    icon: <Info size={11} />,
    label: 'Spike',
  },
  nominal: {
    badgeClass: 'badge-nominal',
    icon: <Shield size={11} />,
    label: 'Nominal',
  },
};

export function AnomalyCard({ 
  data, 
  delay = 0, 
  isSelected = false,
  onClick 
}: { 
  data: AnomalyCardData; 
  delay?: number;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  const { ref, revealed: metaRevealed } = useProgressiveDisclose(400);
  const severityClass =
    data.severity === 'critical'
      ? 'severity-high'
      : data.severity === 'info'
      ? 'severity-low'
      : '';
  const cfg = SEVERITY_CONFIG[data.severity];

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      onClick={onClick}
      className={`glass-card reveal-item ${severityClass} ${data.severity === 'critical' ? 'card-critical' : ''} ${metaRevealed || isSelected ? 'meta-revealed' : ''}`}
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        animationDelay: `${delay}ms`,
        cursor: 'pointer',
        transform: isSelected ? 'scale(1.02) translateZ(20px)' : undefined,
        borderColor: isSelected ? 'var(--color-border-bright)' : undefined,
        boxShadow: isSelected ? '0 20px 40px rgba(0,0,0,0.4), inset 0 0 20px rgba(255,255,255,0.05)' : undefined,
        zIndex: isSelected ? 30 : 1,
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.35)',
            }}
          >
            {data.title}
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <span
              className="font-display"
              style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: 'white',
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}
            >
              <NumberRoll value={data.value} />
            </span>
            <span
              className="font-mono"
              style={{
                fontSize: '0.8rem',
                color: data.deltaPositive ? 'rgb(134,239,172)' : 'rgb(252,165,165)',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              {data.deltaPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {data.delta}
            </span>
          </div>
        </div>
        <span
          className={cfg.badgeClass}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 9px',
            borderRadius: '20px',
            fontSize: '0.68rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
          }}
        >
          {cfg.icon}
          {cfg.label}
        </span>
      </div>

      {/* Description */}
      <p
        style={{
          fontSize: '0.85rem',
          color: 'rgba(255,255,255,0.45)',
          lineHeight: 1.6,
          letterSpacing: '-0.005em',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {data.description}
      </p>

      {/* Sparkline + time */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <SparkLine data={data.trend} />
        <span
          className="font-mono"
          style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)' }}
        >
          {data.timestamp}
        </span>
      </div>

      {/* Expert Mode — Progressive Disclosure */}
      <div className="meta-reveal" style={{ position: 'relative', zIndex: 2 }}>
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.07)',
            paddingTop: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.72rem',
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>Source</span>
            <span className="font-mono" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {data.source}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.72rem',
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>Coordinates</span>
            <span className="font-mono" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {data.coordinates}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.72rem',
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>Bot Confidence</span>
            <span
              className="font-mono"
              style={{
                color:
                  data.botConfidence > 80
                    ? 'rgb(252,165,165)'
                    : data.botConfidence > 50
                    ? 'rgb(253,230,138)'
                    : 'rgb(134,239,172)',
              }}
            >
              {data.botConfidence}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
