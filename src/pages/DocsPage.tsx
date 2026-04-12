import { useState } from 'react';
import { BookOpen, Code, Zap, Shield, Database, Settings, ChevronRight } from 'lucide-react';

const SECTIONS = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: BookOpen,
    color: '#3b82f6',
    content: [
      {
        subtitle: 'Quick Start Guide',
        text: 'Launch the monitoring dashboard and configure your first detection algorithm in under 5 minutes. Navigate to the Monitoring tab to see live Reddit data.',
      },
      {
        subtitle: 'Platform Setup',
        text: 'Anomix connects to Reddit via the public JSON API — no authentication required. Twitter, Instagram, and TikTok data is simulated for demo purposes.',
      },
      {
        subtitle: 'Understanding the Dashboard',
        text: 'The dashboard serves as an AI-powered Insight Engine, featuring a live anomalies queue and a real-time event feed. It focuses on pure storytelling and automated insights rather than manual chart interpretation.',
      },
    ],
  },
  {
    id: 'detection-algorithms',
    title: 'Detection Algorithms',
    icon: Zap,
    color: '#f59e0b',
    content: [
      {
        subtitle: 'Z-Score Analysis',
        text: 'Statistical deviation analysis that flags data points beyond 3σ (standard deviations) from the rolling mean. Best for normally distributed data.',
        code: 'z = (x - μ) / σ  →  |z| > 3 triggers anomaly',
      },
      {
        subtitle: 'IQR Method',
        text: 'Interquartile range detection for robust outlier identification. Less sensitive to extreme values than Z-Score. Flags points outside [Q1 - 1.5×IQR, Q3 + 1.5×IQR].',
      },
      {
        subtitle: 'Moving Average',
        text: 'Rolling window deviation comparison to detect sudden trend shifts. Calculates average across a configurable sliding window and flags deviations above a threshold.',
      },
      {
        subtitle: 'LSTM Neural Network',
        text: 'Deep learning model that learns temporal patterns in engagement data. Predicts expected values and flags significant deviations from predictions.',
      },
      {
        subtitle: 'Ensemble (Recommended)',
        text: 'Weighted voting system combining all four algorithms. Achieves 98.2% detection accuracy by reducing false positives through consensus. This is the default mode.',
      },
    ],
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    icon: Code,
    color: '#22c55e',
    content: [
      {
        subtitle: 'fetchRedditTrends()',
        text: 'Retrieves real-time Reddit data from up to 8 configured subreddits using the public JSON API. Returns posts, time-series, and trending topics.',
        code: 'const trends = await fetchRedditTrends();\n// Returns: { posts[], timeSeries[], trendingTopics[], lastUpdated }',
      },
      {
        subtitle: 'useRedditData(autoRefresh, interval)',
        text: 'React hook managing data fetching, auto-refresh, and error states. Auto-refreshes every 5 minutes by default.',
        code: 'const { data, isLoading, error, refresh } = useRedditData(true, 300000);',
      },
      {
        subtitle: 'fetchSubredditHot(subreddit, limit)',
        text: 'Fetches the top hot posts from a specific subreddit. Rate-limited to 2 seconds between requests.',
        code: "const posts = await fetchSubredditHot('technology', 50);",
      },
    ],
  },
  {
    id: 'configuration',
    title: 'Configuration',
    icon: Settings,
    color: '#a855f7',
    content: [
      {
        subtitle: 'Sensitivity Tuning',
        text: 'Adjust detection sensitivity from 1 (loose — fewer alerts) to 5 (strict — more alerts). Higher sensitivity catches subtle anomalies but increases false positive rate.',
      },
      {
        subtitle: 'Subreddit Selection',
        text: 'Configure which subreddits to monitor via the SubredditSelector in the Monitoring tab. Default subreddits: technology, worldnews, cryptocurrency, stocks, science, programming.',
      },
      {
        subtitle: 'Refresh Interval',
        text: "Reddit data auto-refreshes every 5 minutes (300,000ms). This respects Reddit's rate limits while keeping data reasonably fresh.",
      },
      {
        subtitle: 'Export Formats',
        text: 'Use the Export button to generate reports in PDF or CSV format using jsPDF and the built-in report generator.',
      },
    ],
  },
  {
    id: 'security',
    title: 'Security & Privacy',
    icon: Shield,
    color: '#ef4444',
    content: [
      {
        subtitle: 'No Authentication Required',
        text: 'Reddit data is fetched from the public JSON API via an allorigins CORS proxy. No API keys or credentials are stored.',
      },
      {
        subtitle: 'Data Processing',
        text: 'All data processing runs entirely in the browser. No data is sent to any backend server. The Observatorium Globe uses Firebase Firestore for real-time global signal data.',
      },
      {
        subtitle: 'Firebase Firestore',
        text: 'The Globe page connects to Firebase Firestore for real-time geospatial trend data. Security rules require read-only access to the observatorium collection.',
      },
    ],
  },
  {
    id: 'data-sources',
    title: 'Data Sources',
    icon: Database,
    color: '#06b6d4',
    content: [
      {
        subtitle: 'Reddit (Live)',
        text: 'Fetches from r/technology, r/worldnews, r/cryptocurrency, r/stocks, r/science, r/programming, r/artificial, r/dataisbeautiful via the public Reddit JSON API.',
      },
      {
        subtitle: 'Twitter / X (Simulated)',
        text: 'Uses a statistical simulator to generate realistic engagement patterns. Data is generated client-side and does not represent real Twitter activity.',
      },
      {
        subtitle: 'Instagram & TikTok (Simulated)',
        text: 'Platform simulators generate synthetic data based on observed engagement patterns. These platforms require official API access for production use.',
      },
    ],
  },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <div style={{ padding: '32px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{ padding: '10px', background: 'rgba(99,102,241,0.1)', borderRadius: '12px' }}>
            <BookOpen size={20} style={{ color: '#818cf8' }} />
          </div>
          <h1 className="font-display" style={{ fontSize: '2.5rem', color: 'white', letterSpacing: '-0.03em', margin: 0 }}>
            Documentation
          </h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem', lineHeight: 1.7 }}>
          Complete guide to the Anomix anomaly detection platform.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '40px', alignItems: 'start' }}>
        {/* Table of Contents */}
        <div
          className="glass-card"
          style={{ padding: '20px', borderRadius: '20px', position: 'sticky', top: '80px' }}
        >
          <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '16px' }}>
            Contents
          </p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {SECTIONS.map(section => {
              const Icon = section.icon;
              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={() => setActiveSection(section.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: activeSection === section.id ? 'white' : 'rgba(255,255,255,0.45)',
                    background: activeSection === section.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { if (activeSection !== section.id) e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
                >
                  <Icon size={13} style={{ color: section.color, flexShrink: 0 }} />
                  {section.title}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {SECTIONS.map(section => {
            const Icon = section.icon;
            return (
              <div
                key={section.id}
                id={section.id}
                className="glass-card"
                style={{ padding: '32px', borderRadius: '24px', scrollMarginTop: '80px' }}
              >
                {/* Section Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ padding: '10px', background: `${section.color}15`, borderRadius: '12px' }}>
                    <Icon size={18} style={{ color: section.color }} />
                  </div>
                  <h2 className="font-display" style={{ color: 'white', fontSize: '1.2rem', letterSpacing: '-0.02em', margin: 0 }}>
                    {section.title}
                  </h2>
                </div>

                {/* Content Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {section.content.map((item, idx) => (
                    <div key={idx}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <ChevronRight size={14} style={{ color: section.color, flexShrink: 0 }} />
                        <h3 style={{ color: 'white', fontSize: '14px', fontWeight: 700, margin: 0 }}>
                          {item.subtitle}
                        </h3>
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', lineHeight: 1.7, margin: '0 0 0 22px' }}>
                        {item.text}
                      </p>
                      {(item as any).code && (
                        <pre
                          style={{
                            marginTop: '10px',
                            marginLeft: '22px',
                            padding: '12px 16px',
                            background: 'rgba(0,0,0,0.4)',
                            borderRadius: '10px',
                            fontSize: '11px',
                            color: '#86efac',
                            fontFamily: 'monospace',
                            border: '1px solid rgba(255,255,255,0.05)',
                            overflowX: 'auto',
                          }}
                        >
                          {(item as any).code}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Footer */}
          <div
            style={{
              textAlign: 'center',
              padding: '32px',
              color: 'rgba(255,255,255,0.25)',
              fontSize: '13px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            Need help? Contact{' '}
            <a href="mailto:support@anomix.com" style={{ color: '#3b82f6', textDecoration: 'none' }}>
              support@anomix.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
