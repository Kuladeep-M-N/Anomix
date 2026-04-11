import { useRef, useState } from 'react';
import { AnomalyCard, type AnomalyCardData } from './AnomalyCard';
import { useIntersectionReveal } from '../hooks/useScrollSync';

const CARDS: AnomalyCardData[] = [
  {
    id: '1',
    title: 'Botnet Activity',
    value: '14.2K',
    delta: '+38%',
    deltaPositive: false,
    severity: 'critical',
    description: 'Coordinated traffic surge detected from 847 distinct IPs. Confidence score elevated to threat level 4.',
    source: 'sensor-node-04A',
    coordinates: '37.7749° N, 122.4194° W',
    botConfidence: 94,
    trend: [12, 9, 14, 18, 22, 30, 45, 62, 80, 91, 88, 95],
    timestamp: '2m ago',
  },
  {
    id: '2',
    title: 'Sentiment Drift',
    value: '-0.42',
    delta: '-12%',
    deltaPositive: false,
    severity: 'warning',
    description: 'Rapid negative sentiment shift across 3 monitored clusters. Likely organic but pattern matches coordinated effort.',
    source: 'cluster-social-B',
    coordinates: '51.5074° N, 0.1278° W',
    botConfidence: 52,
    trend: [55, 53, 50, 48, 45, 41, 38, 35, 31, 28, 25, 22],
    timestamp: '7m ago',
  },
  {
    id: '3',
    title: 'Curiosity Spike',
    value: '3.8M',
    delta: '+217%',
    deltaPositive: true,
    severity: 'info',
    description: 'Organic engagement surge on trending topic. Authentic interest pattern — no anomalous amplification signals.',
    source: 'feed-indexer-1C',
    coordinates: '35.6762° N, 139.6503° E',
    botConfidence: 18,
    trend: [2, 3, 4, 6, 12, 28, 55, 90, 140, 200, 310, 380],
    timestamp: '12m ago',
  },
  {
    id: '4',
    title: 'Network Latency',
    value: '246ms',
    delta: '-8ms',
    deltaPositive: true,
    severity: 'nominal',
    description: 'Global CDN performance nominal. Sub-threshold variance across all routing nodes. System operating in green zone.',
    source: 'infra-monitor-v3',
    coordinates: '48.8566° N, 2.3522° E',
    botConfidence: 5,
    trend: [260, 258, 262, 255, 252, 249, 248, 250, 247, 245, 246, 246],
    timestamp: '1m ago',
  },
  {
    id: '5',
    title: 'Amplification Rate',
    value: '892',
    delta: '+156%',
    deltaPositive: false,
    severity: 'critical',
    description: 'Inorganic repost velocity detected. Accounts created within 72h responsible for 60% of amplification activity.',
    source: 'amp-tracker-09',
    coordinates: '55.7558° N, 37.6176° E',
    botConfidence: 87,
    trend: [10, 12, 18, 30, 55, 120, 250, 400, 550, 700, 820, 892],
    timestamp: '4m ago',
  },
  {
    id: '6',
    title: 'Topic Velocity',
    value: '4,291',
    delta: '+0.3%',
    deltaPositive: true,
    severity: 'nominal',
    description: 'Topic propagation rate within expected parameters. Stable spread pattern with no coordinated injection signals.',
    source: 'topic-engine-02',
    coordinates: '19.0760° N, 72.8777° E',
    botConfidence: 12,
    trend: [4200, 4210, 4220, 4230, 4250, 4260, 4270, 4280, 4285, 4288, 4290, 4291],
    timestamp: '5m ago',
  },
];

export function DataGrid() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // String Tune Trigger 2 — reveal cards on scroll into viewport
  useIntersectionReveal(gridRef, '.reveal-item');

  return (
    <section
      id="data-grid"
      style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '80px 32px 120px',
      }}
    >
      {/* Section header */}
      <div style={{ marginBottom: '48px' }}>
        <span
          className="font-mono"
          style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(99,102,241,0.8)',
          }}
        >
          LIVE · 6 streams active
        </span>
        <h2
          className="font-display"
          style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            letterSpacing: '-0.03em',
            marginTop: '8px',
            color: 'white',
            lineHeight: 1.1,
          }}
        >
          Anomaly Streams
        </h2>
        <p
          style={{
            color: 'rgba(255,255,255,0.35)',
            marginTop: '10px',
            fontSize: '0.9rem',
            letterSpacing: '-0.01em',
          }}
        >
          Select a card to inspect expert metadata and stabilize focus
        </p>
      </div>

      {/* Grid container */}
      <div
        ref={gridRef}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        {CARDS.map((card, i) => (
          <AnomalyCard 
            key={card.id} 
            data={card} 
            delay={i * 60} 
            isSelected={selectedId === card.id}
            onClick={() => setSelectedId(selectedId === card.id ? null : card.id)}
          />
        ))}
      </div>
    </section>
  );
}
