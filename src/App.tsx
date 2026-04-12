import { useState } from 'react';
import './index.css';
import { Navigation } from './components/Navigation';
import ObservatoriumGlobe from './components/ObservatoriumGlobe';
import { SystemBoot } from './components/SystemBoot';
import { SystemLog } from './components/SystemLog';
import { useMagneticCursor } from './hooks/useMagneticCursor';

export default function App() {
  const [booting, setBooting] = useState(true);
  
  // Global magnetic cursor & flashlight effect
  useMagneticCursor();

  if (booting) {
    return <SystemBoot onComplete={() => setBooting(false)} />;
  }

  return (
    <>
      {/* Film grain noise overlay — breathes every 5s */}
      <div className="grain-overlay" aria-hidden="true" />

      {/* Navigation */}
      <Navigation />

      {/* Main content: Space 01: The Observatorium */}
      <main>
        <ObservatoriumGlobe />
      </main>

      {/* System logs overlay */}
      <SystemLog />
    </>
  );
}
