import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { Dashboard } from './components/Dashboard';
import ObservatoriumGlobe from './components/ObservatoriumGlobe';
import { SystemBoot } from './components/SystemBoot';
import { SystemLog } from './components/SystemLog';
import { DemoControls } from './components/DemoControls';
import { useLiveData } from './hooks/useLiveData';
import { SettingsPanel } from './components/SettingsPanel';
import { useMagneticCursor } from './hooks/useMagneticCursor';
import { useStore } from './store/useStore';

export default function App() {
  const [booting, setBooting] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const { isDarkMode } = useStore();
  
  // Initialize real-time data orchestration
  useLiveData();
  
  // Global magnetic cursor & flashlight effect
  useMagneticCursor();

  if (booting) {
    return <SystemBoot onComplete={() => setBooting(false)} />;
  }

  return (
    <BrowserRouter>
      <div className={isDarkMode ? 'dark' : ''}>
        <div className="min-h-screen bg-slate-50 dark:bg-[#030303] transition-colors duration-500">
          {/* Film grain noise overlay */}
          <div className="grain-overlay" aria-hidden="true" />

          {/* Navigation */}
          <Navigation onOpenSettings={() => setShowSettings(true)} />

          {/* Global Demo Controls (Ctrl+Shift+D) */}
          <DemoControls />

          {/* Routing Logic */}
          <main className="relative z-10">
            <Routes>
              {/* Home / Globe View */}
              <Route path="/" element={<ObservatoriumGlobe />} />
              <Route path="/observatorium" element={<ObservatoriumGlobe />} />
              
              {/* Reddit Monitoring View */}
              <Route path="/monitor" element={
                <>
                  <Hero />
                  <div id="dashboard-section" className="scroll-mt-20">
                    <Dashboard />
                  </div>
                </>
              } />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Settings Modal */}
          {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
          
          {/* Settings Floating Button */}
          <button 
            onClick={() => setShowSettings(true)}
            className="fixed bottom-8 left-8 p-3 bg-gray-900/80 backdrop-blur-md border border-white/10 rounded-full text-gray-500 hover:text-white transition-all z-50 hover:rotate-90"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38 a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>

          {/* System logs overlay (Always visible in background) */}
          <SystemLog />
        </div>
      </div>
    </BrowserRouter>
  );
}
