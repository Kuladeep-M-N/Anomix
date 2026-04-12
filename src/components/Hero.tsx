import { useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScrollY } from '../hooks/useScrollSync';

const TEXT = 'See the Unseen.';

export function Hero() {
  const navigate = useNavigate();
  const orbBlueRef = useRef<HTMLDivElement>(null);
  const orbPurpleRef = useRef<HTMLDivElement>(null);
  const orbCyanRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  // String Tune Trigger 1 — scroll-linked orb parallax
  const onScrollY = useCallback((y: number) => {
    const progress = Math.min(y / window.innerHeight, 1);

    if (orbBlueRef.current) {
      orbBlueRef.current.style.transform =
        `translate3d(${-progress * 80}px, ${-progress * 60}px, 0) scale(${1 - progress * 0.25})`;
    }
    if (orbPurpleRef.current) {
      orbPurpleRef.current.style.transform =
        `translate3d(${progress * 80}px, ${progress * 40}px, 0) scale(${1 - progress * 0.2})`;
    }
    if (orbCyanRef.current) {
      orbCyanRef.current.style.transform =
        `translate3d(${-progress * 40}px, ${progress * 70}px, 0) scale(${1 - progress * 0.15})`;
    }
  }, []);

  useScrollY(onScrollY);

  // Entrance animation for sub-headline and CTA
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (subRef.current) {
      timers.push(
        setTimeout(() => {
          if (subRef.current) {
            subRef.current.style.opacity = '1';
            subRef.current.style.transform = 'translateY(0)';
          }
        }, TEXT.length * 30 + 200),
      );
    }
    if (ctaRef.current) {
      timers.push(
        setTimeout(() => {
          if (ctaRef.current) {
            ctaRef.current.style.opacity = '1';
            ctaRef.current.style.transform = 'translateY(0)';
          }
        }, TEXT.length * 30 + 400),
      );
    }
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <section
      id="hero"
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '24px',
        position: 'relative',
        overflow: 'hidden',
        perspective: '1200px',
      }}
    >
      {/* Depth orbs */}
      <div
        ref={orbBlueRef}
        className="orb"
        style={{
          background: 'var(--color-orb-blue)',
          top: '-10%',
          left: '-10%',
          opacity: 0.18,
          transform: 'translate3d(0,0,0)',
          zIndex: 0,
        }}
      />
      <div
        ref={orbPurpleRef}
        className="orb"
        style={{
          background: 'var(--color-orb-purple)',
          bottom: '-10%',
          right: '-10%',
          opacity: 0.18,
          transform: 'translate3d(0,0,0)',
          zIndex: 0,
          animationDelay: '2.5s',
        }}
      />
      <div
        ref={orbCyanRef}
        className="orb"
        style={{
          background: 'var(--color-orb-cyan)',
          top: '40%',
          left: '30%',
          width: '400px',
          height: '400px',
          opacity: 0.12,
          transform: 'translate3d(0,0,0)',
          zIndex: 0,
          animationDelay: '1.2s',
        }}
      />

      {/* Main heading — split by character */}
      <h1
        className="font-display"
        style={{
          fontSize: 'clamp(3.5rem, 8vw, 8rem)',
          letterSpacing: '-0.03em',
          lineHeight: 1,
          textAlign: 'center',
          position: 'relative',
          zIndex: 2,
          userSelect: 'none',
        }}
        aria-label={TEXT}
      >
        {TEXT.split('').map((char, i) => (
          <span
            key={i}
            className="char-reveal"
            aria-hidden="true"
            style={{
              animationDelay: `${i * 30}ms`,
              whiteSpace: char === ' ' ? 'pre' : undefined,
            }}
          >
            {char}
          </span>
        ))}
      </h1>

      {/* Sub-headline */}
      <p
        ref={subRef}
        style={{
          color: 'rgba(255,255,255,0.4)',
          maxWidth: '520px',
          textAlign: 'center',
          fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
          lineHeight: 1.7,
          letterSpacing: '-0.01em',
          position: 'relative',
          zIndex: 2,
          opacity: 0,
          transform: 'translateY(20px)',
          transition: 'opacity 0.5s var(--spring-smooth), transform 0.5s var(--spring-snappy)',
        }}
      >
        Real-time anomaly detection wrapped in an impeccably engineered interface.
      </p>

      {/* CTA group */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          position: 'relative',
          zIndex: 2,
          opacity: 0,
          transform: 'translateY(20px)',
          transition: 'opacity 0.5s var(--spring-smooth), transform 0.5s var(--spring-snappy)',
        }}
        ref={ctaRef as any}
      >
        <button
          onClick={() => navigate('/dashboard/monitor')}
          style={{
            background: 'white',
            color: 'black',
            border: 'none',
            padding: '12px 28px',
            borderRadius: '10px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: '-0.01em',
            transition: 'transform 0.3s var(--spring-snappy), box-shadow 0.3s var(--spring-smooth)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.04)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(255,255,255,0.2)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
          }}
        >
          Get Started
        </button>
        <button
          style={{
            background: 'transparent',
            color: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '12px 28px',
            borderRadius: '10px',
            fontSize: '0.9rem',
            fontWeight: 500,
            cursor: 'pointer',
            letterSpacing: '-0.01em',
            transition: 'border-color 0.2s, color 0.2s, transform 0.3s var(--spring-snappy)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.25)';
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.9)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)';
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)';
          }}
        >
          View Demo
        </button>
      </div>

      {/* Scroll indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          opacity: 0.3,
          zIndex: 2,
          animation: 'float-indicator 2s ease-in-out infinite',
        }}
      >
        <style>{`
          @keyframes float-indicator {
            0%, 100% { transform: translateX(-50%) translateY(0); }
            50% { transform: translateX(-50%) translateY(6px); }
          }
        `}</style>
        <span style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Scroll
        </span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 3L8 13M8 13L4 9M8 13L12 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </section>
  );
}
