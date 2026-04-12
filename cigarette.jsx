import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, Effects } from '@react-three/drei';
import { UnrealBloomPass } from 'three-stdlib';
import * as THREE from 'three';

extend({ UnrealBloomPass });

const ParticleSwarm = () => {
  const meshRef = useRef();
  const count = 10000;
  const speedMult = 0.3;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const pColor = useMemo(() => new THREE.Color(), []);
  const color = pColor; // Alias for user code compatibility
  
  const positions = useMemo(() => {
     const pos = [];
     for(let i=0; i<count; i++) pos.push(new THREE.Vector3((Math.random()-0.5)*100, (Math.random()-0.5)*100, (Math.random()-0.5)*100));
     return pos;
  }, []);

  // Material & Geom
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xffffff }), []);
  const geometry = useMemo(() => new THREE.TetrahedronGeometry(0.25), []);

  const PARAMS = useMemo(() => ({"height":120,"spread":2,"curl":3,"rise":1.2,"turb":1.5,"fadeStart":0.6}), []);
  const addControl = (id, l, min, max, val) => {
      return PARAMS[id] !== undefined ? PARAMS[id] : val;
  };
  const setInfo = () => {};
  const annotate = () => {};

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime() * speedMult;
    const THREE_LIB = THREE;

    if(material.uniforms && material.uniforms.uTime) {
         material.uniforms.uTime.value = time;
    }

    for (let i = 0; i < count; i++) {
        // USER CODE START
        const height = addControl("height", "Smoke Height", 20, 220, 120);
        const spread = addControl("spread", "Spread", 0.2, 8, 2.0);
        const curl = addControl("curl", "Curl", 0, 8, 3.0);
        const rise = addControl("rise", "Rise Speed", 0.1, 4, 1.2);
        const turbulence = addControl("turb", "Turbulence", 0, 4, 1.5);
        const fadeStart = addControl("fadeStart", "Fade Start", 0.3, 0.9, 0.6);
        const t = time * rise;
        const n = i / count;
        let life = (n + t * 0.15) % 1.0;
        let y = life * height;
        let disperse = life * life * spread;
        let a = i * 0.754877666 + t * curl + Math.sin(y * 0.25 + t) * 0.8;
        let x = Math.cos(a) * disperse;
        let z = Math.sin(a) * disperse;
        x += Math.sin(y * 0.7 + t * 1.3) * turbulence * life;
        z += Math.cos(y * 0.6 + t * 1.4) * turbulence * life;
        let fade = 1.0 - Math.max(0, (life - fadeStart) / (1.0 - fadeStart));
        let puff = fade * fade;
        target.set(
        x * (0.5 + life * 2.0),
        y - height * 0.5,
        z * (0.5 + life * 2.0)
        );
        let hue = 0.08;
        let sat = 0.05 * puff;
        let light = 0.35 + 0.4 * puff;
        color.setHSL(hue, sat, light);
        if (i === 0) {
        setInfo("Dispersing Cigarette Smoke", "Smoke particles detach into drifting puffs that spread outward and fade away instead of forming a continuous column.");
        annotate("tip", new THREE.Vector3(0, -height * 0.5, 0), "Cigarette Tip");
        }
        // USER CODE END

        positions[i].lerp(target, 0.1);
        dummy.position.copy(positions[i]);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
        meshRef.current.setColorAt(i, pColor);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, count]} />
  );
};

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas camera={{ position: [0, 0, 100], fov: 60 }}>
        <fog attach="fog" args={['#000000', 0.01]} />
        <ParticleSwarm />
        <OrbitControls autoRotate={true} />
        <Effects disableGamma>
            <unrealBloomPass threshold={0} strength={1.8} radius={0.4} />
        </Effects>
      </Canvas>
    </div>
  );
}