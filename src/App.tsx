import { Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import MonitorPage from './pages/MonitorPage';
import AnalyticsPage from './pages/AnalyticsPage';
import DocsPage from './pages/DocsPage';
import { AdvancedAnalytics } from './pages/AdvancedAnalytics';
import ObservatoriumGlobe from './components/ObservatoriumGlobe';
import { SystemBoot } from './components/SystemBoot';
import { DemoControls } from './components/DemoControls';
import { useLiveData } from './hooks/useLiveData';
import { useMagneticCursor } from './hooks/useMagneticCursor';
import { useStore } from './store/useStore';
import { useState } from 'react';

export default function App() {
  const [booting, setBooting] = useState(true);
  const { isDarkMode } = useStore();

  // Initialize real-time data orchestration
  useLiveData();

  // Global magnetic cursor & flashlight effect
  useMagneticCursor();

  if (booting) {
    return <SystemBoot onComplete={() => setBooting(false)} />;
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="grain-overlay" aria-hidden="true" />
      <DemoControls />

      <Routes>
        {/* Landing page — no layout wrapper */}
        <Route path="/" element={<LandingPage />} />

        {/* Dashboard routes — wrapped in Layout (nav bar) */}
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard/observatorium" replace />} />
          <Route path="observatorium" element={<ObservatoriumGlobe />} />
          <Route path="monitor" element={<MonitorPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="advanced-analytics" element={<AdvancedAnalytics />} />
          <Route path="docs" element={<DocsPage />} />
        </Route>

        {/* Legacy paths — redirect to new routes */}
        <Route path="/monitor" element={<Navigate to="/dashboard/monitor" replace />} />
        <Route path="/observatorium" element={<Navigate to="/dashboard/observatorium" replace />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
