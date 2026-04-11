const TICKER_ITEMS = [
  { label: 'BOTNET_ALERT_04A', value: '14.2K', delta: '+38%', up: false },
  { label: 'SENTIMENT_CLUSTER_B', value: '-0.42', delta: '-12%', up: false },
  { label: 'CURIOSITY_SPIKE_1C', value: '3.8M', delta: '+217%', up: true },
  { label: 'NET_LATENCY_GLOBAL', value: '246ms', delta: '-8ms', up: true },
  { label: 'AMP_RATE_09', value: '892', delta: '+156%', up: false },
  { label: 'TOPIC_VEL_02', value: '4,291', delta: '+0.3%', up: true },
  { label: 'BOT_CONFIDENCE_AVG', value: '44.7%', delta: '+2.1%', up: false },
  { label: 'ORGANIC_RATIO', value: '61.3%', delta: '+4.2%', up: true },
  { label: 'STREAM_UPTIME', value: '99.98%', delta: '0%', up: true },
  { label: 'THREAT_SCORE_GLOBAL', value: '6.2/10', delta: '+0.4', up: false },
];

// Duplicate for seamless infinite loop
const DOUBLED = [...TICKER_ITEMS, ...TICKER_ITEMS];

export function LiveTicker() {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99,
        borderTop: '0.5px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(3,3,3,0.85)',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        contain: 'layout style paint',
      }}
    >
      {/* Live indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '0 20px',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
          height: '100%',
        }}
      >
        <div
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'rgb(239, 68, 68)',
            animation: 'pulse-dot 1.5s ease-in-out infinite',
          }}
        />
        <style>{`
          @keyframes pulse-dot {
            0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
            50% { opacity: 0.8; box-shadow: 0 0 0 4px rgba(239,68,68,0); }
          }
        `}</style>
        <span
          className="font-mono"
          style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
          }}
        >
          Live
        </span>
      </div>

      {/* Scrolling ticker — hardware accelerated, no jank */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div className="ticker-track">
          {DOUBLED.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0 24px',
                borderRight: '1px solid rgba(255,255,255,0.05)',
                height: '44px',
                flexShrink: 0,
              }}
            >
              <span
                className="font-mono"
                style={{
                  fontSize: '0.68rem',
                  color: 'rgba(255,255,255,0.3)',
                  letterSpacing: '0.06em',
                }}
              >
                {item.label}
              </span>
              <span
                className="font-mono"
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.8)',
                }}
              >
                {item.value}
              </span>
              <span
                className="font-mono"
                style={{
                  fontSize: '0.68rem',
                  color: item.up ? 'rgb(134,239,172)' : 'rgb(252,165,165)',
                }}
              >
                {item.delta}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
