import React, { useEffect, useRef, useState } from 'react';
import ThreeGlobe from 'three-globe';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { db } from '../firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';

interface TrendPoint {
  lat: number;
  lng: number;
  country: string;
  score: number;
  metadata?: string[];
}

const ObservatoriumGlobe: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false); // ← Strict Mode guard

  const globeRef = useRef<any>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rafRef = useRef<number>(0);
  const trendDataRef = useRef<TrendPoint[]>([]); // live ref for raycaster

  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [activeTrend, setActiveTrend] = useState('CONNECTING...');
  const [card, setCard] = useState<TrendPoint | null>(null);

  // ── 1. Firebase listener ─────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'observatorium', 'global_snapshot'),
      (snap) => {
        if (snap.exists()) {
          const payload = snap.data();
          const data = (payload.data ?? []) as TrendPoint[];
          trendDataRef.current = data;
          setTrendData(data);
          setActiveTrend(payload.active_trend ?? 'SCANNING...');
        }
      },
      (err) => console.error('[Vault] Firestore error:', err)
    );
    return unsub;
  }, []);

  // ── 2. Three.js init – strict-mode safe ──────────────────────────────────
  useEffect(() => {
    if (initialized.current) return; // skip second Strict-Mode call
    if (!mountRef.current) return;
    initialized.current = true;

    const container = mountRef.current;

    // ── Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // ── Lighting (Brighter)
    scene.add(new THREE.AmbientLight(0xffffff, 1.2)); // Was 0.6
    const dir = new THREE.DirectionalLight(0xffffff, 2.5); // Was 1.5
    dir.position.set(300, 300, 100);
    scene.add(dir);

    // ── Camera (Bigger / Closer)
    const W = container.clientWidth || window.innerWidth;
    const H = container.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 10000);
    camera.position.set(0, 0, 280); // Was 450
    cameraRef.current = camera;

    // ── Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ── OrbitControls (Interactable)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 150;
    controls.maxDistance = 600;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;

    // ── Globe
    const globe = new ThreeGlobe({ animateIn: true });
    globe
      .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-dark.jpg')
      .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
      .showAtmosphere(true)
      .atmosphereColor('#2266ff')
      .atmosphereAltitude(0.15);
    scene.add(globe);
    globeRef.current = globe;

    // ── Click handler (raycaster)
    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.current.setFromCamera(mouse.current, camera);

      const hits = raycaster.current.intersectObjects(globe.children, true);
      for (const hit of hits) {
        const data = (hit.object as any).__data;
        if (data?.country) {
          // Temporarily disable auto-rotate when examining a card
          if (controls) controls.autoRotate = false;
          setCard(data as TrendPoint);
          return;
        }
      }
    };

    // ── Hover handler (to prevent scrolling hijacking)
    const handlePointerMove = (e: MouseEvent) => {
      if (!controls) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.current.setFromCamera(mouse.current, camera);

      // If hovering the globe, enable zoom. Otherwise, let the browser scroll.
      const hits = raycaster.current.intersectObjects(globe.children, true);
      controls.enableZoom = hits.length > 0;
    };

    renderer.domElement.addEventListener('click', handleClick);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);

    // ── Animation loop
    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      if (controls) {
        controls.update(); // OrbitControls handles the rotation if autoRotate is true
      } else {
        globe.rotation.y += 0.001;
      }
      renderer.render(scene, camera);
    };
    tick();

    // ── Resize
    const onResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // ── Cleanup
    return () => {
      initialized.current = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      try { container.removeChild(renderer.domElement); } catch (_) {}
      if (controls) controls.dispose();
      renderer.dispose();
      globeRef.current = null;
      rendererRef.current = null;
      cameraRef.current = null;
      sceneRef.current = null;
    };
  }, []);

  // ── 3. Update globe points when Firebase data arrives ───────────────────
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe || trendData.length === 0) return;

    globe
      .pointsData(trendData)
      .pointColor(() => '#4fa8ff')
      .pointAltitude(0.08)
      .pointRadius(0.4)
      .pointsMerge(false)
      .pointsTransitionDuration(800);

    globe
      .ringsData(trendData.filter((d) => d.score > 70))
      .ringColor(() => '#ff4040')
      .ringMaxRadius(3)
      .ringPropagationSpeed(2)
      .ringRepeatPeriod(800);
  }, [trendData]);

  // ── UI ───────────────────────────────────────────────────────────────────
  const ticker = trendData.length > 0
    ? [...trendData, ...trendData]
    : Array(12).fill({ country: 'STANDBY', score: '—' });

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        background: '#030303',
        overflow: 'hidden',
      }}
    >
      {/* Three.js mount point */}
      <div
        ref={mountRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          width: '100%',
          height: '100%',
        }}
      />

      {/* Status panel */}
      <div
        className="liquid-glass"
        style={{
          position: 'absolute',
          top: '96px',
          left: '32px',
          zIndex: 10,
          padding: '28px',
          borderRadius: '24px',
          maxWidth: '300px',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <p style={{ fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#60a5fa', fontWeight: 700, marginBottom: '8px' }}>
          Space 01 · Observatorium
        </p>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', marginBottom: '16px', letterSpacing: '-0.02em' }}>
          Global Pulse
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 2s infinite', flexShrink: 0 }} />
          <span style={{ color: 'white', fontFamily: 'monospace', fontSize: '14px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeTrend}
          </span>
        </div>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '12px' }}>
          {trendData.length > 0 ? `${trendData.length} nodes active` : 'Connecting to vault…'}
        </p>
      </div>

      {/* Regional Breakout Card */}
      {card && (
        <div
          className="animate-slide-in"
          style={{
            position: 'absolute',
            right: '32px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '320px',
            zIndex: 20,
          }}
        >
          <div
            className="liquid-glass"
            style={{
              padding: '32px',
              borderRadius: '32px',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.9)',
              backdropFilter: 'blur(24px)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <p style={{ fontSize: '9px', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#60a5fa', fontWeight: 700, marginBottom: '4px' }}>Regional Intel</p>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>{card.country}</h2>
              </div>
              <button
                onClick={() => setCard(null)}
                style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
              >
                ✕
              </button>
            </div>

            {/* Intensity */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 700, marginBottom: '8px' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Intensity</span>
                <span style={{ color: '#60a5fa', fontFamily: 'monospace' }}>{card.score}%</span>
              </div>
              <div style={{ height: '3px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${card.score}%`, background: 'linear-gradient(90deg, #2563eb, #22d3ee)', borderRadius: '2px', transition: 'width 1s ease' }} />
              </div>
            </div>

            {/* Insight */}
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', marginBottom: '24px' }}>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                Viral signal detected for <strong style={{ color: 'white' }}>{activeTrend}</strong> in this region.
              </p>
              {card.metadata && card.metadata.length > 0 && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>Rising Signals</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {card.metadata.map((tag, i) => (
                      <span key={i} style={{ fontSize: '9px', padding: '4px 10px', borderRadius: '8px', background: 'rgba(59,130,246,0.1)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.2)', fontWeight: 600 }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
            <button
              style={{ width: '100%', padding: '14px', background: 'white', color: 'black', border: 'none', borderRadius: '16px', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              Deep Sentiment Analysis →
            </button>
          </div>
        </div>
      )}

      {/* Bottom Ticker */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '48px',
          background: 'rgba(255,255,255,0.015)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          zIndex: 10,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        <div className="animate-marquee" style={{ display: 'flex', gap: '80px', whiteSpace: 'nowrap' }}>
          {ticker.map((d, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase' }}>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#3b82f6', opacity: 0.7, flexShrink: 0 }} />
              <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>{d.country}</span>
              <span style={{ color: '#60a5fa' }}>{d.score}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ObservatoriumGlobe;
