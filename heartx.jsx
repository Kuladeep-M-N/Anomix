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

  const PARAMS = useMemo(() => ({"spd":1.2,"glo":0.8}), []);
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
        const spd = addControl("spd", "Wave Speed", 0.5, 3.0, 1.2);
        const glo = addControl("glo", "Glow", 0.0, 1.0, 0.8);
        
        const tn = i / count;
        const cyc = 14.0 / spd;
        const ph = (time % cyc) / cyc;
        
        const seed1 = Math.sin(i * 127.1) * 0.5 + 0.5;
        const seed2 = Math.cos(i * 269.5) * 0.5 + 0.5;
        const seed3 = Math.sin(i * 419.2 + 83.3);
        const seed4 = Math.cos(i * 311.7 + 47.1);
        
        const ns1 = seed3 * 2.0;
        const ns2 = seed4 * 2.0;
        const ns3 = Math.sin(i * 73.9) * 3.0;
        
        // ---- EKG SCROLLING LINE ----
        // Particles are spread across x axis
        // Each particle has a fixed x position
        // Its y is determined by the EKG waveform function at that x offset
        // The waveform scrolls: offset = time * speed
        
        const xPos = (tn - 0.5) * 320.0;
        
        // Scrolling EKG: sample the waveform at (xPos - time*scroll)
        const scroll = time * 40.0 * spd;
        const wx = ((xPos + scroll) % 160.0 + 160.0) % 160.0;
        const wu = wx / 160.0;
        
        // P wave
        const pW = Math.exp(-Math.pow((wu - 0.12) * 18.0, 2.0)) * 14.0;
        // Q dip
        const qW = -Math.exp(-Math.pow((wu - 0.28) * 40.0, 2.0)) * 10.0;
        // R spike — sharp tall
        const rW = Math.exp(-Math.pow((wu - 0.35) * 28.0, 2.0)) * 90.0;
        // S dip
        const sW = -Math.exp(-Math.pow((wu - 0.42) * 32.0, 2.0)) * 18.0;
        // T wave
        const tW = Math.exp(-Math.pow((wu - 0.62) * 12.0, 2.0)) * 22.0;
        
        const ekgVal = pW + qW + rW + sW + tW;
        
        const aX = xPos + ns1 * 0.6;
        const aY = ekgVal + ns2 * 0.8;
        const aZ = ns3 * 0.5;
        
        // ---- SCATTERED SPHERE ----
        const phi_s = Math.acos(Math.max(-1.0, Math.min(1.0, 1.0 - 2.0 * tn)));
        const theta_s = 2.3998 * i;
        const sphR = 140.0;
        const dX = sphR * Math.sin(phi_s) * Math.cos(theta_s);
        const dY = sphR * Math.sin(phi_s) * Math.sin(theta_s);
        const dZ = sphR * Math.cos(phi_s);
        
        // ---- MORPH SCHEDULE ----
        // 0.00 - 0.55 : EKG scrolling
        // 0.55 - 0.70 : EKG explodes out to sphere
        // 0.70 - 0.82 : Sphere held — particles drift slowly
        // 0.82 - 1.00 : Sphere collapses back to EKG
        
        const explode = Math.max(0.0, Math.min(1.0, (ph - 0.55) / 0.15));
        const hold    = ph > 0.70 && ph < 0.82 ? 1.0 : 0.0;
        const collapse = Math.max(0.0, Math.min(1.0, (ph - 0.82) / 0.18));
        
        const eExp = explode * explode * (3.0 - 2.0 * explode);
        const eCol = collapse * collapse * (3.0 - 2.0 * collapse);
        
        const inEkg = ph < 0.55 ? 1.0 : 0.0;
        const inExp = ph >= 0.55 && ph < 0.70 ? 1.0 : 0.0;
        const inHold = hold;
        const inCol = ph >= 0.82 ? 1.0 : 0.0;
        
        const fX = inEkg * aX
                 + inExp * (aX + (dX - aX) * eExp)
                 + inHold * dX
                 + inCol * (dX + (aX - dX) * eCol);
        
        const fY = inEkg * aY
                 + inExp * (aY + (dY - aY) * eExp)
                 + inHold * dY
                 + inCol * (dY + (aY - dY) * eCol);
        
        const fZ = inEkg * aZ
                 + inExp * (aZ + (dZ - aZ) * eExp)
                 + inHold * dZ
                 + inCol * (dZ + (aZ - dZ) * eCol);
        
        // Slow drift on sphere
        const driftX = (inHold + inCol * (1.0 - eCol)) * Math.sin(time * 0.3 + tn * 6.28) * 3.0;
        const driftY = (inHold + inCol * (1.0 - eCol)) * Math.cos(time * 0.25 + tn * 6.28) * 2.0;
        
        target.set(fX + driftX, fY + driftY, fZ);
        
        // ---- COLOR ----
        const inSphere = 1.0 - inEkg;
        const rSpike = Math.exp(-Math.pow((wu - 0.35) * 28.0, 2.0));
        const isSpike = rSpike > 0.3 ? 1.0 : 0.0;
        
        // EKG phase: electric cyan-blue, spike particles bright white
        const hueEkg = 0.565 + tn * 0.04;
        const litEkg = 0.08 + isSpike * 0.85 + (1.0 - isSpike) * (ekgVal / 90.0 + 0.08) * glo;
        
        // Sphere phase: deep blue with bright outer stars
        const isBright = tn < 0.04 ? 1.0 : 0.0;
        const hueSph = 0.60 + tn * 0.05;
        const litSph = isBright * 0.95 + (1.0 - isBright) * (0.08 + glo * 0.18);
        
        const hFinal = inEkg * hueEkg + inSphere * hueSph;
        const lFinal = inEkg * Math.max(0.04, Math.min(litEkg, 1.0)) + inSphere * litSph;
        
        color.setHSL(hFinal, 0.9, Math.min(lFinal, 1.0));
        
        if (i === 0) setInfo("RxGuard", "Live EKG signal. Particles explode to sphere then collapse back.");
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