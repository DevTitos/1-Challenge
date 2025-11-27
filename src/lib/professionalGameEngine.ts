import { GameState, Piece, PieceType, PlayerColor, Position, Move, GameRules, GameSettings } from '../types/game';

export class ProfessionalCheckersGame {
  private state: GameState;
  private rules: GameRules = {
    mandatoryCaptures: true,
    kingMovesMultiple: true,
    canCaptureBackwards: true,
    flyingKings: true,
    maxConsecutiveNonCaptureMoves: 40
  };
  private settings: GameSettings;

  constructor(settings: GameSettings = { stakeAmount: 0, rated: true }) {
    this.settings = settings;
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

  public getRules(): GameRules {
    return { ...this.rules };
  }

  public selectPiece(position: Position): void {
    const piece = this.state.board[position.row][position.col];
    
    if (!piece || piece.color !== this.state.currentPlayer) {
      this.state.selectedPiece = null;
      this.state.validMoves = [];
      return;
    }

    this.state.selectedPiece = position;
    
    const allCaptures = this.findAllCaptures(this.state.currentPlayer);
    
    if (this.rules.mandatoryCaptures && allCaptures.length > 0) {
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
    let maxCaptureLength = 0;
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.state.board[row][col];
        if (piece && piece.color === player) {
          const pieceCaptures = this.findCapturesForPiece({ row, col }, [], true);
          if (pieceCaptures.length > 0) {
            const maxLength = Math.max(...pieceCaptures.map(move => move.captures.length));
            maxCaptureLength = Math.max(maxCaptureLength, maxLength);
          }
        }
      }
    }
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.state.board[row][col];
        if (piece && piece.color === player) {
          const pieceCaptures = this.findCapturesForPiece({ row, col }, [], true);
          const maxLengthCaptures = pieceCaptures.filter(move => move.captures.length === maxCaptureLength);
          captures.push(...maxLengthCaptures);
        }
      }
    }
    
    return captures;
  }

  private findCapturesForPiece(from: Position, previousCaptures: Position[], isInitial: boolean = false): Move[] {
    const piece = this.state.board[from.row][from.col];
    if (!piece) return [];

    const captures: Move[] = [];
    const directions = this.getCaptureDirections(piece);

    for (const [dr, dc] of directions) {
      const captureRow = from.row + dr;
      const captureCol = from.col + dc;
      const landingRow = from.row + 2 * dr;
      const landingCol = from.col + 2 * dc;

      if (this.isValidPosition(captureRow, captureCol) && 
          this.isValidPosition(landingRow, landingCol)) {
        
        const capturedPiece = this.state.board[captureRow][captureCol];
        const landingCell = this.state.board[landingRow][landingCol];

        const alreadyCaptured = previousCaptures.some(
          cap => cap.row === captureRow && cap.col === captureCol
        );

        if (capturedPiece && 
            capturedPiece.color !== piece.color && 
            !landingCell &&
            !alreadyCaptured) {
          
          const newCaptures = [...previousCaptures, { row: captureRow, col: captureCol }];
          const isKingPromotion = this.willBeKing(piece, landingRow);
          
          const captureMove: Move = {
            from: isInitial ? from : this.state.selectedPiece!,
            to: { row: landingRow, col: landingCol },
            captures: newCaptures,
            isKingPromotion,
            isMultipleJump: !isInitial
          };

          captures.push(captureMove);

          const additionalCaptures = this.findCapturesForPiece(
            { row: landingRow, col: landingCol },
            newCaptures,
            false
          );
          captures.push(...additionalCaptures);
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
      if (piece.type === 'king' && this.rules.flyingKings) {
        let distance = 1;
        while (true) {
          const newRow = from.row + dr * distance;
          const newCol = from.col + dc * distance;
          
          if (!this.isValidPosition(newRow, newCol)) break;
          
          if (this.state.board[newRow][newCol]) break;
          
          moves.push({
            from,
            to: { row: newRow, col: newCol },
            captures: [],
            isKingPromotion: false
          });
          
          distance++;
          if (!this.rules.kingMovesMultiple) break;
        }
      } else {
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

  private getCaptureDirections(piece: Piece): number[][] {
    if (piece.type === 'king' || this.rules.canCaptureBackwards) {
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

    const isValidMove = this.state.validMoves.some(validMove =>
      validMove.to.row === move.to.row && validMove.to.col === move.to.col
    );

    if (!isValidMove) return false;

    const piece = this.state.board[this.state.selectedPiece.row][this.state.selectedPiece.col];
    if (!piece) return false;

    this.state.board[move.to.row][move.to.col] = {
      ...piece,
      type: move.isKingPromotion ? 'king' : piece.type
    };
    this.state.board[this.state.selectedPiece.row][this.state.selectedPiece.col] = null;

    move.captures.forEach(capture => {
      this.state.board[capture.row][capture.col] = null;
    });

    this.state.moveHistory.push(move);
    
    if (move.captures.length > 0 || move.isKingPromotion) {
      this.state.consecutiveNonCaptureMoves = 0;
      this.state.lastCaptureOrKingMove = this.state.moveHistory.length;
    } else {
      this.state.consecutiveNonCaptureMoves++;
    }

    this.checkGameEnd();

    if (move.captures.length === 0 || !this.canCaptureFrom(move.to)) {
      this.state.currentPlayer = this.state.currentPlayer === 'red' ? 'black' : 'red';
      
      // Check if the new player has any moves
      if (this.state.gameStatus === 'playing') {
        const newPlayerHasMoves = this.hasAnyValidMoves(this.state.currentPlayer);
        if (!newPlayerHasMoves) {
          this.state.gameStatus = this.state.currentPlayer === 'red' ? 'black_won' : 'red_won';
        }
      }
    } else {
      this.state.selectedPiece = move.to;
      const additionalCaptures = this.findCapturesForPiece(move.to, move.captures, false);
      this.state.validMoves = additionalCaptures;
      this.state.mandatoryCaptures = additionalCaptures;
    }

    return true;
  }

  private canCaptureFrom(position: Position): boolean {
    const piece = this.state.board[position.row][position.col];
    if (!piece) return false;

    const directions = this.getCaptureDirections(piece);
    
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
    
    if (redPieces === 0) {
      this.state.gameStatus = 'black_won';
      return;
    }
    if (blackPieces === 0) {
      this.state.gameStatus = 'red_won';
      return;
    }

    // Check if current player has any legal moves
    const currentPlayerHasMoves = this.hasAnyValidMoves(this.state.currentPlayer);
    if (!currentPlayerHasMoves) {
      this.state.gameStatus = this.state.currentPlayer === 'red' ? 'black_won' : 'red_won';
      return;
    }

    if (this.state.consecutiveNonCaptureMoves >= this.rules.maxConsecutiveNonCaptureMoves) {
      this.state.gameStatus = 'draw';
      return;
    }

    if (this.hasInsufficientMaterial()) {
      this.state.gameStatus = 'draw';
      return;
    }
  }

  private hasAnyValidMoves(player: PlayerColor): boolean {
    // Check for any captures first
    const captures = this.findAllCaptures(player);
    if (captures.length > 0) return true;

    // Check for regular moves
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.state.board[row][col];
        if (piece && piece.color === player) {
          const moves = this.findValidMoves({ row, col });
          if (moves.length > 0) return true;
        }
      }
    }

    return false;
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

  private hasInsufficientMaterial(): boolean {
    const redPieces = this.getPieces('red');
    const blackPieces = this.getPieces('black');

    const onlyKings = 
      redPieces.every(p => p.type === 'king') && 
      blackPieces.every(p => p.type === 'king');

    if (onlyKings) {
      return redPieces.length + blackPieces.length <= 3;
    }

    return false;
  }

  private getPieces(color: PlayerColor): Piece[] {
    const pieces: Piece[] = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.state.board[row][col];
        if (piece && piece.color === color) {
          pieces.push(piece);
        }
      }
    }
    return pieces;
  }

  public resign(player: PlayerColor): void {
    this.state.gameStatus = player === 'red' ? 'black_won' : 'red_won';
  }

  public offerDraw(): boolean {
    if (this.state.moveHistory.length >= 20) {
      this.state.gameStatus = 'draw';
      return true;
    }
    return false;
  }

  public getGameStatus(): string {
    return this.state.gameStatus;
  }

  public resetGame(): void {
    this.state = this.getInitialState();
  }

  public exportGameState(): string {
    return JSON.stringify({
      state: this.state,
      rules: this.rules,
      settings: this.settings,
      timestamp: Date.now()
    });
  }

  public importGameState(gameState: string): boolean {
    try {
      const data = JSON.parse(gameState);
      this.state = data.state;
      this.rules = data.rules;
      this.settings = data.settings;
      return true;
    } catch {
      return false;
    }
  }
}