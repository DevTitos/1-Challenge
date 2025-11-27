export interface Player {
  id: string;
  address: string;
  username: string;
  wins: number;
  losses: number;
  totalStaked: number;
  rating: number;
}

export interface Challenge {
  id: string;
  challenger: string;
  opponent: string;
  stakeAmount: number;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  winner?: string;
  gameState?: string;
  currentPlayer: 'red' | 'black';
  createdAt: number;
}

export interface LeaderboardEntry {
  rank: number;
  player: Player;
  totalWinnings: number;
  winRate: number;
}

export type PieceType = 'normal' | 'king';
export type PlayerColor = 'red' | 'black';

export interface Piece {
  type: PieceType;
  color: PlayerColor;
}

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  captures: Position[];
  isKingPromotion: boolean;
  isMultipleJump?: boolean;
}

export interface GameState {
  board: (Piece | null)[][];
  currentPlayer: PlayerColor;
  selectedPiece: Position | null;
  validMoves: Move[];
  mandatoryCaptures: Move[];
  gameStatus: 'playing' | 'red_won' | 'black_won' | 'draw';
  moveHistory: Move[];
  consecutiveNonCaptureMoves: number; // For 40-move draw rule
  lastCaptureOrKingMove: number; // Track progress for draw conditions
}

export interface GameRules {
  mandatoryCaptures: boolean;
  kingMovesMultiple: boolean;
  canCaptureBackwards: boolean;
  flyingKings: boolean;
  maxConsecutiveNonCaptureMoves: number;
}

export interface GameSettings {
  timeControl?: {
    initialTime: number; // seconds
    increment: number; // seconds per move
  };
  stakeAmount: number;
  rated: boolean;
}