import { useState } from 'react';
import './index.css';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { Dashboard } from './components/Dashboard';
import { SystemBoot } from './components/SystemBoot';
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
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-[#030303] transition-colors duration-500">
        {/* Film grain noise overlay — breathes every 5s */}
        <div className="grain-overlay" aria-hidden="true" />

        {/* Navigation */}
        <Navigation />

        {/* Global Demo Controls (Ctrl+Shift+D) */}
        <DemoControls />

        {/* Main content */}
        <main className="relative z-10">
          <Hero />
          
          <div id="dashboard-section" className="scroll-mt-20">
            <Dashboard />
          </div>
        </main>

        {/* Settings Modal */}
        {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
        
        {/* Add global click listener for settings in navigation etc */}
        <button 
          onClick={() => setShowSettings(true)}
          className="fixed bottom-8 left-8 p-3 bg-gray-900 border border-white/10 rounded-full text-gray-500 hover:text-white transition-all z-50 hover:rotate-90"
        >
          {/* Settings Icon from MetricCard icons logic */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38 a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        </button>
      </div>
    </div>
  );
}
