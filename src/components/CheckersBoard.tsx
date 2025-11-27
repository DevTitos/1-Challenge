import React from 'react';
import { GameState, Position, Move } from '../types/game';
import { Box, Flex, Text } from '@radix-ui/themes';

interface CheckersBoardProps {
  gameState: GameState;
  onPieceSelect: (position: Position) => void;
  onMove: (move: Move) => void;
  isYourTurn: boolean;
}

export function CheckersBoard({ 
  gameState, 
  onPieceSelect, 
  onMove, 
  isYourTurn 
}: CheckersBoardProps) {
  const renderPiece = (piece: any, row: number, col: number) => {
    if (!piece) return null;

    const isSelected = gameState.selectedPiece?.row === row && gameState.selectedPiece?.col === col;
    const isValidMove = gameState.validMoves.some(move => 
      move.to.row === row && move.to.col === col
    );

    const pieceColor = piece.color === 'red' ? '#dc2626' : '#1f2937';
    const crownColor = piece.color === 'red' ? '#fbbf24' : '#f59e0b';

    return (
      <Box
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: pieceColor,
          border: isSelected ? '3px solid #fbbf24' : '2px solid #d1d5db',
          cursor: isYourTurn ? 'pointer' : 'not-allowed',
          position: 'relative',
          boxShadow: isValidMove ? '0 0 0 2px #10b981' : 'none',
          transition: 'all 0.2s ease',
        }}
        onClick={() => {
          if (isYourTurn) {
            onPieceSelect({ row, col });
          }
        }}
      >
        {piece.type === 'king' && (
          <Box
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '20px',
              height: '20px',
              backgroundColor: crownColor,
              borderRadius: '50%',
              border: '2px solid #fef3c7'
            }}
          />
        )}
      </Box>
    );
  };

  const handleCellClick = (row: number, col: number) => {
    if (!isYourTurn || gameState.gameStatus !== 'playing') return;

    const selectedMove = gameState.validMoves.find(move => 
      move.to.row === row && move.to.col === col
    );

    if (selectedMove) {
      onMove(selectedMove);
    }
  };

  const getCellBackground = (row: number, col: number, isValidMove: boolean) => {
    if (isValidMove) {
      return 'radial-gradient(circle, #10b981 20%, transparent 20%)';
    }
    
    return (row + col) % 2 === 1 ? '#769656' : '#eeeed2';
  };

  const getStatusMessage = () => {
    if (gameState.gameStatus !== 'playing') {
      switch (gameState.gameStatus) {
        case 'red_won': return 'Red wins!';
        case 'black_won': return 'Black wins!';
        case 'draw': return 'Game ended in draw!';
        default: return '';
      }
    }

    if (gameState.mandatoryCaptures.length > 0) {
      return `Mandatory capture! ${gameState.currentPlayer}'s turn`;
    }

    return `${isYourTurn ? 'Your' : 'Opponent\'s'} turn - ${gameState.currentPlayer}`;
  };

  return (
    <Box style={{ padding: '20px' }}>
      <Flex direction="column" align="center" gap="4">
        <Text size="5" weight="bold" style={{ color: 'white' }}>
          Checkers Game
        </Text>
        
        {/* Game status */}
        <Box style={{ 
          padding: '10px 20px', 
          backgroundColor: gameState.gameStatus !== 'playing' ? '#dc2626' : '#374151',
          borderRadius: '8px',
          color: 'white'
        }}>
          <Text weight="bold">{getStatusMessage()}</Text>
          {gameState.mandatoryCaptures.length > 0 && (
            <Text size="1" style={{ color: '#fbbf24', marginTop: '4px' }}>
              You must capture opponent's piece!
            </Text>
          )}
        </Box>

        {/* Board */}
        <Box style={{ 
          border: '4px solid #8b5a2b',
          borderRadius: '8px',
          padding: '8px',
          backgroundColor: '#b58863'
        }}>
          <Flex direction="column" gap="0">
            {gameState.board.map((row, rowIndex) => (
              <Flex key={rowIndex} gap="0">
                {row.map((piece, colIndex) => {
                  const isValidMove = gameState.validMoves.some(move => 
                    move.to.row === rowIndex && move.to.col === colIndex
                  );
                  const isDark = (rowIndex + colIndex) % 2 === 1;

                  return (
                    <Box
                      key={`${rowIndex}-${colIndex}`}
                      style={{
                        width: '50px',
                        height: '50px',
                        background: getCellBackground(rowIndex, colIndex, isValidMove),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: isValidMove && isYourTurn ? 'pointer' : 'default',
                        position: 'relative',
                      }}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                    >
                      {renderPiece(piece, rowIndex, colIndex)}
                    </Box>
                  );
                })}
              </Flex>
            ))}
          </Flex>
        </Box>

        {/* Player info */}
        <Flex gap="6" style={{ color: 'white' }}>
          <Flex align="center" gap="2">
            <Box style={{ width: '20px', height: '20px', backgroundColor: '#dc2626', borderRadius: '50%' }} />
            <Text>Red Player</Text>
          </Flex>
          <Flex align="center" gap="2">
            <Box style={{ width: '20px', height: '20px', backgroundColor: '#1f2937', borderRadius: '50%' }} />
            <Text>Black Player</Text>
          </Flex>
        </Flex>

        {/* Move history */}
        {gameState.moveHistory.length > 0 && (
          <Box style={{ 
            backgroundColor: '#374151', 
            padding: '12px', 
            borderRadius: '8px',
            maxWidth: '400px',
            color: 'white'
          }}>
            <Text weight="bold" size="2">Last Move:</Text>
            <Text size="1">
              {gameState.moveHistory[gameState.moveHistory.length - 1].from.row},
              {gameState.moveHistory[gameState.moveHistory.length - 1].from.col} → 
              {gameState.moveHistory[gameState.moveHistory.length - 1].to.row},
              {gameState.moveHistory[gameState.moveHistory.length - 1].to.col}
              {gameState.moveHistory[gameState.moveHistory.length - 1].captures.length > 0 && 
                ` (Capture!)`}
            </Text>
          </Box>
        )}
      </Flex>
    </Box>
  );
}