import React, { useState, useEffect } from 'react';
import { Box, Table, Button, Dialog, Flex, TextField, Text } from '@radix-ui/themes';
import { useCurrentAccount, useSuiClient } from '@onelabs/dapp-kit';
import { LeaderboardEntry, Player } from '../types/game';

// Enhanced mock data with more players
const mockLeaderboard: LeaderboardEntry[] = Array.from({ length: 20 }, (_, i) => ({
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
  onChallenge: (stakeAmount: number) => void;
}

function ChallengeDialog({ player, onClose, onChallenge }: ChallengeDialogProps) {
  const [stakeAmount, setStakeAmount] = useState('1.0');
  const currentAccount = useCurrentAccount();

  const handleSubmit = () => {
    const amount = parseFloat(stakeAmount);
    if (amount >= 0.1 && amount <= 100) {
      onChallenge(amount);
    }
  };

  return (
    <Dialog.Root open={true}>
      <Dialog.Content style={{ maxWidth: 450 }}>
        <Dialog.Title>Challenge {player.username}</Dialog.Title>
        
        <Flex direction="column" gap="3">
          <Box>
            <Text as="div" size="2" weight="bold">
              Player Stats:
            </Text>
            <Text as="div" size="1" color="gray">
              Rating: {player.rating} • Wins: {player.wins} • Losses: {player.losses}
            </Text>
          </Box>

          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Stake Amount (SUI)
            </Text>
            <TextField.Root
              type="number"
              step="0.1"
              min="0.1"
              max="100"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder="Enter stake amount"
            />
            <Text size="1" color="gray" style={{ marginTop: '4px' }}>
              Minimum: 0.1 SUI, Maximum: 100 SUI
            </Text>
          </label>

          {currentAccount && (
            <Box style={{ 
              backgroundColor: 'var(--blue-3)', 
              padding: '8px', 
              borderRadius: '4px',
              fontSize: '0.8em'
            }}>
              <Text>Your address: {currentAccount.address.slice(0, 8)}...{currentAccount.address.slice(-6)}</Text>
            </Box>
          )}
        </Flex>

        <Flex gap="3" mt="4" justify="end">
          <Button variant="soft" color="gray" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!stakeAmount || parseFloat(stakeAmount) < 0.1}>
            Send Challenge ({stakeAmount} SUI)
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export function Leaderboard() {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleChallenge = async (stakeAmount: number) => {
    if (!currentAccount || !selectedPlayer) return;
    
    // TODO: Implement actual challenge creation on Sui blockchain
    console.log('Creating challenge on chain:', {
      challenger: currentAccount.address,
      opponent: selectedPlayer.address,
      stakeAmount,
      timestamp: Date.now()
    });
    
    // Simulate transaction
    alert(`Challenge sent to ${selectedPlayer.username} with stake of ${stakeAmount} SUI!`);
    
    setSelectedPlayer(null);
  };

  const filteredLeaderboard = mockLeaderboard.filter(entry =>
    entry.player.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.player.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box style={{ padding: '20px', color: 'white' }}>
      <Text size="6" weight="bold" style={{ marginBottom: '20px' }}>Checkers Leaderboard</Text>
      
      {/* Search box */}
      <Box style={{ marginBottom: '20px' }}>
        <TextField.Root
          placeholder="Search players..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: '300px' }}
        />
      </Box>

      <Table.Root variant="surface" style={{ backgroundColor: 'var(--gray-3)' }}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Rank</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Player</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Rating</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Win Rate</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Total Winnings</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Action</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {filteredLeaderboard.map((entry) => (
            <Table.Row key={entry.player.id} style={{ color: 'white' }}>
              <Table.RowHeaderCell>
                <Box>
                  <Text weight="bold">#{entry.rank}</Text>
                  {entry.rank <= 3 && (
                    <Text size="1" color="gold">🏆</Text>
                  )}
                </Box>
              </Table.RowHeaderCell>
              <Table.Cell>
                <Box>
                  <div><strong>{entry.player.username}</strong></div>
                  <div style={{ fontSize: '0.8em', color: '#ccc' }}>
                    {entry.player.address.slice(0, 8)}...{entry.player.address.slice(-6)}
                  </div>
                </Box>
              </Table.Cell>
              <Table.Cell>
                <Text weight="bold" color={entry.player.rating >= 1500 ? "green" : "blue"}>
                  {entry.player.rating}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <Box>
                  <div>{entry.winRate}%</div>
                  <div 
                    style={{ 
                      width: '80px', 
                      height: '6px', 
                      backgroundColor: '#555',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}
                  >
                    <div 
                      style={{ 
                        width: `${entry.winRate}%`, 
                        height: '100%', 
                        backgroundColor: 
                          entry.winRate >= 80 ? '#4CAF50' :
                          entry.winRate >= 60 ? '#2196F3' :
                          entry.winRate >= 40 ? '#FF9800' : '#F44336'
                      }} 
                    />
                  </div>
                </Box>
              </Table.Cell>
              <Table.Cell>
                <Text weight="bold" color="amber">
                  {entry.totalWinnings.toFixed(1)} SUI
                </Text>
              </Table.Cell>
              <Table.Cell>
                <Button 
                  size="1" 
                  disabled={!currentAccount || entry.player.address === currentAccount.address}
                  onClick={() => setSelectedPlayer(entry.player)}
                >
                  Challenge
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root> {/* Fixed: Changed from Table.Row to Table.Root */}

      {selectedPlayer && (
        <ChallengeDialog
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          onChallenge={handleChallenge}
        />
      )}
    </Box>
  );
}