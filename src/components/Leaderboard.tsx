import React, { useState, useEffect } from 'react';
import { Box, Button, Dialog, Flex, TextField, Text, Card } from '@radix-ui/themes';
import { useCurrentAccount } from '@onelabs/dapp-kit';
import { motion, AnimatePresence } from 'framer-motion';
import { LeaderboardEntry, Player } from '../types/game';
import { useBlockchainGame } from '../hooks/useBlockchainGame';
import { AnimatedCard } from './AnimatedCard';
import { AnimatedButton } from './AnimatedButton';

// Mock data - replace with actual data from chain
const mockLeaderboard: LeaderboardEntry[] = Array.from({ length: 10 }, (_, i) => ({
  rank: i + 1,
  player: {
    id: `${i + 1}`,
    address: `0x${'abcd'.repeat(8)}${i.toString(16)}`,
    username: `Player${i + 1}`,
    wins: 15 + Math.floor(Math.random() * 20),
    losses: 2 + Math.floor(Math.random() * 10),
    totalStaked: 10 + Math.random() * 40,
    rating: 1200 + Math.floor(Math.random() * 400)
  },
  totalWinnings: 10 + Math.random() * 40,
  winRate: Math.floor(60 + Math.random() * 35)
}));

// Sort by rating
mockLeaderboard.sort((a, b) => b.player.rating - a.player.rating);
mockLeaderboard.forEach((entry, index) => entry.rank = index + 1);

interface ChallengeDialogProps {
  player: Player;
  onClose: () => void;
  onChallenge: (stakeAmount: number) => Promise<void>;
  isLoading?: boolean;
}

