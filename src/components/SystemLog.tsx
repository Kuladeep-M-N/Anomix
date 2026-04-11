import { useState, useEffect, useRef } from 'react';

const LOG_MESSAGES = [
  'SCAN: Node 04A activity spike detected',
  'NET: Latency variance +12ms in EU-West',
  'AUTH: Biometric handshake successful',
  'SYNC: Database clusters aligned',
  'THREAT: Low-velocity botnet signature found',
  'GEO: Anomaly coordinates 37.77N 122.41W verified',
  'ALGO: Confidence interval recalculated to 94%',
  'SYSLOG: Kernel buffer overflow prevented',
];

export function SystemLog() {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const msg = LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)];
      const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLogs((prev) => [...prev, `${timestamp} [${msg}]`].slice(-20));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '32px',
        width: '320px',
        height: '140px',
        background: 'rgba(3,3,3,0.7)',
        backdropFilter: 'blur(10px)',
        border: '0.5px solid rgba(255,255,255,0.08)',
        borderRadius: '8px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        zIndex: 40,
        pointerEvents: 'none',
        opacity: 0.6,
      }}
    >
      <div 
        style={{ 
          fontSize: '0.6rem', 
          textTransform: 'uppercase', 
          letterSpacing: '0.1em', 
          color: 'rgba(255,255,255,0.3)',
          marginBottom: '4px',
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <span>System Log</span>
        <span style={{ color: 'rgba(34,197,94,0.6)' }}>● LIVE</span>
      </div>
      <div
        ref={scrollRef}
        className="font-mono"
        style={{
          fontSize: '0.65rem',
          color: 'rgba(255,255,255,0.5)',
          overflowY: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}
      >
        {logs.map((log, i) => (
          <div key={i} style={{ whiteSpace: 'nowrap' }}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}
