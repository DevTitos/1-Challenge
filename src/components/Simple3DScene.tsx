import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Working3DBackground } from './Working3DBackground';

export function Simple3DScene() {
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100vh',
      zIndex: 0,
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
    }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <Working3DBackground />
      </Canvas>
    </div>
  );
}