function ChallengeDialog({ player, onClose, onChallenge, isLoading = false }: ChallengeDialogProps) {
  const [stakeAmount, setStakeAmount] = useState('1.0');
  const currentAccount = useCurrentAccount();
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const amount = parseFloat(stakeAmount);
    
    // Validation
    if (!amount || amount < 0.1) {
      setError('Minimum stake amount is 0.1 ONE');
      return;
    }
    if (amount > 100) {
      setError('Maximum stake amount is 100 ONE');
      return;
    }
    
    setError('');
    try {
      await onChallenge(amount);
    } catch (err) {
      // Error handling is done in the parent component
      console.error('Challenge error in dialog:', err);
    }
  };

  const handleStakeChange = (value: string) => {
    setStakeAmount(value);
    if (error) setError('');
  };

  return (
    <Dialog.Root open={true}>
      <Dialog.Content style={{ maxWidth: 450, background: 'rgba(15, 15, 35, 0.95)', backdropFilter: 'blur(20px)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <Dialog.Title style={{ color: 'white', textAlign: 'center' }}>
            Challenge {player.username}
          </Dialog.Title>
          
          <Flex direction="column" gap="3">
            {/* Player Stats */}
            <AnimatedCard delay={0.1}>
              <Box>
                <Text as="div" size="2" weight="bold" style={{ color: 'white' }}>
                  Player Stats:
                </Text>
                <Flex justify="between" style={{ marginTop: '0.5rem' }}>
                  <Text size="1" style={{ color: '#ccc' }}>Rating: {player.rating}</Text>
                  <Text size="1" style={{ color: '#ccc' }}>Wins: {player.wins}</Text>
                  <Text size="1" style={{ color: '#ccc' }}>Losses: {player.losses}</Text>
                </Flex>
                <Text size="1" style={{ color: '#ccc', marginTop: '0.5rem' }}>
                  Win Rate: {Math.round((player.wins / (player.wins + player.losses)) * 100)}%
                </Text>
              </Box>
            </AnimatedCard>

            {/* Stake Amount Input */}
            <label>
              <Text as="div" size="2" mb="1" weight="bold" style={{ color: 'white' }}>
                Stake Amount (OCT)
              </Text>
              <TextField.Root
                type="number"
                step="0.1"
                min="0.1"
                max="100"
                value={stakeAmount}
                onChange={(e) => handleStakeChange(e.target.value)}
                placeholder="Enter stake amount"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white'
                }}
                disabled={isLoading}
              />
              <Text size="1" style={{ color: '#ccc', marginTop: '4px' }}>
                Minimum: 0.1 OCT, Maximum: 100 OCT
              </Text>
              {error && (
                <Text size="1" style={{ color: '#ff4444', marginTop: '4px' }}>
                  {error}
                </Text>
              )}
            </label>

            {/* Current Account Info */}
            {currentAccount && (
              <AnimatedCard delay={0.2}>
                <Text size="1" weight="bold" style={{ color: '#00ffff' }}>Your Account:</Text>
                <Text size="1" style={{ color: '#ccc', wordBreak: 'break-all' }}>
                  {currentAccount.address}
                </Text>
              </AnimatedCard>
            )}
          </Flex>

          {/* Action Buttons */}
          <Flex gap="3" mt="4" justify="end">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="soft" 
                color="gray" 
                onClick={onClose}
                disabled={isLoading}
                style={{ color: 'white' }}
              >
                Cancel
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={handleSubmit} 
                disabled={!stakeAmount || parseFloat(stakeAmount) < 0.1 || isLoading}
                style={{ 
                  background: isLoading 
                    ? '#666' 
                    : 'linear-gradient(45deg, #ff00ff, #00ffff)',
                  border: 'none',
                  color: 'black',
                  fontWeight: 'bold',
                  minWidth: '160px'
                }}
              >
                {isLoading ? (
                  <Flex align="center" gap="2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{ width: 16, height: 16, border: '2px solid transparent', borderTop: '2px solid black', borderRadius: '50%' }}
                    />
                    Creating...
                  </Flex>
                ) : (
                  `Challenge (${stakeAmount} ONE)`
                )}
              </Button>
            </motion.div>
          </Flex>
        </motion.div>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export function Leaderboard() {
  const currentAccount = useCurrentAccount();
  const { createChallenge, loading: challengeLoading } = useBlockchainGame();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLeaderboard, setFilteredLeaderboard] = useState<LeaderboardEntry[]>(mockLeaderboard);

  // Filter leaderboard based on search
  useEffect(() => {
    const filtered = mockLeaderboard.filter(entry =>
      entry.player.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.player.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLeaderboard(filtered);
  }, [searchTerm]);

  const handleChallenge = async (stakeAmount: number) => {
    if (!currentAccount || !selectedPlayer) return;
    
    try {
      const result = await createChallenge(selectedPlayer.address, stakeAmount);
      
      if (result.success) {
        alert(`🎯 Challenge sent to ${selectedPlayer.username} with stake of ${stakeAmount} ONE!\n\nTransaction: ${result.transactionId}`);
      } else {
        alert('❌ Failed to create challenge. Please try again.');
      }
    } catch (error) {
      console.error('Challenge creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`❌ Error creating challenge: ${errorMessage}`);
    } finally {
      setSelectedPlayer(null);
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'linear-gradient(45deg, #FFD700, #FFA500)';
      case 2: return 'linear-gradient(45deg, #C0C0C0, #A0A0A0)';
      case 3: return 'linear-gradient(45deg, #CD7F32, #A56C28)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getWinRateColor = (winRate: number) => {
    if (winRate >= 80) return '#00ff00';
    if (winRate >= 60) return '#00ffff';
    if (winRate >= 40) return '#ffaa00';
    return '#ff4444';
  };

  return (
    <Box style={{ padding: '20px', color: 'white', minHeight: '80vh' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Text size="6" weight="bold" style={{ marginBottom: '10px', textAlign: 'center' }}>
          🏆 Checkers Leaderboard
        </Text>
        <Text size="2" style={{ color: '#ccc', textAlign: 'center', marginBottom: '30px' }}>
          Challenge top players and stake OCT tokens to compete!
        </Text>
      </motion.div>

      {/* Search Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{ marginBottom: '30px' }}
      >
        <Flex justify="center">
          <TextField.Root
            placeholder="Search players by name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              maxWidth: '400px', 
              width: '100%',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white'
            }}
          >
            <TextField.Slot>
              <Text size="2" style={{ color: '#ccc' }}>🔍</Text>
            </TextField.Slot>
          </TextField.Root>
        </Flex>
      </motion.div>

      {/* Leaderboard Cards */}
      <Flex direction="column" gap="3" align="center">
        <AnimatePresence>
          {filteredLeaderboard.map((entry, index) => (
            <motion.div
              key={entry.player.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              style={{ width: '100%', maxWidth: '800px' }}
            >
              <AnimatedCard delay={index * 0.05}>
                <Flex align="center" justify="between" gap="4" style={{ padding: '1rem' }}>
                  {/* Rank and Player Info */}
                  <Flex align="center" gap="4" style={{ flex: 1 }}>
                    {/* Rank Badge */}
                    <Box style={{ 
                      width: '50px', 
                      height: '50px', 
                      background: getRankColor(entry.rank),
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: entry.rank <= 3 ? '1.2rem' : '1rem',
                      color: entry.rank <= 3 ? 'black' : 'white'
                    }}>
                      {getRankIcon(entry.rank)}
                    </Box>
                    
                    {/* Player Details */}
                    <Box style={{ flex: 1 }}>
                      <Flex align="center" gap="2">
                        <Text weight="bold" size="4" style={{ color: 'white' }}>
                          {entry.player.username}
                        </Text>
                        {entry.rank <= 3 && (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{ fontSize: '0.8rem' }}
                          >
                            ⭐
                          </motion.div>
                        )}
                      </Flex>
                      <Text size="1" style={{ color: '#ccc', marginTop: '2px' }}>
                        {entry.player.address.slice(0, 8)}...{entry.player.address.slice(-6)}
                      </Text>
                    </Box>
                  </Flex>

                  {/* Stats */}
                  <Flex align="center" gap="4" style={{ flex: 2, justifyContent: 'space-around' }}>
                    {/* Rating */}
                    <Box style={{ textAlign: 'center', minWidth: '80px' }}>
                      <Text size="1" weight="bold" style={{ color: '#00ffff' }}>Rating</Text>
                      <Text size="3" weight="bold" style={{ color: 'white' }}>
                        {entry.player.rating}
                      </Text>
                    </Box>

                    {/* Win Rate */}
                    <Box style={{ textAlign: 'center', minWidth: '100px' }}>
                      <Text size="1" weight="bold" style={{ color: '#00ffff' }}>Win Rate</Text>
                      <Flex align="center" gap="2">
                        <Text size="3" weight="bold" style={{ color: getWinRateColor(entry.winRate) }}>
                          {entry.winRate}%
                        </Text>
                        <Box style={{ 
                          width: '40px', 
                          height: '4px', 
                          backgroundColor: '#333',
                          borderRadius: '2px',
                          overflow: 'hidden'
                        }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${entry.winRate}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            style={{ 
                              height: '100%', 
                              backgroundColor: getWinRateColor(entry.winRate),
                              borderRadius: '2px'
                            }}
                          />
                        </Box>
                      </Flex>
                    </Box>

                    {/* Winnings */}
                    <Box style={{ textAlign: 'center', minWidth: '100px' }}>
                      <Text size="1" weight="bold" style={{ color: '#00ffff' }}>Winnings</Text>
                      <Text size="3" weight="bold" style={{ color: '#ffaa00' }}>
                        {entry.totalWinnings.toFixed(1)} ONE
                      </Text>
                    </Box>

                    {/* Record */}
                    <Box style={{ textAlign: 'center', minWidth: '80px' }}>
                      <Text size="1" weight="bold" style={{ color: '#00ffff' }}>Record</Text>
                      <Text size="2" style={{ color: 'white' }}>
                        {entry.player.wins}-{entry.player.losses}
                      </Text>
                    </Box>
                  </Flex>

                  {/* Challenge Button */}
                  <Box style={{ minWidth: '120px' }}>
                    <AnimatedButton
                      onClick={() => setSelectedPlayer(entry.player)}
                      disabled={!currentAccount || entry.player.address === currentAccount.address}
                      variant="primary"
                    >
                      Challenge
                    </AnimatedButton>
                  </Box>
                </Flex>
              </AnimatedCard>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {filteredLeaderboard.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AnimatedCard>
              <Box style={{ textAlign: 'center', padding: '3rem' }}>
                <Text size="4" weight="bold" style={{ color: 'white', marginBottom: '1rem' }}>
                  No players found
                </Text>
                <Text style={{ color: '#ccc' }}>
                  Try adjusting your search terms or check back later for more players.
                </Text>
              </Box>
            </AnimatedCard>
          </motion.div>
        )}
      </Flex>

      {/* Challenge Dialog */}
      <AnimatePresence>
        {selectedPlayer && (
          <ChallengeDialog
            player={selectedPlayer}
            onClose={() => setSelectedPlayer(null)}
            onChallenge={handleChallenge}
            isLoading={challengeLoading}
          />
        )}
      </AnimatePresence>
    </Box>
  );
}