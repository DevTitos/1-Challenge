import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Float } from '@react-three/drei';
import { AnimatedBackground } from './AnimatedBackground';
import { AnimatedBoard } from './AnimatedBoard';

interface GameSceneProps {
  onPieceClick: (row: number, col: number) => void;
  selectedPiece: { row: number; col: number } | null;
  validMoves: { row: number; col: number }[];
}

export function GameScene({ onPieceClick, selectedPiece, validMoves }: GameSceneProps) {
  return (
    <div style={{ width: '100%', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
      <Canvas
        camera={{ position: [10, 8, 10], fov: 50 }}
        style={{ background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)' }}
      >
        <Suspense fallback={null}>
          <AnimatedBackground />
          
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <pointLight position={[-10, 10, -10]} intensity={0.5} color="#ff00ff" />
          
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <AnimatedBoard 
              onPieceClick={onPieceClick}
              selectedPiece={selectedPiece}
              validMoves={validMoves}
            />
          </Float>
          
          <OrbitControls 
            enablePan={false}
            enableZoom={true}
            minDistance={5}
            maxDistance={20}
            autoRotate={true}
            autoRotateSpeed={0.5}
          />
          
          <Environment preset="night" />
        </Suspense>
      </Canvas>
    </div>
  );
}