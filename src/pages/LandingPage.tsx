import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, Play } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

const TEXT = 'See the Unseen.';



export default function LandingPage() {
  const navigate = useNavigate();
  const [chars, setChars] = useState<boolean[]>([]);
  const mountedRef = useRef(true);

  // Character reveal animation
  useEffect(() => {
    TEXT.split('').forEach((_, i) => {
      setTimeout(() => {
        if (!mountedRef.current) return;
        setChars(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, i * 45);
    });
    return () => { mountedRef.current = false; };
  }, []);



  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#030303',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Grain overlay */}
      <div className="grain-overlay" aria-hidden="true" />

      {/* Ambient orbs */}
      <div className="orb" style={{ background: 'rgba(59,130,246,0.25)', top: '-15%', left: '-15%', zIndex: 0 }} />
      <div className="orb" style={{ background: 'rgba(139,92,246,0.2)', bottom: '-15%', right: '-15%', zIndex: 0, animationDelay: '2.5s' }} />

      {/* Background grid */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          zIndex: 0,
        }}
      />

      {/* Navigation */}
      <nav
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 48px',
          borderBottom: '0.5px solid rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          background: 'rgba(3,3,3,0.5)',
        }}
      >
        {/* Logo */}
        <div className="font-display" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.05rem', fontWeight: 700, color: 'white', letterSpacing: '-0.03em' }}>
          <Activity size={18} strokeWidth={2.5} style={{ color: 'rgba(99,102,241,0.9)' }} />
          Aegis Trends
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => navigate('/dashboard/monitor')}
            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.875rem', padding: '8px 16px' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'white')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
          >
            Login
          </button>
          <button
            className="launch-btn"
            onClick={() => navigate('/dashboard/observatorium')}
          >
            Launch System
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '32px',
          padding: '80px 24px',
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '100px',
            background: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.2)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#60a5fa',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', animation: 'pulse 2s infinite' }} />
          Live Anomaly Detection · v2.0
        </div>

        {/* Main Heading */}
        <h1
          className="font-display"
          style={{
            fontSize: 'clamp(2.8rem, 6vw, 6.5rem)',
            letterSpacing: '-0.04em',
            lineHeight: 1,
            color: 'white',
            maxWidth: '900px',
          }}
          aria-label={TEXT}
        >
          {TEXT.split('').map((char, i) => (
            <span
              key={i}
              aria-hidden="true"
              style={{
                display: 'inline-block',
                opacity: chars[i] ? 1 : 0,
                transform: chars[i] ? 'translateY(0)' : 'translateY(40px)',
                transition: 'opacity 0.4s ease, transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
                whiteSpace: char === ' ' ? 'pre' : undefined,
              }}
            >
              {char}
            </span>
          ))}
        </h1>

        {/* Subheading */}
        <p
          style={{
            color: 'rgba(255,255,255,0.4)',
            maxWidth: '520px',
            fontSize: 'clamp(1rem, 1.5vw, 1.15rem)',
            lineHeight: 1.7,
            letterSpacing: '-0.01em',
          }}
        >
          Real-time anomaly detection across Reddit, Twitter, Instagram & TikTok.{' '}
          <span style={{ color: 'rgba(255,255,255,0.65)' }}>
            Engineered for precision.
          </span>
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/dashboard/monitor')}
            style={{
              background: 'white',
              color: 'black',
              border: 'none',
              padding: '14px 32px',
              borderRadius: '10px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              letterSpacing: '-0.01em',
              transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), box-shadow 0.3s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.04)';
              e.currentTarget.style.boxShadow = '0 10px 40px rgba(255,255,255,0.25)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Get Started <ArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate('/dashboard/observatorium')}
            style={{
              background: 'transparent',
              color: 'rgba(255,255,255,0.65)',
              border: '1px solid rgba(255,255,255,0.12)',
              padding: '14px 32px',
              borderRadius: '10px',
              fontSize: '0.95rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              letterSpacing: '-0.01em',
              transition: 'border-color 0.2s, color 0.2s, transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Play size={14} /> View Globe
          </button>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: 'flex',
            gap: '48px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            paddingTop: '40px',
            marginTop: '8px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {[
            { label: 'Data Sources', value: '4 Platforms' },
            { label: 'Detection Accuracy', value: '98.2%' },
            { label: 'Latency', value: '< 0.8s' },
            { label: 'Algorithms', value: '5 Models' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div className="font-display" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white', letterSpacing: '-0.03em' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </main>


    </div>
  );
}
