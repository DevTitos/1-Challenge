import React from 'react';
import { Box, Flex, Text, Button, Card } from '@radix-ui/themes';
import { useCurrentAccount, ConnectButton } from '@onelabs/dapp-kit';

interface CleanUIProps {
  children: React.ReactNode;
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export function CleanUI({ children, currentTab, onTabChange }: CleanUIProps) {
  const account = useCurrentAccount();

  return (
    <div style={{ 
      position: 'relative', 
      zIndex: 10,
      minHeight: '100vh'
    }}>
      {/* Header */}
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
          <Text size="6" weight="bold" style={{ 
            background: 'linear-gradient(45deg, #00ffff, #ff00ff)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}>
            1-CHALLENGE
          </Text>
        </Box>

        <Box>
          <ConnectButton />
        </Box>
      </Flex>

      {/* Tab Navigation */}
      <Box style={{ 
        background: 'rgba(15, 15, 35, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '1rem 0'
      }}>
        <Flex justify="center" gap="4">
          {['game', 'leaderboard', 'challenges'].map((tab) => (
            <Button
              key={tab}
              variant={currentTab === tab ? 'solid' : 'soft'}
              onClick={() => onTabChange(tab)}
              style={{
                background: currentTab === tab 
                  ? 'linear-gradient(45deg, #ff00ff, #00ffff)'
                  : 'rgba(255, 255, 255, 0.1)',
                color: currentTab === tab ? 'black' : 'white',
                border: 'none',
                textTransform: 'capitalize'
              }}
            >
              {tab === 'game' ? '🎮 3D Game' : 
               tab === 'leaderboard' ? '🏆 Leaderboard' : 
               '⚡ Challenges'}
            </Button>
          ))}
        </Flex>
      </Box>

      {/* Main Content */}
      <Box style={{ padding: '2rem' }}>
        {children}
      </Box>
    </div>
  );
}