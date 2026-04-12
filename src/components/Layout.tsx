import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Activity, Globe, LayoutDashboard, BarChart3, BookOpen, Settings, TrendingUp } from 'lucide-react';

const NAV_LINKS = [
  { name: 'Observatorium', path: '/dashboard/observatorium', icon: Globe },
  { name: 'Monitoring', path: '/dashboard/monitor', icon: LayoutDashboard },
  { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Intel Grid', path: '/dashboard/advanced-analytics', icon: TrendingUp },
  { name: 'Docs', path: '/dashboard/docs', icon: BookOpen },
];

export default function Layout() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#030303', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation Bar */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '0.5px solid rgba(255,255,255,0.07)',
          background: 'rgba(3,3,3,0.85)',
          flexShrink: 0,
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
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'white',
              letterSpacing: '-0.03em',
              fontFamily: 'inherit',
            }}
          >
            <Activity size={18} strokeWidth={2.5} style={{ color: 'rgba(99,102,241,0.9)' }} />
            Anomix
          </button>

          {/* Navigation Links */}
          <ul style={{ display: 'flex', gap: '4px', listStyle: 'none', alignItems: 'center', margin: 0, padding: 0 }}>
            {NAV_LINKS.map(({ name, path, icon: Icon }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  style={{ textDecoration: 'none' }}
                  className={({ isActive }) =>
                    isActive ? 'nav-link-active' : 'nav-link-inactive'
                  }
                >
                  {({ isActive }) => (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        background: isActive ? 'rgba(59,130,246,0.1)' : 'transparent',
                        color: isActive ? '#60a5fa' : 'rgba(255,255,255,0.5)',
                        border: isActive ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                      }}
                    >
                      <Icon size={14} />
                      {name}
                    </div>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Settings & Launch */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.4)',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'white')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
              title="Settings"
            >
              <Settings size={16} />
            </button>
            <button
              className="launch-btn"
              onClick={() => navigate('/dashboard/monitor')}
            >
              Launch System
            </button>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Outlet />
      </div>
    </div>
  );
}
