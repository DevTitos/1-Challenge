import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface AnimatedBoardProps {
  onPieceClick: (row: number, col: number) => void;
  selectedPiece: { row: number; col: number } | null;
  validMoves: { row: number; col: number }[];
}

export function AnimatedBoard({ onPieceClick, selectedPiece, validMoves }: AnimatedBoardProps) {
  const boardRef = useRef<THREE.Group>(null);
  const [hoveredPiece, setHoveredPiece] = useState<{ row: number; col: number } | null>(null);

  useFrame((state, delta) => {
    if (boardRef.current) {
      boardRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  const createBoard = () => {
    const tiles = [];
    const pieces = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const isDark = (row + col) % 2 === 1;
        const position = [col - 3.5, 0, row - 3.5];
        
        // Board tiles
        tiles.push(
          <mesh
            key={`tile-${row}-${col}`}
            position={[position[0], position[1], position[2]]}
            rotation={[-Math.PI / 2, 0, 0]}
            onClick={() => onPieceClick(row, col)}
            onPointerEnter={() => setHoveredPiece({ row, col })}
            onPointerLeave={() => setHoveredPiece(null)}
          >
            <planeGeometry args={[1, 1]} />
            <meshStandardMaterial 
              color={isDark ? '#8B4513' : '#F5DEB3'}
              transparent
              opacity={hoveredPiece?.row === row && hoveredPiece?.col === col ? 0.8 : 1}
            />
          </mesh>
        );
        
        // Game pieces (simplified for demo)
        if (isDark) {
          if (row < 3) {
            pieces.push(
              <Piece
                key={`piece-black-${row}-${col}`}
                position={[position[0], 0.2, position[2]]}
                color="#2C2C2C"
                isSelected={selectedPiece?.row === row && selectedPiece?.col === col}
                isKing={false}
              />
            );
          } else if (row > 4) {
            pieces.push(
              <Piece
                key={`piece-red-${row}-${col}`}
                position={[position[0], 0.2, position[2]]}
                color="#DC2626"
                isSelected={selectedPiece?.row === row && selectedPiece?.col === col}
                isKing={false}
              />
            );
          }
        }
        
        // Highlight valid moves
        const isValidMove = validMoves.some(move => move.row === row && move.col === col);
        if (isValidMove) {
          pieces.push(
            <mesh
              key={`highlight-${row}-${col}`}
              position={[position[0], 0.1, position[2]]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <ringGeometry args={[0.3, 0.5, 16]} />
              <meshBasicMaterial color="#00FF00" transparent opacity={0.6} />
            </mesh>
          );
        }
      }
    }
    
    return [...tiles, ...pieces];
  };

  return (
    <group ref={boardRef}>
      {/* Board base */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[9, 9, 0.2]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>
      
      {createBoard()}
      
      {/* Board border */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4, 4.5, 64]} />
        <meshStandardMaterial color="#8B4513" metalness={0.3} roughness={0.7} />
      </mesh>
    </group>
  );
}

interface PieceProps {
  position: [number, number, number];
  color: string;
  isSelected: boolean;
  isKing: boolean;
}

function Piece({ position, color, isSelected, isKing }: PieceProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      if (isSelected) {
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 5) * 0.1 + 0.1;
      } else {
        meshRef.current.position.y = position[1];
      }
      
      if (isKing) {
        meshRef.current.rotation.y += delta * 0.5;
      }
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.15, 32]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.3}
          roughness={0.4}
          emissive={isSelected ? new THREE.Color(1, 1, 0.3) : new THREE.Color(0, 0, 0)}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </mesh>
      
      {isKing && (
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.2, 0.3, 0.1, 16]} />
          <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
        </mesh>
      )}
    </group>
  );
}