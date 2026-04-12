import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, Effects } from '@react-three/drei';
import { UnrealBloomPass } from 'three-stdlib';
import * as THREE from 'three';

extend({ UnrealBloomPass });

const Swarm = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 1500; // Reduced count for performance in UI
  const speedMult = 0.3;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const pColor = useMemo(() => new THREE.Color(), []);
  const color = pColor;
  
  const positions = useMemo(() => {
     const pos = [];
     for(let i=0; i<count; i++) pos.push(new THREE.Vector3((Math.random()-0.5)*100, (Math.random()-0.5)*100, (Math.random()-0.5)*100));
     return pos;
  }, []);

  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xffffff }), []);
  const geometry = useMemo(() => new THREE.TetrahedronGeometry(0.25), []);

  const PARAMS = useMemo(() => ({"orbitScale":50,"transferEccentricity":0.21,"shipSpeed":1.0}), []);
  const addControl = (id: string, l: string, min: number, max: number, val: number) => {
      // @ts-ignore
      return PARAMS[id] !== undefined ? PARAMS[id] : val;
  };

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime() * speedMult;

    for (let i = 0; i < count; i++) {
        const orbitScale = addControl("orbitScale", "System Scale", 1.0, 50.0, 20.0);
        const transferEccentricity = addControl("transferEccentricity", "Transfer Shape", 0.0, 0.99, 0.21);
        const shipSpeed = addControl("shipSpeed", "Ship Speed", 0.1, 5.0, 1.0);
        
        // Use logic from user's sim but optimized
        let p1 = count * 0.1;
        let p2 = count * 0.3;
        let p3 = count * 0.5;
        let p4 = count * 0.8;
        
        let rEarth = 10.0 * orbitScale;
        let rMars = 15.2 * orbitScale;
        let a = (rEarth + rMars) / 2.0;
        let e = transferEccentricity;
        let b = a * Math.sqrt(Math.abs(1.0 - e * e));
        
        if (i < p1) {
          let hash1 = (i * 0.12345) % 1.0;
          let phi = Math.acos(1.0 - 2.0 * ((i * 0.345) % 1.0));
          let theta = ((i * 0.678) % 1.0) * Math.PI * 2.0;
          let r = 2.0 * orbitScale * hash1;
          let x = r * Math.sin(phi) * Math.cos(theta);
          let y = r * Math.sin(phi) * Math.sin(theta);
          let z = r * Math.cos(phi);
          target.set(x, y, z);
          color.setHSL(0.1 + hash1 * 0.05, 1.0, 0.5 + hash1 * 0.5);
        } else if (i < p2) {
          let idx = i - p1;
          let tot = p2 - p1;
          let angle = (idx / tot) * Math.PI * 2.0;
          target.set(Math.cos(angle) * rEarth, 0.0, Math.sin(angle) * rEarth);
          color.setHSL(0.6, 0.8, 0.5);
        } else if (i < p3) {
          let idx = i - p2;
          let tot = p3 - p2;
          let angle = (idx / tot) * Math.PI * 2.0;
          target.set(Math.cos(angle) * rMars, 0.0, Math.sin(angle) * rMars);
          color.setHSL(0.55, 0.9, 0.5);
        } else if (i < p4) {
          let idx = i - p3;
          let tot = p4 - p3;
          let E = (idx / tot) * Math.PI * 2.0;
          let x = a * Math.cos(E) - a * e;
          let z = b * Math.sin(E);
          target.set(x, 0.0, z);
          color.setHSL(0.5, 0.8, 0.3);
        } else {
          let idx = i - p4;
          let hash = (idx * 0.54321) % 1.0;
          let E_ship = (time * shipSpeed) % (Math.PI * 2.0);
          let cx = a * Math.cos(E_ship) - a * e;
          let cz = b * Math.sin(E_ship);
          let spread = 0.5 * orbitScale * hash;
          let phi = Math.acos(1.0 - 2.0 * ((idx * 0.111) % 1.0));
          let theta = ((idx * 0.222) % 1.0) * Math.PI * 2.0;
          let sx = cx + spread * Math.sin(phi) * Math.cos(theta);
          let sy = spread * Math.sin(phi) * Math.sin(theta);
          let sz = cz + spread * Math.cos(phi);
          target.set(sx, sy, sz);
          color.setHSL(0.55, 1.0, 0.8 + hash * 0.2); // Cyan dominant
        }

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

export default function ParticleSwarmOverlay() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
      <Canvas camera={{ position: [0, 40, 100], fov: 60 }} dpr={[1, 2]}>
        <fog attach="fog" args={['#030305', 50, 150]} />
        <Swarm />
        <OrbitControls autoRotate={true} autoRotateSpeed={0.5} enableZoom={false} enablePan={false} />
        <Effects disableGamma>
            {/* @ts-ignore */}
            <unrealBloomPass threshold={0.1} strength={1.2} radius={0.5} />
        </Effects>
      </Canvas>
    </div>
  );
}
