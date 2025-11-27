import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Simple3DBackground() {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.1;
      meshRef.current.rotation.y += delta * 0.15;
    }
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <>
      {/* Central glowing orb */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial 
          color="#0066ff" 
          transparent 
          opacity={0.1}
        />
      </mesh>

      {/* Floating particles */}
      <group ref={groupRef}>
        {Array.from({ length: 50 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * 20,
              (Math.random() - 0.5) * 20,
              (Math.random() - 0.5) * 20
            ]}
          >
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial 
              color={i % 3 === 0 ? '#0066ff' : i % 3 === 1 ? '#ff00ff' : '#00ff88'}
              transparent
              opacity={0.6}
            />
          </mesh>
        ))}
      </group>

      {/* Lights */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#0066ff" />
      <pointLight position={[-10, -10, 5]} intensity={0.5} color="#ff00ff" />
    </>
  );
}