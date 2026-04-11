import { useState, useEffect } from 'react';

export function SystemBoot({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [phase, setPhase] = useState<'booting' | 'verifying' | 'finalizing'>('booting');

  const BOOT_LOGS = [
    'INIT: CORE_SYSTEM_V3.8.1',
    'LOAD: NEURAL_BRIDGE_INTERFACE',
    'SCAN: ANOMALY_SENSORS_ACTIVE',
    'VERIFY: SUB_PIXEL_STABILITY_OK',
    'NET: ESTABLISHING_QUANTUM_LINK',
    'SYNC: TEMPORAL_DRIFT_CORRECTED',
  ];

  useEffect(() => {
    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < BOOT_LOGS.length) {
        setLogs((prev) => [...prev, BOOT_LOGS[currentLogIndex]]);
        currentLogIndex++;
        setProgress((currentLogIndex / BOOT_LOGS.length) * 100);
      } else {
        clearInterval(interval);
        setPhase('verifying');
        setTimeout(() => {
          setPhase('finalizing');
          setTimeout(onComplete, 800);
        }, 1200);
      }
    }, 280);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'var(--color-void)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '32px',
        color: 'white',
        padding: '24px',
      }}
    >
      <div style={{ position: 'relative', width: '240px', height: '2px', background: 'rgba(255,255,255,0.05)' }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${progress}%`,
            background: 'white',
            boxShadow: '0 0 15px rgba(255,255,255,0.5)',
            transition: 'width 0.3s var(--spring-snappy)',
          }}
        />
      </div>

      <div
        className="font-mono"
        style={{
          fontSize: '0.7rem',
          color: 'rgba(255,255,255,0.35)',
          textAlign: 'center',
          height: '100px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          letterSpacing: '0.05em',
        }}
      >
        {logs.slice(-3).map((log, i) => (
          <div key={i} style={{ opacity: i === 2 ? 1 : 0.4 }}>
            {log}... OK
          </div>
        ))}
        {phase === 'verifying' && <div style={{ color: 'white' }}>VERIFYING BIOMETRICS...</div>}
        {phase === 'finalizing' && <div style={{ color: 'white' }}>SYSTEM ONLINE</div>}
      </div>

      <div
        className="font-display"
        style={{
          position: 'absolute',
          bottom: '40px',
          fontSize: '0.75rem',
          letterSpacing: '0.2rem',
          textTransform: 'uppercase',
          opacity: 0.2,
        }}
      >
        AEGIS-V3
      </div>
    </div>
  );
}
