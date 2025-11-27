import React, { useState, useCallback } from 'react';
import { GameScene } from './GameScene';
import { AnimatedUI } from './AnimatedUI';
import { CheckersGame } from '../lib/gameEngine';
import { GameState, Position, Move } from '../types/game';
import { useCurrentAccount } from '@onelabs/dapp-kit';

export function GameView3D() {
  const currentAccount = useCurrentAccount();
  const [gameEngine] = useState(new CheckersGame());
  const [gameState, setGameState] = useState<GameState>(gameEngine.getState());
  const [isYourTurn, setIsYourTurn] = useState(true);

  const updateGameState = useCallback(() => {
    setGameState(gameEngine.getState());
  }, [gameEngine]);

  const handlePieceSelect = useCallback((row: number, col: number) => {
    if (!isYourTurn || gameState.gameStatus !== 'playing') return;
    
    gameEngine.selectPiece({ row, col });
    updateGameState();
  }, [gameEngine, isYourTurn, gameState.gameStatus, updateGameState]);

  const handleMove = useCallback((row: number, col: number) => {
    if (!isYourTurn || gameState.gameStatus !== 'playing') return;
    
    const selectedMove = gameState.validMoves.find(move => 
      move.to.row === row && move.to.col === col
    );

    if (selectedMove) {
      const success = gameEngine.makeMove(selectedMove);
      if (success) {
        updateGameState();
        
        if (gameEngine.getGameStatus() === 'playing') {
          setIsYourTurn(false);
          setTimeout(() => setIsYourTurn(true), 1000);
        }
      }
    }
  }, [gameEngine, isYourTurn, gameState, updateGameState]);

  const handleResetGame = useCallback(() => {
    gameEngine.resetGame();
    updateGameState();
    setIsYourTurn(true);
  }, [gameEngine, updateGameState]);

  if (!currentAccount) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        color: 'white'
      }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
        >
          <Text size="6" weight="bold">
            Please connect your wallet to play
          </Text>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <GameScene
        onPieceClick={handlePieceSelect}
        selectedPiece={gameState.selectedPiece}
        validMoves={gameState.validMoves.map(move => move.to)}
      />
      
      <AnimatedUI
        gameStatus={gameState.gameStatus}
        currentPlayer={gameState.currentPlayer}
        isYourTurn={isYourTurn}
        onReset={handleResetGame}
      >
        {/* You can add other 2D UI components here that float over the 3D scene */}
      </AnimatedUI>
    </>
  );
}