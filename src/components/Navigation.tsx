import { useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Activity, Globe, LayoutDashboard, Database, FileText } from 'lucide-react';

const NAV_LINKS = [
  { name: 'Observatorium', path: '/observatorium', icon: <Globe size={16} /> },
  { name: 'Monitoring', path: '/monitor', icon: <LayoutDashboard size={16} /> },
  { name: 'Analytics', path: '/analytics', icon: <Database size={16} /> },
  { name: 'Trending', path: '/advanced-analytics', icon: <Activity size={16} /> },
  { name: 'Docs', path: '/docs', icon: <FileText size={16} /> },
];

interface NavigationProps {
  onOpenSettings?: () => void;
}

export function Navigation({ onOpenSettings }: NavigationProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

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
        <NavLink
          to="/"
          className="font-display no-underline"
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
          Anomix
        </NavLink>

        {/* Center nav links */}
        <ul
          style={{
            display: 'flex',
            gap: '24px',
            listStyle: 'none',
            alignItems: 'center',
          }}
        >
          {NAV_LINKS.map((link) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                className={({ isActive }) => 
                  `flex items-center gap-2 text-sm font-medium transition-all duration-200 ${
                    isActive ? 'text-blue-400' : 'text-gray-400 hover:text-white'
                  }`
                }
                style={{ textDecoration: 'none' }}
              >
                {link.icon}
                <span>{link.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Launch System button */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onOpenSettings}
            className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
          >
            Settings
          </button>
          <button 
            ref={btnRef} 
            className="launch-btn"
            onClick={() => {
              navigate('/monitor');
            }}
          >
            Launch System
          </button>
        </div>
      </div>
    </nav>
  );
}
