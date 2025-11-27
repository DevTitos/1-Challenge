import React from 'react';
import { Box, Flex, Text, Button, Card } from '@radix-ui/themes';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrentAccount } from '@onelabs/dapp-kit';

interface AnimatedUIProps {
  children: React.ReactNode;
  gameStatus: string;
  currentPlayer: string;
  isYourTurn: boolean;
  onReset: () => void;
}

export function AnimatedUI({ children, gameStatus, currentPlayer, isYourTurn, onReset }: AnimatedUIProps) {
  const account = useCurrentAccount();

  return (
    <div style={{ 
      position: 'relative', 
      zIndex: 10,
      minHeight: '100vh',
      background: 'transparent'
    }}>
      {/* Animated header */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: 'spring' }}
      >
        <Flex
          position="sticky"
          px="4"
          py="3"
          justify="between"
          align="center"
          style={{
            background: 'rgba(15, 15, 35, 0.8)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Box>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Text size="6" weight="bold" style={{ 
                background: 'linear-gradient(45deg, #00ffff, #ff00ff)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                textShadow: '0 0 30px rgba(255, 0, 255, 0.5)'
              }}>
                1-CHALLENGE
              </Text>
            </motion.div>
          </Box>

          <Flex gap="3" align="center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="soft" style={{ 
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white'
              }}>
                {account ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}` : 'Connect Wallet'}
              </Button>
            </motion.div>
          </Flex>
        </Flex>
      </motion.div>

      {/* Game status panel */}
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ position: 'fixed', top: '100px', left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}
        >
          <Card style={{ 
            background: 'rgba(15, 15, 35, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            minWidth: '300px'
          }}>
            <Flex direction="column" gap="2" align="center">
              <Text size="4" weight="bold" style={{ color: 'white' }}>
                {gameStatus === 'playing' ? (
                  <>
                    <motion.span
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{ color: isYourTurn ? '#00ff00' : '#ff4444' }}
                    >
                      {isYourTurn ? 'YOUR TURN' : 'OPPONENT\'S TURN'}
                    </motion.span>
                    <Text size="2" style={{ color: '#888' }}>
                      Current: {currentPlayer}
                    </Text>
                  </>
                ) : (
                  <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{ color: '#ffaa00' }}
                  >
                    {gameStatus.toUpperCase()}
                  </motion.span>
                )}
              </Text>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={onReset}
                  style={{ 
                    background: 'linear-gradient(45deg, #ff00ff, #00ffff)',
                    border: 'none',
                    color: 'black',
                    fontWeight: 'bold'
                  }}
                >
                  New Game
                </Button>
              </motion.div>
            </Flex>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        style={{ paddingTop: '80px' }}
      >
        {children}
      </motion.div>
    </div>
  );
}