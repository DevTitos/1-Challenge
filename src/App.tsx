import { useCurrentAccount, ConnectButton } from "@onelabs/dapp-kit";
import { Box, Container, Flex, Heading, Tabs, Text } from "@radix-ui/themes";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaderboard } from "./components/Leaderboard";
import { AnimatedCSSBackground } from "./components/AnimatedCSSBackground";
import { AnimatedCard } from "./components/AnimatedCard";
import { AnimatedButton } from "./components/AnimatedButton";
import { AnimatedCheckersBoard } from "./components/AnimatedCheckersBoard";
import { useCheckersGame } from "./hooks/useCheckersGame";
import { ChallengesManager } from "./components/ChallengesManager";
import { Profile } from './components/Profile';

function App() {
  const currentAccount = useCurrentAccount();
  const [activeTab, setActiveTab] = useState('game');

  return (
    <>
      <AnimatedCSSBackground />
      
      {/* UI Content */}
      <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh' }}>
        {/* Animated Header */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
        >
          <Flex
            px="4"
            py="3"
            justify="between"
            align="center"
            style={{
              background: 'rgba(15, 15, 35, 0.9)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Box>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Heading style={{ 
                  background: 'linear-gradient(45deg, #00ffff, #ff00ff)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}>
                  1-CHALLENGE
                </Heading>
              </motion.div>
            </Box>

            <Box>
              <ConnectButton />
            </Box>
          </Flex>
        </motion.div>

        {/* Animated Tabs */}
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
              <Tabs.List style={{ 
                background: 'rgba(15, 15, 35, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                marginTop: '20px',
                padding: '4px'
              }}>
                {[
                  { id: 'game', label: '🎮 Play Game', emoji: '🎮' },
                  { id: 'leaderboard', label: '🏆 Leaderboard', emoji: '🏆' },
                  { id: 'challenges', label: '⚡ Challenges', emoji: '⚡' },
                  { id: 'profile', label: '👤 Profile', emoji: '👤' }
                ].map((tab) => (
                  <Tabs.Trigger 
                    key={tab.id}
                    value={tab.id} 
                    style={{ 
                      color: 'white',
                      position: 'relative',
                      background: activeTab === tab.id 
                        ? 'linear-gradient(45deg, #ff00ff, #00ffff)' 
                        : 'transparent',
                      color: activeTab === tab.id ? 'black' : 'white',
                      fontWeight: 'bold'
                    }}
                  >
                    {tab.label}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>

              <Box pt="3">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Tabs.Content value="game">
                      <GameContent />
                    </Tabs.Content>

                    <Tabs.Content value="leaderboard">
                      <Leaderboard />
                    </Tabs.Content>

                    <Tabs.Content value="challenges">
                      <ChallengesContent />
                    </Tabs.Content>

                    <Tabs.Content value="profile">
                      <Profile />
                    </Tabs.Content>
                    
                  </motion.div>
                </AnimatePresence>
              </Box>
            </Tabs.Root>
          </motion.div>
        </Container>
      </div>
    </>
  );
}

function GameContent() {
  const account = useCurrentAccount();
  const {
    gameState,
    isYourTurn,
    selectPiece,
    resetGame,
    resign,
    offerDraw,
    gameStatus,
    currentPlayer
  } = useCheckersGame();

  const handleOfferDraw = () => {
    const offered = offerDraw();
    if (offered) {
      alert('Draw offer sent to opponent!');
    } else {
      alert('Draw offer not available yet. Need more moves.');
    }
  };

  if (!account) {
    return (
      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <AnimatedCard delay={0.3}>
          <Box style={{ padding: '3rem', textAlign: 'center' }}>
            <Text size="6" weight="bold" style={{ color: 'white', marginBottom: '1rem' }}>
              Welcome to 1-Challenge!
            </Text>
            <Text size="3" style={{ color: '#ccc', marginBottom: '2rem' }}>
              Connect your wallet to start playing professional checkers with ONE token staking
            </Text>
            <Flex direction="column" gap="2" align="center">
              <Text size="2" style={{ color: '#00ffff' }}>🎮 Professional Checkers Rules</Text>
              <Text size="2" style={{ color: '#00ffff' }}>🏆 Compete on the Leaderboard</Text>
              <Text size="2" style={{ color: '#00ffff' }}>⚡ Challenge Other Players</Text>
              <Text size="2" style={{ color: '#00ffff' }}>💰 Stake ONT Tokens</Text>
            </Flex>
          </Box>
        </AnimatedCard>
      </Box>
    );
  }

  return (
    <Box style={{ padding: '2rem' }}>
      <Flex direction="column" align="center" gap="4">
        {/* Game Board */}
        <AnimatedCheckersBoard
          onPieceClick={selectPiece}
          selectedPiece={gameState.selectedPiece}
          validMoves={gameState.validMoves}
          board={gameState.board}
          currentPlayer={currentPlayer}
          isYourTurn={isYourTurn}
          gameStatus={gameStatus}
          consecutiveNonCaptureMoves={gameState.consecutiveNonCaptureMoves}
          onResign={resign}
          onOfferDraw={handleOfferDraw}
          onNewGame={resetGame}
        />

        {/* Game Instructions */}
        {gameStatus === 'playing' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <AnimatedCard>
              <Box style={{ padding: '1.5rem', maxWidth: '600px' }}>
                <Text size="3" weight="bold" style={{ color: 'white', marginBottom: '1rem', textAlign: 'center' }}>
                  Game Rules
                </Text>
                <Flex direction="column" gap="2">
                  <Text size="1" style={{ color: '#ccc' }}>
                    • <Text weight="bold" style={{ color: '#00ff00' }}>Mandatory Captures:</Text> You must capture if possible
                  </Text>
                  <Text size="1" style={{ color: '#ccc' }}>
                    • <Text weight="bold" style={{ color: '#00ff00' }}>Multiple Jumps:</Text> Continue capturing with the same piece
                  </Text>
                  <Text size="1" style={{ color: '#ccc' }}>
                    • <Text weight="bold" style={{ color: '#00ff00' }}>King Promotion:</Text> Pieces become kings on the last row
                  </Text>
                  <Text size="1" style={{ color: '#ccc' }}>
                    • <Text weight="bold" style={{ color: '#00ff00' }}>40-Move Rule:</Text> Game ends in draw after 40 non-capture moves
                  </Text>
                  <Text size="1" style={{ color: '#ccc' }}>
                    • <Text weight="bold" style={{ color: '#00ff00' }}>No Moves:</Text> If you have no legal moves, you lose automatically
                  </Text>
                </Flex>
              </Box>
            </AnimatedCard>
          </motion.div>
        )}

        {/* Game Stats */}
        <Flex gap="4" wrap="wrap" justify="center" style={{ marginTop: '2rem' }}>
          {[
            { 
              label: 'Current Player', 
              value: currentPlayer, 
              color: currentPlayer === 'red' ? '#DC2626' : '#1A1A1A',
              icon: currentPlayer === 'red' ? '🔴' : '⚫'
            },
            { 
              label: 'Your Turn', 
              value: isYourTurn ? 'Yes' : 'No', 
              color: isYourTurn ? '#00ff00' : '#ff4444',
              icon: isYourTurn ? '✅' : '⏳'
            },
            { 
              label: 'Game Status', 
              value: gameStatus.charAt(0).toUpperCase() + gameStatus.slice(1), 
              color: gameStatus === 'playing' ? '#00ffff' : '#ffaa00',
              icon: gameStatus === 'playing' ? '🎯' : '🏁'
            },
            { 
              label: 'Valid Moves', 
              value: gameState.validMoves.length, 
              color: gameState.validMoves.length > 0 ? '#00ff00' : '#ff4444',
              icon: '➡️'
            },
            { 
              label: 'Non-Capture Moves', 
              value: `${gameState.consecutiveNonCaptureMoves}/40`, 
              color: gameState.consecutiveNonCaptureMoves > 30 ? '#ff4444' : 
                     gameState.consecutiveNonCaptureMoves > 20 ? '#ffaa00' : '#00ff00',
              icon: '📊'
            }
          ].map((stat, index) => (
            <AnimatedCard key={stat.label} delay={0.4 + index * 0.1}>
              <Box style={{ textAlign: 'center', padding: '1rem', minWidth: '140px' }}>
                <Text size="1" weight="bold" style={{ color: stat.color, marginBottom: '0.5rem' }}>
                  {stat.icon} {stat.label}
                </Text>
                <Text size="4" weight="bold" style={{ color: 'white' }}>
                  {stat.value}
                </Text>
              </Box>
            </AnimatedCard>
          ))}
        </Flex>

        {/* Quick Actions */}
        {gameStatus === 'playing' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Flex gap="3" wrap="wrap" justify="center">
              <AnimatedButton
                onClick={() => setActiveTab('leaderboard')}
                variant="secondary"
              >
                🏆 View Leaderboard
              </AnimatedButton>
              
              <AnimatedButton
                onClick={() => setActiveTab('challenges')}
                variant="secondary"
              >
                ⚡ Active Challenges
              </AnimatedButton>
              
              <AnimatedButton
                onClick={resetGame}
                variant="secondary"
              >
                🔄 Practice Mode
              </AnimatedButton>
            </Flex>
          </motion.div>
        )}

        {/* Game Over Celebration */}
        {gameStatus !== 'playing' && gameStatus !== 'draw' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
          >
            <AnimatedCard>
              <Box style={{ padding: '2rem', textAlign: 'center' }}>
                <Text size="6" weight="bold" style={{ 
                  background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  marginBottom: '1rem'
                }}>
                  {gameStatus === 'red_won' ? '🎉 Red Player Wins!' : '🎉 Black Player Wins!'}
                </Text>
                <Text size="2" style={{ color: '#ccc' }}>
                  {gameStatus === 'red_won' ? 'Congratulations to the Red player!' : 'Congratulations to the Black player!'}
                </Text>
              </Box>
            </AnimatedCard>
          </motion.div>
        )}

        {/* Draw Celebration */}
        {gameStatus === 'draw' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
          >
            <AnimatedCard>
              <Box style={{ padding: '2rem', textAlign: 'center' }}>
                <Text size="6" weight="bold" style={{ 
                  background: 'linear-gradient(45deg, #00ffff, #ff00ff)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  marginBottom: '1rem'
                }}>
                  🤝 Game Draw!
                </Text>
                <Text size="2" style={{ color: '#ccc' }}>
                  Well played! The game ended in a draw.
                </Text>
              </Box>
            </AnimatedCard>
          </motion.div>
        )}
      </Flex>
    </Box>
  );
}

function ChallengesContent() {
  return <ChallengesManager />;
}

export default App;