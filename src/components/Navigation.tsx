import { useRef } from 'react';
import { Activity } from 'lucide-react';

const NAV_LINKS = ['Monitor', 'Analytics', 'Alerts', 'Docs'];

export function Navigation() {
  const btnRef = useRef<HTMLButtonElement>(null);

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '0.5px solid rgba(255,255,255,0.07)',
        background: 'rgba(3,3,3,0.8)',
        contain: 'layout style',
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 32px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '32px',
        }}
      >
        {/* Logo */}
        <div
          className="font-display"
          style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Activity size={18} strokeWidth={2.5} style={{ color: 'rgba(99,102,241,0.9)' }} />
          Aegis Trends
        </div>

        {/* Center nav links */}
        <ul
          style={{
            display: 'flex',
            gap: '2px',
            listStyle: 'none',
            alignItems: 'center',
          }}
        >
          {NAV_LINKS.map((link) => (
            <li key={link}>
              <button
                key={link}
                className="nav-link"
                onClick={() => {
                  const id = link.toLowerCase() === 'monitor' ? 'data-grid' : 'hero';
                  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  color: 'rgba(255,255,255,0.55)',
                  textDecoration: 'none',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.2s, background 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.95)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.55)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                <span>{link}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* Launch System button */}
        <button 
          ref={btnRef} 
          className="launch-btn"
          onClick={() => {
            document.getElementById('data-grid')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          Launch System
        </button>
      </div>
    </nav>
  );
}
