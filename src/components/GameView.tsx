import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Flex, Text, Dialog } from '@radix-ui/themes';
import { CheckersBoard } from './CheckersBoard';
import { CheckersGame } from '../lib/gameEngine';
import { GameState, Position, Move } from '../types/game';
import { useCurrentAccount } from '@onelabs/dapp-kit';

export function GameView() {
  const currentAccount = useCurrentAccount();
  const [gameEngine] = useState(new CheckersGame());
  const [gameState, setGameState] = useState<GameState>(gameEngine.getState());
  const [isYourTurn, setIsYourTurn] = useState(true);
  const [showGameEndDialog, setShowGameEndDialog] = useState(false);

  const updateGameState = useCallback(() => {
    setGameState(gameEngine.getState());
  }, [gameEngine]);

  const handlePieceSelect = useCallback((position: Position) => {
    if (!isYourTurn || gameState.gameStatus !== 'playing') return;
    
    gameEngine.selectPiece(position);
    updateGameState();
  }, [gameEngine, isYourTurn, gameState.gameStatus, updateGameState]);

  const handleMove = useCallback((move: Move) => {
    if (!isYourTurn || gameState.gameStatus !== 'playing') return;
    
    const success = gameEngine.makeMove(move);
    if (success) {
      updateGameState();
      
      // In a real multiplayer game, this would be determined by the game state
      // For now, we'll simulate opponent thinking time
      if (gameEngine.getGameStatus() === 'playing') {
        setIsYourTurn(false);
        setTimeout(() => {
          // Simple AI move or wait for real opponent
          setIsYourTurn(true);
        }, 1000);
      } else {
        setShowGameEndDialog(true);
      }
    }
  }, [gameEngine, isYourTurn, gameState.gameStatus, updateGameState]);

  const handleResetGame = useCallback(() => {
    gameEngine.resetGame();
    updateGameState();
    setIsYourTurn(true);
    setShowGameEndDialog(false);
  }, [gameEngine, updateGameState]);

  const getGameResultMessage = () => {
    switch (gameState.gameStatus) {
      case 'red_won': return 'Red Player Wins!';
      case 'black_won': return 'Black Player Wins!';
      case 'draw': return 'Game Ended in Draw!';
      default: return '';
    }
  };

  if (!currentAccount) {
    return (
      <Box style={{ padding: '40px', textAlign: 'center', color: 'white' }}>
        <Text size="4" weight="bold">
          Please connect your wallet to play
        </Text>
      </Box>
    );
  }

  return (
    <Box style={{ padding: '20px' }}>
      <Flex direction="column" align="center" gap="4">
        <CheckersBoard
          gameState={gameState}
          onPieceSelect={handlePieceSelect}
          onMove={handleMove}
          isYourTurn={isYourTurn}
        />
        
        <Flex gap="3">
          <Button 
            onClick={handleResetGame}
            variant="soft"
            style={{ backgroundColor: '#374151', color: 'white' }}
          >
            New Game
          </Button>
          
          <Button 
            onClick={() => {
              // For demo - make a random valid move
              if (isYourTurn && gameState.validMoves.length > 0) {
                const randomMove = gameState.validMoves[
                  Math.floor(Math.random() * gameState.validMoves.length)
                ];
                handleMove(randomMove);
              }
            }}
            disabled={!isYourTurn || gameState.validMoves.length === 0}
            variant="outline"
            style={{ color: 'white', borderColor: 'white' }}
          >
            Suggest Move
          </Button>
        </Flex>

        {/* Game instructions */}
        <Box style={{ 
          maxWidth: '500px', 
          backgroundColor: '#374151', 
          padding: '16px', 
          borderRadius: '8px',
          color: 'white',
          marginTop: '20px'
        }}>
          <Text weight="bold" size="2">Game Rules:</Text>
          <Text size="1" as="div" style={{ marginTop: '8px' }}>
            • Red moves first<br/>
            • Normal pieces move diagonally forward<br/>
            • Kings can move diagonally in any direction<br/>
            • Captures are mandatory when available<br/>
            • Pieces become kings when reaching the opposite end<br/>
            • Multiple captures are allowed in one turn
          </Text>
        </Box>
      </Flex>

      {/* Game end dialog */}
      <Dialog.Root open={showGameEndDialog} onOpenChange={setShowGameEndDialog}>
        <Dialog.Content style={{ maxWidth: 400, textAlign: 'center' }}>
          <Dialog.Title>Game Over</Dialog.Title>
          <Text size="4" weight="bold" style={{ margin: '20px 0' }}>
            {getGameResultMessage()}
          </Text>
          <Flex gap="3" justify="center" style={{ marginTop: '20px' }}>
            <Button onClick={handleResetGame}>
              Play Again
            </Button>
            <Button variant="soft" onClick={() => setShowGameEndDialog(false)}>
              Close
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
}