import React, { useState, useEffect } from 'react';
import { Box, Flex, Text, Button, Card, TextField, Dialog } from '@radix-ui/themes';
import { useCurrentAccount, useSuiClient } from '@onelabs/dapp-kit';
import { motion } from 'framer-motion';
import { AnimatedCard } from './AnimatedCard';
import { AnimatedButton } from './AnimatedButton';

export function Profile() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [faucetLoading, setFaucetLoading] = useState(false);
  const [showFaucetDialog, setShowFaucetDialog] = useState(false);
  const [faucetResult, setFaucetResult] = useState<{success: boolean; message: string} | null>(null);

  // Fetch account balance
  const fetchBalance = async () => {
    if (!account) return;
    
    try {
      const coins = await suiClient.getCoins({
        owner: account.address,
        coinType: '0x2::sui::SUI'
      });
      
      const totalBalance = coins.data.reduce((sum, coin) => {
        return sum + BigInt(coin.balance);
      }, BigInt(0));
      
      // Convert from mist to SUI (1 SUI = 1,000,000,000 mist)
      setBalance((Number(totalBalance) / 1_000_000_000).toFixed(4));
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance('0');
    }
  };

  // Request faucet tokens
  const requestFaucet = async () => {
    if (!account) return;
    
    setFaucetLoading(true);
    setFaucetResult(null);
    
    try {
      const response = await fetch('https://faucet-testnet.onelabs.cc/v1/gas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FixedAmountRequest: {
            recipient: account.address
          }
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        setFaucetResult({
          success: true,
          message: '✅ Faucet request successful! Tokens should arrive shortly.'
        });
        // Refresh balance after a delay
        setTimeout(() => fetchBalance(), 3000);
      } else {
        setFaucetResult({
          success: false,
          message: `❌ Faucet request failed: ${result.error || 'Unknown error'}`
        });
      }
    } catch (error) {
      setFaucetResult({
        success: false,
        message: `❌ Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setFaucetLoading(false);
    }
  };

  // Copy address to clipboard
  const copyAddress = async () => {
    if (!account) return;
    
    try {
      await navigator.clipboard.writeText(account.address);
      // You could add a toast notification here
      alert('Address copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  // View on explorer
  const viewOnExplorer = () => {
    if (!account) return;
    
    const explorerUrl = `https://onescan.cc/testnet/account?address=${account.address}`;
    window.open(explorerUrl, '_blank');
  };

  // Refresh balance periodically
  useEffect(() => {
    if (account) {
      fetchBalance();
      const interval = setInterval(fetchBalance, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [account]);

  if (!account) {
    return (
      <Box style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
        <AnimatedCard>
          <Box style={{ padding: '3rem', textAlign: 'center' }}>
            <Text size="4" weight="bold" style={{ color: 'white', marginBottom: '1rem' }}>
              Connect Your Wallet
            </Text>
            <Text style={{ color: '#ccc' }}>
              Please connect your wallet to view your profile and manage your assets.
            </Text>
          </Box>
        </AnimatedCard>
      </Box>
    );
  }

  return (
    <Box style={{ padding: '2rem' }}>
      <Flex direction="column" gap="4" align="center">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ width: '100%', maxWidth: '800px' }}
        >
          <AnimatedCard>
            <Flex justify="between" align="center" style={{ padding: '2rem' }}>
              <Box>
                <Text size="6" weight="bold" style={{ color: 'white', marginBottom: '0.5rem' }}>
                  Your Profile
                </Text>
                <Text size="2" style={{ color: '#ccc' }}>
                  Manage your wallet and assets
                </Text>
              </Box>
              
              <Flex align="center" gap="2" style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                <Text weight="bold" style={{ color: '#00ff00' }}>Balance:</Text>
                <Text weight="bold" style={{ color: 'white' }}>{balance} ONE</Text>
              </Flex>
            </Flex>
          </AnimatedCard>
        </motion.div>

        {/* Wallet Information */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          style={{ width: '100%', maxWidth: '800px' }}
        >
          <AnimatedCard delay={0.1}>
            <Box style={{ padding: '2rem' }}>
              <Text size="4" weight="bold" style={{ color: 'white', marginBottom: '1.5rem' }}>
                Wallet Information
              </Text>
              
              <Flex direction="column" gap="3">
                <Box>
                  <Text size="1" weight="bold" style={{ color: '#00ffff', marginBottom: '0.5rem' }}>
                    Address
                  </Text>
                  <Card style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1rem' }}>
                    <Text style={{ color: 'white', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                      {account.address}
                    </Text>
                  </Card>
                </Box>
                
                <Box>
                  <Text size="1" weight="bold" style={{ color: '#00ffff', marginBottom: '0.5rem' }}>
                    Network
                  </Text>
                  <Text style={{ color: 'white' }}>OneChain Testnet</Text>
                </Box>
                
                <Box>
                  <Text size="1" weight="bold" style={{ color: '#00ffff', marginBottom: '0.5rem' }}>
                    Balance
                  </Text>
                  <Flex align="center" gap="2">
                    <Text size="4" weight="bold" style={{ color: '#00ff00' }}>{balance}</Text>
                    <Text style={{ color: '#ccc' }}>ONE</Text>
                  </Flex>
                </Box>
              </Flex>
              
              <Flex gap="3" style={{ marginTop: '2rem' }}>
                <AnimatedButton onClick={copyAddress} variant="secondary">
                  📋 Copy Address
                </AnimatedButton>
                
                <AnimatedButton onClick={viewOnExplorer} variant="secondary">
                  🔍 View on Explorer
                </AnimatedButton>
                
                <AnimatedButton onClick={() => setShowFaucetDialog(true)} variant="primary">
                  🚰 Request Faucet
                </AnimatedButton>
                
                <AnimatedButton onClick={fetchBalance} variant="secondary" disabled={isLoading}>
                  {isLoading ? '🔄 Refreshing...' : '🔄 Refresh Balance'}
                </AnimatedButton>
              </Flex>
            </Box>
          </AnimatedCard>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          style={{ width: '100%', maxWidth: '800px' }}
        >
          <AnimatedCard delay={0.2}>
            <Box style={{ padding: '2rem' }}>
              <Text size="4" weight="bold" style={{ color: 'white', marginBottom: '1.5rem' }}>
                Quick Actions
              </Text>
              
              <Flex gap="3" wrap="wrap">
                <AnimatedButton variant="secondary">
                  🎮 Play Checkers
                </AnimatedButton>
                
                <AnimatedButton variant="secondary">
                  🏆 View Leaderboard
                </AnimatedButton>
                
                <AnimatedButton variant="secondary">
                  ⚡ Create Challenge
                </AnimatedButton>
                
                <AnimatedButton variant="secondary">
                  📊 Game History
                </AnimatedButton>
              </Flex>
            </Box>
          </AnimatedCard>
        </motion.div>

        {/* Transaction History (Placeholder) */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ width: '100%', maxWidth: '800px' }}
        >
          <AnimatedCard delay={0.3}>
            <Box style={{ padding: '2rem' }}>
              <Text size="4" weight="bold" style={{ color: 'white', marginBottom: '1.5rem' }}>
                Recent Activity
              </Text>
              
              <Box style={{ textAlign: 'center', padding: '2rem' }}>
                <Text style={{ color: '#ccc', marginBottom: '1rem' }}>
                  Transaction history coming soon...
                </Text>
                <Text size="1" style={{ color: '#666' }}>
                  View your complete transaction history on the OneChain Explorer
                </Text>
              </Box>
            </Box>
          </AnimatedCard>
        </motion.div>
      </Flex>

      {/* Faucet Dialog */}
      <Dialog.Root open={showFaucetDialog} onOpenChange={setShowFaucetDialog}>
        <Dialog.Content style={{ maxWidth: 500, background: 'rgba(15, 15, 35, 0.95)', backdropFilter: 'blur(20px)' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Dialog.Title style={{ color: 'white', textAlign: 'center' }}>
              Request Testnet Tokens
            </Dialog.Title>
            
            <Box style={{ marginBottom: '2rem' }}>
              <Text style={{ color: '#ccc', textAlign: 'center', marginBottom: '1rem' }}>
                Get test ONE tokens to play 1-Challenge on the testnet.
              </Text>
              
              {account && (
                <Card style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', marginBottom: '1rem' }}>
                  <Text size="1" style={{ color: '#ccc', marginBottom: '0.5rem' }}>Your Address:</Text>
                  <Text size="1" style={{ color: 'white', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                    {account.address}
                  </Text>
                </Card>
              )}
              
              {faucetResult && (
                <Card style={{ 
                  background: faucetResult.success ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
                  border: `1px solid ${faucetResult.success ? '#00ff00' : '#ff4444'}`,
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <Text style={{ color: faucetResult.success ? '#00ff00' : '#ff4444', textAlign: 'center' }}>
                    {faucetResult.message}
                  </Text>
                </Card>
              )}
            </Box>

            <Flex gap="3" justify="center">
              <Button 
                variant="soft" 
                onClick={() => setShowFaucetDialog(false)}
                style={{ color: 'white' }}
              >
                Cancel
              </Button>
              
              <AnimatedButton
                onClick={requestFaucet}
                disabled={faucetLoading}
                variant="primary"
              >
                {faucetLoading ? (
                  <Flex align="center" gap="2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{ width: 16, height: 16, border: '2px solid transparent', borderTop: '2px solid black', borderRadius: '50%' }}
                    />
                    Requesting...
                  </Flex>
                ) : (
                  '🚰 Request Tokens'
                )}
              </AnimatedButton>
            </Flex>
          </motion.div>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
}