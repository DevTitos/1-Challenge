import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Working3DBackground() {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
    }
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
    }
  });

  return (
    <>
      {/* Central animated element */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial 
          color="#0066ff" 
          transparent 
          opacity={0.1}
          wireframe
        />
      </mesh>

      {/* Floating elements */}
      <group ref={groupRef}>
        {Array.from({ length: 20 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              Math.sin(i) * 5,
              Math.cos(i * 0.5) * 5,
              Math.cos(i) * 5
            ]}
          >
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial 
              color={i % 2 === 0 ? '#0066ff' : '#ff00ff'}
              transparent
              opacity={0.6}
            />
          </mesh>
        ))}
      </group>

      <ambientLight intensity={0.5} />
    </>
  );
}