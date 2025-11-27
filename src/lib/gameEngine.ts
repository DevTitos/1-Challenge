import { GameState, Piece, PieceType, PlayerColor, Position, Move, GameRules } from '../types/game';

export class CheckersGame {
  private state: GameState;
  private rules: GameRules = {
    mandatoryCaptures: true,
    kingMovesMultiple: true,
    canCaptureBackwards: true
  };

  constructor() {
    this.state = this.getInitialState();
  }

  private getInitialState(): GameState {
    const board: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // Initialize pieces
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
      moveHistory: []
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
    
    // Check for mandatory captures first
    const allCaptures = this.findAllCaptures(this.state.currentPlayer);
    
    if (this.rules.mandatoryCaptures && allCaptures.length > 0) {
      // Only show captures for this specific piece if it has any
      const pieceCaptures = allCaptures.filter(capture => 
        capture.from.row === position.row && capture.from.col === position.col
      );
      this.state.validMoves = pieceCaptures;
      this.state.mandatoryCaptures = allCaptures;
    } else {
      this.state.validMoves = this.findValidMoves(position);
      this.state.mandatoryCaptures = [];
    }
  }

  private findAllCaptures(player: PlayerColor): Move[] {
    const captures: Move[] = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.state.board[row][col];
        if (piece && piece.color === player) {
          const pieceCaptures = this.findCaptures({ row, col });
          captures.push(...pieceCaptures);
        }
      }
    }
    
    return captures;
  }

  private findCaptures(from: Position): Move[] {
    const piece = this.state.board[from.row][from.col];
    if (!piece) return [];

    const captures: Move[] = [];
    const directions = this.getMoveDirections(piece);

    for (const [dr, dc] of directions) {
      const captureRow = from.row + dr;
      const captureCol = from.col + dc;
      const landingRow = from.row + 2 * dr;
      const landingCol = from.col + 2 * dc;

      // Check if capture is possible
      if (this.isValidPosition(captureRow, captureCol) && 
          this.isValidPosition(landingRow, landingCol)) {
        
        const capturedPiece = this.state.board[captureRow][captureCol];
        const landingCell = this.state.board[landingRow][landingCol];

        if (capturedPiece && 
            capturedPiece.color !== piece.color && 
            !landingCell) {
          
          const isKingPromotion = this.willBeKing(piece, landingRow);
          
          captures.push({
            from,
            to: { row: landingRow, col: landingCol },
            captures: [{ row: captureRow, col: captureCol }],
            isKingPromotion
          });

          // Check for multiple jumps (only for the same piece)
          if (piece.type === 'king' && this.rules.kingMovesMultiple) {
            const additionalCaptures = this.findMultipleCaptures(
              { row: landingRow, col: landingCol },
              [...directions],
              [...captures[0].captures]
            );
            captures.push(...additionalCaptures);
          }
        }
      }
    }

    return captures;
  }

  private findMultipleCaptures(
    from: Position, 
    directions: number[][], 
    previousCaptures: Position[]
  ): Move[] {
    const piece = this.state.board[from.row][from.col];
    if (!piece) return [];

    const captures: Move[] = [];

    for (const [dr, dc] of directions) {
      const captureRow = from.row + dr;
      const captureCol = from.col + dc;
      const landingRow = from.row + 2 * dr;
      const landingCol = from.col + 2 * dc;

      if (this.isValidPosition(captureRow, captureCol) && 
          this.isValidPosition(landingRow, landingCol)) {
        
        const capturedPiece = this.state.board[captureRow][captureCol];
        const landingCell = this.state.board[landingRow][landingCol];

        // Check if this position hasn't been captured already and landing is empty
        const alreadyCaptured = previousCaptures.some(
          cap => cap.row === captureRow && cap.col === captureCol
        );

        if (capturedPiece && 
            capturedPiece.color !== piece.color && 
            !landingCell &&
            !alreadyCaptured) {
          
          const allCaptures = [...previousCaptures, { row: captureRow, col: captureCol }];
          const isKingPromotion = this.willBeKing(piece, landingRow);
          
          captures.push({
            from: this.state.selectedPiece!, // Original piece position
            to: { row: landingRow, col: landingCol },
            captures: allCaptures,
            isKingPromotion
          });

          // Recursively find more captures
          const moreCaptures = this.findMultipleCaptures(
            { row: landingRow, col: landingCol },
            directions,
            allCaptures
          );
          captures.push(...moreCaptures);
        }
      }
    }

    return captures;
  }

  private findValidMoves(from: Position): Move[] {
    const piece = this.state.board[from.row][from.col];
    if (!piece) return [];

    const moves: Move[] = [];
    const directions = this.getMoveDirections(piece);

    for (const [dr, dc] of directions) {
      const newRow = from.row + dr;
      const newCol = from.col + dc;

      if (this.isValidPosition(newRow, newCol) && !this.state.board[newRow][newCol]) {
        const isKingPromotion = this.willBeKing(piece, newRow);
        
        moves.push({
          from,
          to: { row: newRow, col: newCol },
          captures: [],
          isKingPromotion
        });
      }
    }

    return moves;
  }

  private getMoveDirections(piece: Piece): number[][] {
    if (piece.type === 'king') {
      return [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    }
    
    return piece.color === 'red' 
      ? [[-1, -1], [-1, 1]] 
      : [[1, -1], [1, 1]];
  }

  private isValidPosition(row: number, col: number): boolean {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }

  private willBeKing(piece: Piece, newRow: number): boolean {
    return piece.type === 'normal' && 
      ((piece.color === 'red' && newRow === 0) || 
       (piece.color === 'black' && newRow === 7));
  }

  public makeMove(move: Move): boolean {
    if (!this.state.selectedPiece) return false;

    // Validate move
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

    // Remove captured pieces
    move.captures.forEach(capture => {
      this.state.board[capture.row][capture.col] = null;
    });

    // Add to move history
    this.state.moveHistory.push(move);

    // Check for game end
    this.checkGameEnd();

    // Switch player if no additional captures are possible
    if (move.captures.length === 0 || !this.canCaptureFrom(move.to)) {
      this.state.currentPlayer = this.state.currentPlayer === 'red' ? 'black' : 'red';
    }

    // Reset selection
    this.state.selectedPiece = null;
    this.state.validMoves = [];
    this.state.mandatoryCaptures = [];

    return true;
  }

  private canCaptureFrom(position: Position): boolean {
    const piece = this.state.board[position.row][position.col];
    if (!piece) return false;

    const directions = this.getMoveDirections(piece);
    
    for (const [dr, dc] of directions) {
      const captureRow = position.row + dr;
      const captureCol = position.col + dc;
      const landingRow = position.row + 2 * dr;
      const landingCol = position.col + 2 * dc;

      if (this.isValidPosition(captureRow, captureCol) && 
          this.isValidPosition(landingRow, landingCol)) {
        
        const capturedPiece = this.state.board[captureRow][captureCol];
        const landingCell = this.state.board[landingRow][landingCol];

        if (capturedPiece && 
            capturedPiece.color !== piece.color && 
            !landingCell) {
          return true;
        }
      }
    }

    return false;
  }

  private checkGameEnd(): void {
    const redPieces = this.countPieces('red');
    const blackPieces = this.countPieces('black');
    const redMoves = this.hasValidMoves('red');
    const blackMoves = this.hasValidMoves('black');

    if (redPieces === 0 || !redMoves) {
      this.state.gameStatus = 'black_won';
    } else if (blackPieces === 0 || !blackMoves) {
      this.state.gameStatus = 'red_won';
    } else if (!redMoves && !blackMoves) {
      this.state.gameStatus = 'draw';
    }
  }

  private countPieces(color: PlayerColor): number {
    let count = 0;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.state.board[row][col];
        if (piece && piece.color === color) {
          count++;
        }
      }
    }
    return count;
  }

  private hasValidMoves(color: PlayerColor): boolean {
    // Check for any captures first
    const captures = this.findAllCaptures(color);
    if (captures.length > 0) return true;

    // Check for regular moves
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.state.board[row][col];
        if (piece && piece.color === color) {
          const moves = this.findValidMoves({ row, col });
          if (moves.length > 0) return true;
        }
      }
    }

    return false;
  }

  public resetGame(): void {
    this.state = this.getInitialState();
  }

  public getGameStatus(): string {
    return this.state.gameStatus;
  }
}