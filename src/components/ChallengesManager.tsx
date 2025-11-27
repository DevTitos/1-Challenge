import { useState } from 'react';
import { Box, Text, Flex, Button } from '@radix-ui/themes';
import { motion, AnimatePresence } from 'framer-motion';
import { useBlockchainGame } from '../hooks/useBlockchainGame';
import { AnimatedButton } from './AnimatedButton';
import { AnimatedCard } from './AnimatedCard';

export function ChallengesManager() {
  const {
    challenges,
    loading,
    error,
    acceptChallenge,
    isConnected,
    hasContract
  } = useBlockchainGame();

  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const handleAcceptChallenge = async (challengeId: string) => {
    setAcceptingId(challengeId);
    try {
      await acceptChallenge(challengeId);
      // Challenge accepted successfully - state updated in hook
    } catch (error) {
      console.error('Failed to accept challenge:', error);
    } finally {
      setAcceptingId(null);
    }
  };

  if (!isConnected) {
    return (
      <Box style={{ textAlign: 'center', padding: '2rem' }}>
        <AnimatedCard>
          <Text size="4" weight="bold" style={{ color: 'white', textAlign: 'center' }}>
            Connect your wallet to view challenges
          </Text>
        </AnimatedCard>
      </Box>
    );
  }

  if (!hasContract) {
    return (
      <Box style={{ textAlign: 'center', padding: '2rem' }}>
        <AnimatedCard>
          <Text size="4" weight="bold" style={{ color: 'white' }}>
            Contract not initialized
          </Text>
          <Text size="2" style={{ color: '#ccc', marginTop: '1rem' }}>
            Please check your network connection.
          </Text>
        </AnimatedCard>
      </Box>
    );
  }

  return (
    <Box style={{ padding: '2rem' }}>
      <Text size="6" weight="bold" style={{ color: 'white', marginBottom: '2rem', textAlign: 'center' }}>
        Active Challenges
      </Text>

      {error && (
        <AnimatedCard>
          <Text style={{ color: '#ff4444', textAlign: 'center' }}>
            Error: {error}
          </Text>
        </AnimatedCard>
      )}

      <Flex direction="column" gap="3" align="center">
        {loading && challenges.length === 0 ? (
          <AnimatedCard>
            <Text style={{ color: 'white', textAlign: 'center' }}>
              Loading challenges...
            </Text>
          </AnimatedCard>
        ) : challenges.length === 0 ? (
          <AnimatedCard>
            <Text style={{ color: 'white', textAlign: 'center' }}>
              No active challenges found.
            </Text>
            <Text size="2" style={{ color: '#ccc', marginTop: '1rem', textAlign: 'center' }}>
              Challenge players from the leaderboard to start a game!
            </Text>
          </AnimatedCard>
        ) : (
          <AnimatePresence>
            {challenges.map((challenge, index) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ delay: index * 0.1 }}
                style={{ width: '100%', maxWidth: '600px' }}
              >
                <AnimatedCard delay={index * 0.1}>
                  <Flex justify="between" align="center" gap="3">
                    <Box style={{ flex: 1 }}>
                      <Text weight="bold" style={{ color: 'white' }}>
                        Challenge from {challenge.challenger.slice(0, 8)}...{challenge.challenger.slice(-6)}
                      </Text>
                      <Text size="2" style={{ color: '#ccc', marginTop: '0.5rem' }}>
                        Stake: {challenge.stakeAmount} ONE • Status: {challenge.status}
                      </Text>
                      <Text size="1" style={{ color: '#888', marginTop: '0.25rem' }}>
                        Created: {new Date(challenge.createdAt).toLocaleDateString()}
                      </Text>
                    </Box>
                    
                    {challenge.status === 'pending' && (
                      <AnimatedButton
                        onClick={() => handleAcceptChallenge(challenge.id)}
                        disabled={acceptingId === challenge.id || loading}
                      >
                        {acceptingId === challenge.id ? 'Accepting...' : 'Accept Challenge'}
                      </AnimatedButton>
                    )}
                    
                    {challenge.status === 'accepted' && (
                      <Button variant="soft" style={{ color: '#00ff00' }}>
                        Game Ready
                      </Button>
                    )}
                  </Flex>
                </AnimatedCard>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </Flex>
    </Box>
  );
}