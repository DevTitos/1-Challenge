import { useState, useCallback } from 'react';
import { ProfessionalCheckersGame } from '../lib/professionalGameEngine';
import { GameState, Position, Move, GameSettings } from '../types/game';

export function useCheckersGame(settings: GameSettings = { stakeAmount: 0, rated: true }) {
  const [gameEngine] = useState(() => new ProfessionalCheckersGame(settings));
  const [gameState, setGameState] = useState<GameState>(gameEngine.getState());
  const [isYourTurn, setIsYourTurn] = useState(true);

  const updateGameState = useCallback(() => {
    setGameState(gameEngine.getState());
  }, [gameEngine]);

  const selectPiece = useCallback((position: Position) => {
    if (!isYourTurn || gameState.gameStatus !== 'playing') return;
    
    gameEngine.selectPiece(position);
    updateGameState();
  }, [gameEngine, isYourTurn, gameState.gameStatus, updateGameState]);

  const makeMove = useCallback((move: Move) => {
    if (!isYourTurn || gameState.gameStatus !== 'playing') return;
    
    const success = gameEngine.makeMove(move);
    if (success) {
      updateGameState();
      
      // If game continues and it's not a multiple jump, switch to opponent
      if (gameEngine.getGameStatus() === 'playing' && !move.isMultipleJump) {
        setIsYourTurn(false);
        
        // Simulate professional AI opponent
        setTimeout(() => {
          if (gameEngine.getGameStatus() === 'playing') {
            makeAIMove();
          }
          setIsYourTurn(true);
        }, 1000);
      }
    }
  }, [gameEngine, isYourTurn, gameState.gameStatus, updateGameState]);

  const makeAIMove = useCallback(() => {
    const currentState = gameEngine.getState();
    
    // Professional AI logic
    const allMoves: Move[] = [];
    
    // Get all possible moves for current player
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = currentState.board[row][col];
        if (piece && piece.color === currentState.currentPlayer) {
          gameEngine.selectPiece({ row, col });
          const moves = gameEngine.getState().validMoves;
          allMoves.push(...moves);
        }
      }
    }
    
    if (allMoves.length > 0) {
      // Prefer captures
      const captures = allMoves.filter(move => move.captures.length > 0);
      const movesToConsider = captures.length > 0 ? captures : allMoves;
      
      // Choose the best move (simple heuristic)
      let bestMove = movesToConsider[0];
      let bestScore = -Infinity;
      
      for (const move of movesToConsider) {
        let score = 0;
        
        // Prefer moves with more captures
        score += move.captures.length * 10;
        
        // Prefer king promotions
        if (move.isKingPromotion) score += 5;
        
        // Prefer center control
        const centerDistance = Math.abs(move.to.row - 3.5) + Math.abs(move.to.col - 3.5);
        score -= centerDistance * 0.1;
        
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }
      
      gameEngine.makeMove(bestMove);
      updateGameState();
    }
  }, [gameEngine, updateGameState]);

  const resign = useCallback(() => {
    gameEngine.resign(gameState.currentPlayer);
    updateGameState();
  }, [gameEngine, gameState.currentPlayer, updateGameState]);

  const offerDraw = useCallback(() => {
    const accepted = gameEngine.offerDraw();
    if (accepted) {
      updateGameState();
      return true;
    }
    return false;
  }, [gameEngine, updateGameState]);

  const resetGame = useCallback(() => {
    gameEngine.resetGame();
    updateGameState();
    setIsYourTurn(true);
  }, [gameEngine, updateGameState]);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (!isYourTurn || gameState.gameStatus !== 'playing') return;

    const piece = gameState.board[row][col];
    
    // If clicking on a piece of current player, select it
    if (piece && piece.color === gameState.currentPlayer) {
      selectPiece({ row, col });
    } 
    // If clicking on a valid move location, make the move
    else {
      const selectedMove = gameState.validMoves.find(move => 
        move.to.row === row && move.to.col === col
      );
      if (selectedMove) {
        makeMove(selectedMove);
      }
    }
  }, [gameState, isYourTurn, selectPiece, makeMove]);

  return {
    gameState,
    isYourTurn,
    selectPiece: handleCellClick,
    makeMove,
    resign,
    offerDraw,
    resetGame,
    gameStatus: gameState.gameStatus,
    currentPlayer: gameState.currentPlayer,
    rules: gameEngine.getRules(),
    exportGame: () => gameEngine.exportGameState()
  };
}