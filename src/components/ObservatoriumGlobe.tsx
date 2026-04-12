import React, { useEffect, useRef, useState, useCallback } from 'react';
import ThreeGlobe from 'three-globe';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { db } from '../firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import { useStore } from '../store/useStore';
import VelocityGrid from './VelocityGrid';
import { useRedditData } from '../hooks/useRedditData';
import { getSubredditLocation } from '../utils/geoMapping';

interface TrendPoint {
  lat: number;
  lng: number;
  country: string;
  score: number;
  metadata?: string[];
}

const ObservatoriumGlobe: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const globeContainerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  const globeRef = useRef<any>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rafRef = useRef<number>(0);
  const trendDataRef = useRef<TrendPoint[]>([]);

  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [activeTrend, setActiveTrend] = useState('CONNECTING...');
  const [card, setCard] = useState<TrendPoint | null>(null);
  const [globeReady, setGlobeReady] = useState(false);
  const [redditPoints, setRedditPoints] = useState<any[]>([]);

  const { 
    activeSpace, setActiveSpace, setSelectedCountry, 
    selectedCountry, setVelocityData, globeFocusPoint, 
    setGlobeFocusPoint 
  } = useStore();
  
  const { data: redditData } = useRedditData(true, 300000);
  const isSpace02 = activeSpace === 'space-02';

  // ── Space transition handler ─────────────────────────────────────────────
  const transitionToSpace = useCallback((target: 'space-01' | 'space-02', country?: string | null) => {
    setActiveSpace(target);
    if (target === 'space-02') {
      setSelectedCountry(country ?? null);
      // Close any open country card when switching spaces
      setCard(null);
    } else {
      setSelectedCountry(null);
    }
  }, [setActiveSpace, setSelectedCountry]);

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

          // Push velocity_data to store if present
          if (payload.velocity_data) {
            setVelocityData(payload.velocity_data);
          }

          // Mark globe as ready for entrance animation trigger
          if (!globeReady) setGlobeReady(true);
        }
      },
      (err) => console.error('[Vault] Firestore error:', err)
    );
    return unsub;
  }, [globeReady, setVelocityData]);

  // ── 1.1 Process Reddit Data for Globe ────────────────────────────────────
  useEffect(() => {
    if (!redditData?.posts) return;
    
    const points = redditData.posts.map(post => {
      const loc = getSubredditLocation(post.subreddit);
      return {
        ...loc,
        score: post.engagement > 2000 ? 95 : 60,
        type: 'reddit',
        title: post.title,
        size: post.engagement > 2000 ? 0.6 : 0.3
      };
    });
    setRedditPoints(points);
  }, [redditData]);

  // ── 1.2 Handle Camera Focus ──────────────────────────────────────────────
  useEffect(() => {
    if (globeRef.current && globeFocusPoint) {
      const { lat, lng } = globeFocusPoint;
      
      // Stop auto-rotate to allow user to see the point
      if (globeRef.current?.__controls) {
        globeRef.current.__controls.autoRotate = false;
      }

      // Fly to point
      globeRef.current.pointOfView({ lat, lng, altitude: 0.6 }, 2500);
      
      // Cleanup: Clear focus point after trigger
      const timeout = setTimeout(() => {
        setGlobeFocusPoint(null);
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [globeFocusPoint, setGlobeFocusPoint]);

  // ── 2. Three.js init – strict-mode safe ──────────────────────────────────
  useEffect(() => {
    if (initialized.current) return;
    if (!mountRef.current) return;
    initialized.current = true;

    const container = mountRef.current;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const dir = new THREE.DirectionalLight(0xffffff, 2.5);
    dir.position.set(300, 300, 100);
    scene.add(dir);

    const W = container.clientWidth || window.innerWidth;
    const H = container.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 10000);
    camera.position.set(0, 0, 280);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 150;
    controls.maxDistance = 600;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;
    const globe = new ThreeGlobe({ animateIn: true });
    // @ts-ignore
    globe.__controls = controls;

    globe
      .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-dark.jpg')
      .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
      .showAtmosphere(true)
      .atmosphereColor('#2266ff')
      .atmosphereAltitude(0.15);
    scene.add(globe);
    globeRef.current = globe;

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.current.setFromCamera(mouse.current, camera);

      const hits = raycaster.current.intersectObjects(globe.children, true);
      for (const hit of hits) {
        const data = (hit.object as any).__data;
        if (data) {
          if (controls) controls.autoRotate = false;
          
          // Fly to the point
          globe.pointOfView({ lat: data.lat, lng: data.lng, altitude: 0.6 }, 2000);

          if (data.country) {
            // ── IMPLICIT Space 02 trigger: click on a country ──
            transitionToSpace('space-02', data.country);
            setCard(data as TrendPoint);
          }
          return;
        }
      }
    };

    const handlePointerMove = (e: MouseEvent) => {
      if (!controls) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.current.setFromCamera(mouse.current, camera);
      const hits = raycaster.current.intersectObjects(globe.children, true);
      controls.enableZoom = hits.length > 0;
    };

    renderer.domElement.addEventListener('click', handleClick);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      if (controls) controls.update();
      renderer.render(scene, camera);
    };
    tick();

    const onResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

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
  }, [transitionToSpace]);

  // ── 3. Update globe points when data arrives ────────────────────────────
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;

    // Combine Firestore and Reddit data
    const combinedPoints = [
      ...trendData,
      ...redditPoints
    ];

    const VIRAL_THRESHOLD = 70;

    globe
      .pointsData(combinedPoints)
      .pointColor((d: any) => {
        const score = Number(d.score);
        if (score >= VIRAL_THRESHOLD) return '#ff3333'; // Bright Red for spikes
        return d.type === 'reddit' ? '#60a5fa' : '#4fa8ff';
      })
      .pointAltitude((d: any) => {
        const score = Number(d.score);
        if (score >= VIRAL_THRESHOLD) return 0.25; 
        return d.type === 'reddit' ? 0.12 : 0.08;
      })
      .pointRadius((d: any) => d.type === 'reddit' ? (d.size || 0.4) : 0.4)
      .pointsMerge(false)
      .pointsTransitionDuration(800);

    globe
      .ringsData(combinedPoints.filter((d: any) => Number(d.score) >= VIRAL_THRESHOLD))
      .ringColor((d: any) => d.type === 'reddit' ? '#ef4444' : '#ff4040')
      .ringMaxRadius((d: any) => d.type === 'reddit' ? 5 : 3)
      .ringPropagationSpeed(2)
      .ringRepeatPeriod(800);

    setGlobeReady(true);
  }, [trendData, redditPoints]);

  // ── Ticker data ──────────────────────────────────────────────────────────
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
      {/* ── SPACE TOGGLE (centered at top) ── */}
      <div
        style={{
          position: 'absolute',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 30,
        }}
      >
        <div className="space-toggle">
          <button
            id="btn-space-01"
            className={`space-toggle-btn ${!isSpace02 ? 'active' : ''}`}
            onClick={() => transitionToSpace('space-01')}
          >
            <span style={{ fontSize: '13px' }}>🌍</span>
            <span>Global Pulse</span>
          </button>
          <button
            id="btn-space-02"
            className={`space-toggle-btn ${isSpace02 ? 'active' : ''}`}
            onClick={() => transitionToSpace('space-02', selectedCountry)}
          >
            <span style={{ fontSize: '13px' }}>⚡</span>
            <span>Velocity Matrix</span>
          </button>
        </div>
      </div>

      {/* ── ACTIVE TREND INDICATOR (slim, centered, non-intrusive) ── */}
      <div
        style={{
          position: 'absolute',
          top: '140px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '7px 18px',
          borderRadius: '100px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(12px)',
          pointerEvents: 'none',
          transition: 'opacity 0.4s ease',
          opacity: isSpace02 ? 0 : 1,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', animation: 'pulse 2s infinite', flexShrink: 0 }} />
        <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: 'rgba(255,255,255,0.75)', fontWeight: 700, letterSpacing: '0.05em' }}>
          {activeTrend}
        </span>
        {trendData.length > 0 && (
          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginLeft: '4px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            · {trendData.length} nodes
          </span>
        )}
      </div>

      {/* ── THREE.JS GLOBE CONTAINER (full screen, scales to mini-map in Space 02) ── */}
      <div
        ref={globeContainerRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          transformOrigin: 'top left',
          transition: 'transform 0.7s var(--spring-snappy), opacity 0.5s ease',
          transform: isSpace02
            ? 'scale(0.4) translate(-60px, 40px)'
            : 'scale(1) translate(0px, 0px)',
          opacity: isSpace02 ? 0.75 : 1,
        }}
      >
        <div
          ref={mountRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
          }}
        />
      </div>

      {/* ── Globe glow halo (Space 01 only) ── */}
      {!isSpace02 && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(34,102,255,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* ── SPACE 02 MINI-MAP LABEL ── */}
      {isSpace02 && (
        <div
          style={{
            position: 'absolute',
            top: '170px',
            left: '24px',
            zIndex: 15,
            padding: '6px 14px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(8px)',
            animation: 'card-enter-bouncy 0.4s var(--spring-bouncy) both',
          }}
        >
          <p style={{ fontSize: '8px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', fontWeight: 700, margin: 0 }}>
            Mini-Map
          </p>
          {selectedCountry && (
            <p style={{ fontSize: '10px', color: '#60a5fa', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", margin: '2px 0 0' }}>
              ◎ {selectedCountry}
            </p>
          )}
        </div>
      )}

      {/* ── VELOCITY GRID (Space 02) ── */}
      <VelocityGrid isVisible={isSpace02} />

      {/* ── REGIONAL BREAKOUT CARD (Space 01 only) ── */}
      {card && !isSpace02 && (
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

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 700, marginBottom: '8px' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Intensity</span>
                <span style={{ color: '#60a5fa', fontFamily: "'JetBrains Mono', monospace" }}>{card.score}%</span>
              </div>
              <div style={{ height: '3px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${card.score}%`, background: 'linear-gradient(90deg, #2563eb, #22d3ee)', borderRadius: '2px', transition: 'width 1s ease' }} />
              </div>
            </div>

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

            <button
              style={{ width: '100%', padding: '14px', background: 'white', color: 'black', border: 'none', borderRadius: '16px', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              onClick={() => transitionToSpace('space-02', card.country)}
            >
              Deep Velocity Analysis →
            </button>
          </div>
        </div>
      )}

      {/* ── BOTTOM TICKER ── */}
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
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>
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
