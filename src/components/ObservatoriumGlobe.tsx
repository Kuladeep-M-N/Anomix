import React, { useEffect, useRef, useState } from 'react';
import ThreeGlobe from 'three-globe';
import * as THREE from 'three';
import { db } from '../firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import StringTune from '@fiddle-digital/string-tune';

const ObservatoriumGlobe: React.FC = () => {
  const globeContainerRef = useRef<HTMLDivElement>(null);
  const globeInstanceRef = useRef<any>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  
  const [trendData, setTrendData] = useState<any[]>([]);
  const [activeTrend, setActiveTrend] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [isCardVisible, setIsCardVisible] = useState(false);

  // 1. Firebase "Vault" Listener
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "observatorium", "global_snapshot"), (docSnap) => {
      if (docSnap.exists()) {
        const payload = docSnap.data();
        setTrendData(payload.data || []);
        setActiveTrend(payload.active_trend || "");
      }
    });
    return () => unsub();
  }, []);

  // 2. Interaction Handler: The Neural Link
  const handleCountrySelection = (lat: number, lng: number, data: any) => {
    if (!cameraRef.current || !globeInstanceRef.current) return;

    const st = StringTune.getInstance();

    // Define the 'Zoom' Timeline
    // @ts-ignore
    st.timeline('country-zoom')
      .add({
        target: cameraRef.current.position,
        z: 180, // Move camera closer
        duration: 1200,
        easing: 'var(--spring-snappy)' // Using Phase 3 spring curve
      })
      .add({
        target: globeInstanceRef.current,
        // @ts-ignore
        pointOfView: { lat, lng, altitude: 0.5 },
        duration: 1200,
        easing: 'var(--spring-snappy)'
      }, 0)
      .play();

    setSelectedCountry(data);
    setIsCardVisible(true);
  };

  // 3. Initialize 3D Globe (Impeccable Rendering)
  useEffect(() => {
    if (!globeContainerRef.current) return;

    // Initialize the ThreeGlobe
    const Globe = new ThreeGlobe()
      .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-dark.jpg')
      .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
      .pointsData(trendData)
      .pointColor(() => '#60B1FF')
      .pointAltitude(0.07)
      .pointRadius(0.25)
      .pointsTransitionDuration(1000);

    // Interaction point (Phase 4)
    // @ts-ignore
    Globe.onPointClick((point: any) => {
      const { lat, lng } = point;
      handleCountrySelection(lat, lng, point);
    });

    // Pulse Anomaly Logic
    Globe.ringsData(trendData.filter(d => d.score > 70))
      .ringColor(() => '#FF4B4B')
      .ringMaxRadius(1.5)
      .ringPropagationSpeed(2)
      .ringRepeatPeriod(1200);

    globeInstanceRef.current = Globe;

    // Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    const currentRef = globeContainerRef.current;
    currentRef.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.add(Globe);
    scene.add(new THREE.AmbientLight(0xbbbbbb, 0.3));
    
    const dLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dLight.position.set(0, 1, 1);
    scene.add(dLight);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 400;
    cameraRef.current = camera;

    const animate = () => {
      if (!isCardVisible) {
        // @ts-ignore
        Globe.rotation.y += 0.002;
      }
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (currentRef) currentRef.innerHTML = '';
      renderer.dispose();
    };
  }, [trendData, isCardVisible]);

  return (
    <div className="relative w-full h-screen bg-[#030303] overflow-hidden">
      {/* 3D Canvas */}
      <div ref={globeContainerRef} className="absolute inset-0 z-0" />

      {/* Global Status Overlay */}
      <div className="absolute top-24 left-10 z-10 p-6 liquid-glass rounded-2xl max-w-sm">
        <h2 className="text-xs uppercase tracking-[0.3em] text-blue-400 mb-2">Space 01: Observatorium</h2>
        <h1 className="text-3xl font-bold text-white mb-4">Live Pulse</h1>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-gray-300 font-mono text-sm">Tracking: {activeTrend}</span>
        </div>
      </div>

      {/* Phase 4: Regional Breakout Card */}
      {isCardVisible && selectedCountry && (
        <div className="absolute right-10 top-1/2 -translate-y-1/2 w-80 z-20 transition-all duration-500">
          <div className="liquid-glass p-8 rounded-[32px] border border-white/20 shadow-2xl animate-slide-in">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-gray-400 text-xs tracking-widest uppercase mb-1">Region Insight</h3>
                <h2 className="text-2xl font-bold text-white tracking-tight">{selectedCountry.country}</h2>
              </div>
              <button 
                onClick={() => setIsCardVisible(false)}
                className="text-white/40 hover:text-white transition-colors p-2"
              >
                ✕
              </button>
            </div>

            {/* Metrics (Impeccable Layout) */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gray-500 uppercase tracking-wider">Search Intensity</span>
                  <span className="text-blue-400 font-mono">{selectedCountry.score}%</span>
                </div>
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-1000" 
                    style={{ width: `${selectedCountry.score}%` }} 
                  />
                </div>
              </div>

              {/* Actionable Insight with Sub-topics */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
                <p className="text-sm text-gray-300 leading-relaxed italic">
                  "Unusual spike detected in results. Potential for regional viral breakout."
                </p>
                {selectedCountry.metadata && selectedCountry.metadata.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                    {selectedCountry.metadata.map((topic: string, i: number) => (
                      <span key={i} className="text-[10px] bg-blue-500/10 text-blue-300 px-2 py-1 rounded-md border border-blue-500/20">
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button className="w-full py-4 bg-white text-black rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl">
                Analyze Deep Sentiment →
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Bottom Ticker */}
      <div className="absolute bottom-0 w-full h-12 bg-white/5 backdrop-blur-md border-t border-white/10 flex items-center z-20">
        <div className="animate-marquee px-4 flex gap-20">
           {trendData.map((d, i) => (
             <span key={i} className="text-[10px] font-mono text-gray-400 uppercase flex items-center gap-2">
               <span className="w-1 h-1 bg-blue-500 rounded-full" />
               <span className="text-white font-bold">{d.country}</span>: {d.score}
             </span>
           ))}
           {/* Duplicate for infinite effect */}
           {trendData.map((d, i) => (
             <span key={`dup-${i}`} className="text-[10px] font-mono text-gray-400 uppercase flex items-center gap-2">
               <span className="w-1 h-1 bg-blue-500 rounded-full" />
               <span className="text-white font-bold">{d.country}</span>: {d.score}
             </span>
           ))}
        </div>
      </div>
    </div>
  );
};

export default ObservatoriumGlobe;
