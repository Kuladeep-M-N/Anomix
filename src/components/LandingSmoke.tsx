import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, Effects } from '@react-three/drei';
import { UnrealBloomPass } from 'three-stdlib';
import * as THREE from 'three';

extend({ UnrealBloomPass });

const SmokeSwarm = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 5000; // Adjusted for UI performance
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

  // Material & Geom
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xffffff }), []);
  const geometry = useMemo(() => new THREE.TetrahedronGeometry(0.25), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime() * speedMult;

    // @ts-ignore
    if(material.uniforms && material.uniforms.uTime) {
         // @ts-ignore
         material.uniforms.uTime.value = time;
    }

    for (let i = 0; i < count; i++) {
        const height = 120;
        const spread = 2.0;
        const curl = 3.0;
        const rise = 1.2;
        const turbulence = 1.5;
        const fadeStart = 0.6;
        
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
        
        // Use a slightly bluer/purple hue to match the landing page theme
        let hue = 0.65; // Blue/indigo area
        let sat = 0.4 * puff;
        let light = 0.35 + 0.4 * puff;
        color.setHSL(hue, sat, light);

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

export default function LandingSmoke() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
      <Canvas camera={{ position: [0, 0, 100], fov: 60 }} dpr={[1, 2]}>
        <fog attach="fog" args={['#030303', 20, 150]} />
        <SmokeSwarm />
        <OrbitControls autoRotate={true} autoRotateSpeed={0.5} enableZoom={false} enablePan={false} />
        <Effects disableGamma>
            {/* @ts-ignore */}
            <unrealBloomPass threshold={0.1} strength={1.5} radius={0.5} />
        </Effects>
      </Canvas>
    </div>
  );
}
