import { GameState, Piece, Position, Move } from '../types/game';

export class CheckersGame {
  private state: GameState;

  constructor() {
    this.state = this.getInitialState();
  }

  private getInitialState(): GameState {
    const board: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          if (row < 3) {
            board[row][col] = { type: 'normal', color: 'black' };
          } else if (row > 4) {
            board[row][col] = { type: 'normal', color: 'red' };
          }
        }
      }
    }

    return {
      board,
      currentPlayer: 'red',
      selectedPiece: null,
      validMoves: [],
      mandatoryCaptures: [],
      gameStatus: 'playing',
      moveHistory: [],
      consecutiveNonCaptureMoves: 0,
      lastCaptureOrKingMove: 0
    };
  }

  public getState(): GameState {
    return JSON.parse(JSON.stringify(this.state));
  }

  public selectPiece(position: Position): void {
    const piece = this.state.board[position.row][position.col];
    
    if (!piece || piece.color !== this.state.currentPlayer) {
      this.state.selectedPiece = null;
      this.state.validMoves = [];
      return;
    }

    this.state.selectedPiece = position;
    
    // For demo - simple valid moves
    const moves: Move[] = [];
    const directions = piece.type === 'king' 
      ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
      : piece.color === 'red' 
        ? [[-1, -1], [-1, 1]] 
        : [[1, -1], [1, 1]];

    for (const [dr, dc] of directions) {
      const newRow = position.row + dr;
      const newCol = position.col + dc;
      
      if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        if (!this.state.board[newRow][newCol]) {
          const isKingPromotion = piece.type === 'normal' && 
            ((piece.color === 'red' && newRow === 0) || 
             (piece.color === 'black' && newRow === 7));
          
          moves.push({
            from: position,
            to: { row: newRow, col: newCol },
            captures: [],
            isKingPromotion
          });
        }
      }
    }

    this.state.validMoves = moves;
  }

  public makeMove(move: Move): boolean {
    if (!this.state.selectedPiece) return false;

    const isValidMove = this.state.validMoves.some(validMove =>
      validMove.to.row === move.to.row && validMove.to.col === move.to.col
    );

    if (!isValidMove) return false;

    const piece = this.state.board[this.state.selectedPiece.row][this.state.selectedPiece.col];
    if (!piece) return false;

    // Execute move
    this.state.board[move.to.row][move.to.col] = {
      ...piece,
      type: move.isKingPromotion ? 'king' : piece.type
    };
    this.state.board[this.state.selectedPiece.row][this.state.selectedPiece.col] = null;

    // Add to move history
    this.state.moveHistory.push(move);

    // Check for game end
    this.checkGameEnd();

    // Switch player
    this.state.currentPlayer = this.state.currentPlayer === 'red' ? 'black' : 'red';

    // Reset selection
    this.state.selectedPiece = null;
    this.state.validMoves = [];

    return true;
  }

  private checkGameEnd(): void {
    // Simple game end check - count pieces
    let redPieces = 0;
    let blackPieces = 0;
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.state.board[row][col];
        if (piece) {
          if (piece.color === 'red') redPieces++;
          else blackPieces++;
        }
      }
    }

    if (redPieces === 0) {
      this.state.gameStatus = 'black_won';
    } else if (blackPieces === 0) {
      this.state.gameStatus = 'red_won';
    }
  }

  public resetGame(): void {
    this.state = this.getInitialState();
  }

  public getGameStatus(): string {
    return this.state.gameStatus;
  }
}