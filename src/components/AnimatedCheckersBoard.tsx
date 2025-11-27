import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Flex, Text, Button, Dialog } from '@radix-ui/themes';

interface AnimatedCheckersBoardProps {
  onPieceClick: (row: number, col: number) => void;
  selectedPiece: { row: number; col: number } | null;
  validMoves: any[];
  board: any[][];
  currentPlayer: string;
  isYourTurn: boolean;
  gameStatus: string;
  consecutiveNonCaptureMoves: number;
  onResign: () => void;
  onOfferDraw: () => void;
  onNewGame: () => void;
}

export function AnimatedCheckersBoard({ 
  onPieceClick, 
  selectedPiece, 
  validMoves, 
  board,
  currentPlayer,
  isYourTurn,
  gameStatus,
  consecutiveNonCaptureMoves,
  onResign,
  onOfferDraw,
  onNewGame
}: AnimatedCheckersBoardProps) {
  const [, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [showResignConfirm, setShowResignConfirm] = useState(false);
  const [showDrawConfirm, setShowDrawConfirm] = useState(false);

  const isMultipleJump = selectedPiece && validMoves.some((move: any) => move.isMultipleJump);

  const renderBoard = () => {
    const boardElements = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const isDark = (row + col) % 2 === 1;
        const isSelected = selectedPiece?.row === row && selectedPiece?.col === col;
        const isValidMove = validMoves.some((move: any) => move.to.row === row && move.to.col === col);
        const piece = board[row][col];

        const isCaptureMove = validMoves.some((move: any) => 
          move.to.row === row && move.to.col === col && move.captures && move.captures.length > 0
        );

        boardElements.push(
          <motion.div
            key={`${row}-${col}`}
            className={`cell ${isDark ? 'dark' : 'light'} ${isSelected ? 'selected' : ''} ${isValidMove ? 'valid-move' : ''} ${isCaptureMove ? 'capture-move' : ''}`}
            onClick={() => onPieceClick(row, col)}
            onHoverStart={() => setHoveredCell({ row, col })}
            onHoverEnd={() => setHoveredCell(null)}
            whileHover={{ scale: isYourTurn && (piece?.color === currentPlayer || isValidMove) ? 1.05 : 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            style={{ 
              cursor: isYourTurn && (piece?.color === currentPlayer || isValidMove) ? 'pointer' : 'not-allowed'
            }}
          >
            {(row === 7 || col === 0) && (
              <div className="coordinate-label">
                {row === 7 && <span className="file-label">{String.fromCharCode(97 + col)}</span>}
                {col === 0 && <span className="rank-label">{8 - row}</span>}
              </div>
            )}

            {piece && (
              <motion.div
                className={`piece ${piece.color} ${piece.type === 'king' ? 'king' : ''} ${isSelected ? 'selected' : ''}`}
                layoutId={isSelected ? `piece-${row}-${col}` : undefined}
                animate={{
                  scale: isSelected ? 1.2 : 1,
                  y: isSelected ? -5 : 0,
                }}
                whileHover={{
                  scale: isYourTurn && piece.color === currentPlayer ? 1.1 : 1,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                {piece.type === 'king' && (
                  <motion.div 
                    className="crown"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    ♔
                  </motion.div>
                )}
                
                {isYourTurn && piece.color === currentPlayer && (
                  <motion.div 
                    className="player-glow"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
            )}
            
            {isValidMove && (
              <motion.div
                className={`move-indicator ${isCaptureMove ? 'capture' : 'normal'}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              >
                {isCaptureMove && (
                  <motion.div
                    className="capture-pulse"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </motion.div>
            )}

            {selectedPiece && selectedPiece.row === row && selectedPiece.col === col && (
              <motion.div
                className="last-move-highlight"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
            )}
          </motion.div>
        );
      }
    }
    
    return boardElements;
  };

  const getStatusMessage = () => {
    if (gameStatus !== 'playing') {
      switch (gameStatus) {
        case 'red_won': return 'Red Wins! 🎉';
        case 'black_won': return 'Black Wins! 🎉';
        case 'draw': return 'Game Draw! 🤝';
        default: return 'Game Over';
      }
    }

    // Check for no moves situation
    const currentPlayerHasNoMoves = validMoves.length === 0 && selectedPiece === null;
    if (currentPlayerHasNoMoves) {
      return `No legal moves! ${currentPlayer === 'red' ? 'Black' : 'Red'} wins!`;
    }

    if (isMultipleJump) {
      return `Continue capturing! ${currentPlayer}'s turn`;
    }

    if (validMoves.length > 0 && validMoves[0]?.captures?.length > 0) {
      return `Mandatory capture! ${currentPlayer}'s turn`;
    }

    return `${isYourTurn ? 'Your' : 'Opponent\'s'} turn - ${currentPlayer}`;
  };

  const getStatusColor = () => {
    if (gameStatus !== 'playing') return '#ffaa00';
    
    const currentPlayerHasNoMoves = validMoves.length === 0 && selectedPiece === null;
    if (currentPlayerHasNoMoves) return '#ff4444';
    if (isMultipleJump || (validMoves.length > 0 && validMoves[0]?.captures?.length > 0)) return '#ff4444';
    return isYourTurn ? '#00ff00' : '#ff4444';
  };

  return (
    <Box style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <Flex direction="column" align="center" gap="3" style={{ width: '100%', maxWidth: '600px' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="game-status"
          style={{ 
            background: 'rgba(15, 15, 35, 0.95)',
            backdropFilter: 'blur(20px)',
            border: `2px solid ${getStatusColor()}`,
            padding: '1rem 2rem',
            borderRadius: '12px',
            textAlign: 'center',
            width: '100%'
          }}
        >
          <Text size="4" weight="bold" style={{ color: getStatusColor() }}>
            {getStatusMessage()}
          </Text>
          
          <Flex justify="center" gap="4" style={{ marginTop: '0.5rem' }}>
            <Text size="1" style={{ color: '#ccc' }}>
              Moves: {consecutiveNonCaptureMoves}/40
            </Text>
            <Text size="1" style={{ color: '#ccc' }}>
              Turn: {currentPlayer}
            </Text>
          </Flex>
        </motion.div>

        {gameStatus === 'playing' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Flex gap="3" wrap="wrap" justify="center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="soft" 
                  onClick={() => setShowDrawConfirm(true)}
                  disabled={!isYourTurn}
                  style={{ 
                    background: 'rgba(255, 170, 0, 0.2)',
                    border: '1px solid #ffaa00',
                    color: '#ffaa00'
                  }}
                >
                  Offer Draw
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="soft" 
                  onClick={() => setShowResignConfirm(true)}
                  style={{ 
                    background: 'rgba(255, 68, 68, 0.2)',
                    border: '1px solid #ff4444',
                    color: '#ff4444'
                  }}
                >
                  Resign
                </Button>
              </motion.div>
            </Flex>
          </motion.div>
        )}

        {gameStatus !== 'playing' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button 
              onClick={onNewGame}
              style={{ 
                background: 'linear-gradient(45deg, #ff00ff, #00ffff)',
                border: 'none',
                color: 'black',
                fontWeight: 'bold',
                padding: '1rem 2rem'
              }}
            >
              New Game
            </Button>
          </motion.div>
        )}
      </Flex>

      <motion.div
        className="board-container"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="checkers-board"
          animate={{
            rotateY: currentPlayer === 'black' ? 180 : 0,
          }}
          transition={{ duration: 0.5 }}
        >
          {renderBoard()}
        </motion.div>

        <div className="board-labels">
          <div className="file-labels">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={`file-${i}`} className="board-label">
                {String.fromCharCode(97 + i)}
              </div>
            ))}
          </div>
          
          <div className="rank-labels">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={`rank-${i}`} className="board-label">
                {8 - i}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="piece-legend"
      >
        <Flex gap="4" align="center" style={{ background: 'rgba(15, 15, 35, 0.8)', padding: '1rem', borderRadius: '8px' }}>
          <Flex align="center" gap="2">
            <div className="legend-piece red"></div>
            <Text size="2" style={{ color: 'white' }}>Red Pieces</Text>
          </Flex>
          <Flex align="center" gap="2">
            <div className="legend-piece black"></div>
            <Text size="2" style={{ color: 'white' }}>Black Pieces</Text>
          </Flex>
          <Flex align="center" gap="2">
            <div className="legend-piece king"></div>
            <Text size="2" style={{ color: 'white' }}>Kings</Text>
          </Flex>
        </Flex>
      </motion.div>

      <AnimatePresence>
        {showResignConfirm && (
          <ConfirmationDialog
            title="Resign Game"
            message="Are you sure you want to resign? This will count as a loss."
            onConfirm={() => {
              onResign();
              setShowResignConfirm(false);
            }}
            onCancel={() => setShowResignConfirm(false)}
            confirmText="Resign"
            confirmColor="#ff4444"
          />
        )}

        {showDrawConfirm && (
          <ConfirmationDialog
            title="Offer Draw"
            message="Do you want to offer a draw to your opponent?"
            onConfirm={() => {
              onOfferDraw();
              setShowDrawConfirm(false);
            }}
            onCancel={() => setShowDrawConfirm(false)}
            confirmText="Offer Draw"
            confirmColor="#ffaa00"
          />
        )}
      </AnimatePresence>

      <style>
        {`
          .board-container {
            position: relative;
            display: inline-block;
          }

          .checkers-board {
            display: grid;
            grid-template-columns: repeat(8, 60px);
            grid-template-rows: repeat(8, 60px);
            gap: 2px;
            background: #8B4513;
            padding: 20px;
            border-radius: 12px;
            border: 4px solid #5D4037;
            box-shadow: 
              0 20px 40px rgba(0, 0, 0, 0.5),
              inset 0 0 50px rgba(255, 255, 255, 0.1);
            transform-style: preserve-3d;
          }

          .cell {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            transition: all 0.3s ease;
          }

          .cell.light {
            background: #F5DEB3;
          }

          .cell.dark {
            background: #8B4513;
          }

          .cell.selected {
            background: linear-gradient(45deg, #ffd700, #ffed4e);
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
          }

          .cell.valid-move {
            background: rgba(0, 255, 0, 0.2);
          }

          .cell.capture-move {
            background: rgba(255, 0, 0, 0.3);
          }

          .coordinate-label {
            position: absolute;
            font-size: 10px;
            color: rgba(0, 0, 0, 0.6);
            font-weight: bold;
          }

          .file-label {
            bottom: 2px;
            right: 4px;
          }

          .rank-label {
            top: 2px;
            left: 4px;
          }

          .piece {
            width: 45px;
            height: 45px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            box-shadow: 
              0 4px 8px rgba(0, 0, 0, 0.3),
              inset 0 -4px 8px rgba(0, 0, 0, 0.3);
            z-index: 2;
          }

          .piece.black {
            background: linear-gradient(135deg, #2C2C2C, #1A1A1A);
            border: 2px solid #404040;
          }

          .piece.red {
            background: linear-gradient(135deg, #DC2626, #B91C1C);
            border: 2px solid #EF4444;
          }

          .piece.selected {
            box-shadow: 
              0 0 20px rgba(255, 215, 0, 0.8),
              0 4px 8px rgba(0, 0, 0, 0.3),
              inset 0 -4px 8px rgba(0, 0, 0, 0.3);
          }

          .piece.king::before {
            content: '';
            position: absolute;
            top: -2px;
            left: 50%;
            transform: translateX(-50%);
            width: 15px;
            height: 15px;
            background: gold;
            border-radius: 50%;
            border: 2px solid #ffd700;
            z-index: 3;
          }

          .crown {
            font-size: 16px;
            color: gold;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
            z-index: 4;
          }

          .player-glow {
            position: absolute;
            top: -5px;
            left: -5px;
            right: -5px;
            bottom: -5px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
            z-index: 1;
          }

          .move-indicator {
            position: absolute;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            z-index: 1;
          }

          .move-indicator.normal {
            background: rgba(0, 255, 0, 0.6);
            border: 2px solid #00ff00;
            animation: pulse 1.5s ease-in-out infinite;
          }

          .move-indicator.capture {
            background: rgba(255, 0, 0, 0.8);
            border: 2px solid #ff0000;
            animation: capture-pulse 0.8s ease-in-out infinite;
          }

          .capture-pulse {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.8);
          }

          .last-move-highlight {
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            border-radius: 8px;
            border: 2px solid #00ffff;
            animation: highlight-fade 2s ease-in-out;
          }

          .board-labels {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
          }

          .file-labels {
            position: absolute;
            bottom: -25px;
            left: 20px;
            right: 20px;
            display: flex;
            justify-content: space-between;
          }

          .rank-labels {
            position: absolute;
            top: 20px;
            bottom: 20px;
            left: -25px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          .board-label {
            color: #fff;
            font-size: 12px;
            font-weight: bold;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
          }

          .piece-legend {
            margin-top: 1rem;
          }

          .legend-piece {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid;
          }

          .legend-piece.red {
            background: #DC2626;
            border-color: #EF4444;
          }

          .legend-piece.black {
            background: #2C2C2C;
            border-color: #404040;
          }

          .legend-piece.king::after {
            content: '♔';
            font-size: 12px;
            color: gold;
            position: absolute;
            transform: translate(-50%, -50%);
          }

          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.2); opacity: 1; }
          }

          @keyframes capture-pulse {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.3); opacity: 1; }
          }

          @keyframes highlight-fade {
            0% { opacity: 1; }
            100% { opacity: 0; }
          }
        `}
      </style>
    </Box>
  );
}

interface ConfirmationDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText: string;
  confirmColor: string;
}

function ConfirmationDialog({ title, message, onConfirm, onCancel, confirmText, confirmColor }: ConfirmationDialogProps) {
  return (
    <Dialog.Root open={true}>
      <Dialog.Content style={{ maxWidth: 400, background: 'rgba(15, 15, 35, 0.95)', backdropFilter: 'blur(20px)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <Dialog.Title style={{ color: 'white', textAlign: 'center' }}>
            {title}
          </Dialog.Title>
          <Text style={{ color: '#ccc', textAlign: 'center', marginBottom: '2rem' }}>
            {message}
          </Text>
          <Flex gap="3" justify="center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="soft" 
                onClick={onCancel}
                style={{ color: 'white' }}
              >
                Cancel
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={onConfirm}
                style={{ 
                  background: confirmColor,
                  border: 'none',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                {confirmText}
              </Button>
            </motion.div>
          </Flex>
        </motion.div>
      </Dialog.Content>
    </Dialog.Root>
  );
}