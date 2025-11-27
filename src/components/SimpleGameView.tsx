import React from 'react';
import { Box, Card, Text, Button, Flex } from '@radix-ui/themes';
import { useCurrentAccount } from '@onelabs/dapp-kit';

export function SimpleGameView() {
  const account = useCurrentAccount();

  if (!account) {
    return (
      <Box style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '50vh'
      }}>
        <Card style={{ 
          background: 'rgba(15, 15, 35, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '2rem'
        }}>
          <Text size="4" weight="bold" style={{ color: 'white', textAlign: 'center' }}>
            Please connect your wallet to play 1-Challenge
          </Text>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <Flex justify="center" gap="4" style={{ marginBottom: '2rem' }}>
        <Card style={{ 
          background: 'rgba(15, 15, 35, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '2rem',
          minWidth: '300px'
        }}>
          <Text size="4" weight="bold" style={{ color: 'white', textAlign: 'center', marginBottom: '1rem' }}>
            Game Status
          </Text>
          <Text style={{ color: '#00ff00', textAlign: 'center' }}>
            Ready to Play!
          </Text>
          <Button 
            style={{ 
              background: 'linear-gradient(45deg, #ff00ff, #00ffff)',
              border: 'none',
              color: 'black',
              fontWeight: 'bold',
              marginTop: '1rem',
              width: '100%'
            }}
          >
            Start New Game
          </Button>
        </Card>
      </Flex>

      {/* Game instructions */}
      <Card style={{ 
        background: 'rgba(15, 15, 35, 0.9)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '2rem',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <Text size="4" weight="bold" style={{ color: 'white', marginBottom: '1rem' }}>
          How to Play 1-Challenge
        </Text>
        <Box style={{ color: '#ccc' }}>
          <Text as="div" style={{ marginBottom: '0.5rem' }}>• Challenge players from the leaderboard</Text>
          <Text as="div" style={{ marginBottom: '0.5rem' }}>• Stake ONE tokens on your matches</Text>
          <Text as="div" style={{ marginBottom: '0.5rem' }}>• Play checkers with full rules</Text>
          <Text as="div" style={{ marginBottom: '0.5rem' }}>• Winner takes the staked amount</Text>
          <Text as="div">• Build your reputation on-chain</Text>
        </Box>
      </Card>
    </Box>
  );
}