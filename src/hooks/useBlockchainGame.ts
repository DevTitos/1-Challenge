import { useState, useEffect, useCallback } from 'react';
import { useCurrentAccount } from '@onelabs/dapp-kit';

// Types for our game contract
export interface GameChallenge {
  id: string;
  challenger: string;
  opponent: string;
  stakeAmount: number;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  gameState?: string;
  winner?: string;
  createdAt: number;
}

export function useBlockchainGame() {
  const account = useCurrentAccount();
  const [challenges, setChallenges] = useState<GameChallenge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);

  // Load player challenges
  const loadChallenges = useCallback(async () => {
    if (!account) return;
    
    setLoading(true);
    setError(null);
    try {
      // Mock data - replace with actual chain query
      const mockChallenges: GameChallenge[] = [
        {
          id: 'challenge_1',
          challenger: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          opponent: account.address,
          stakeAmount: 1.5,
          status: 'pending',
          createdAt: Date.now() - 1000000
        },
        {
          id: 'challenge_2',
          challenger: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          opponent: account.address,
          stakeAmount: 2.0,
          status: 'pending',
          createdAt: Date.now() - 2000000
        }
      ];
      setChallenges(mockChallenges);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load challenges');
      console.error('Error loading challenges:', err);
    } finally {
      setLoading(false);
    }
  }, [account]);

  // Create a new challenge
  const createChallenge = useCallback(async (opponent: string, stakeAmount: number) => {
    if (!account) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);
    try {
      // Mock implementation
      console.log('Creating challenge:', { opponent, stakeAmount });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = {
        success: true,
        transactionId: 'mock_tx_' + Date.now(),
        challengeId: 'challenge_' + Math.random().toString(36).substr(2, 9)
      };
      
      if (result.success) {
        // Add to transaction history
        setTransactionHistory(prev => [{
          type: 'create_challenge',
          transactionId: result.transactionId,
          timestamp: Date.now(),
          opponent,
          stakeAmount
        }, ...prev]);
        
        // Add the new challenge to local state
        const newChallenge: GameChallenge = {
          id: result.challengeId!,
          challenger: account.address,
          opponent,
          stakeAmount,
          status: 'pending',
          createdAt: Date.now()
        };
        
        setChallenges(prev => [...prev, newChallenge]);
        return result;
      } else {
        throw new Error('Failed to create challenge');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [account]);

  // Accept a challenge
  const acceptChallenge = useCallback(async (challengeId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Mock implementation
      console.log('Accepting challenge:', challengeId);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = {
        success: true,
        transactionId: 'mock_accept_tx_' + Date.now()
      };
      
      if (result.success) {
        // Add to transaction history
        setTransactionHistory(prev => [{
          type: 'accept_challenge',
          transactionId: result.transactionId,
          timestamp: Date.now(),
          challengeId
        }, ...prev]);
        
        // Update local state
        setChallenges(prev => prev.map(challenge => 
          challenge.id === challengeId 
            ? { ...challenge, status: 'accepted' as const }
            : challenge
        ));
        return result;
      } else {
        throw new Error('Failed to accept challenge');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Submit a move
  const submitMove = useCallback(async (challengeId: string, move: any) => {
    setLoading(true);
    setError(null);
    try {
      // Mock implementation
      console.log('Submitting move:', { challengeId, move });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = {
        success: true,
        transactionId: 'mock_move_tx_' + Date.now()
      };
      
      if (result.success) {
        // Add to transaction history
        setTransactionHistory(prev => [{
          type: 'submit_move',
          transactionId: result.transactionId,
          timestamp: Date.now(),
          challengeId,
          move
        }, ...prev]);
        
        return result;
      } else {
        throw new Error('Failed to submit move');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get player stats
  const getPlayerStats = useCallback(async () => {
    try {
      // Mock implementation
      return {
        wins: Math.floor(Math.random() * 50),
        losses: Math.floor(Math.random() * 20),
        totalStaked: Math.random() * 100,
        rating: 1200 + Math.floor(Math.random() * 400)
      };
    } catch (err) {
      console.error('Error fetching player stats:', err);
      return null;
    }
  }, []);

  // Get transaction status
  const getTransactionStatus = useCallback(async (digest: string) => {
    try {
      // Mock implementation
      return {
        digest,
        status: 'success',
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return null;
    }
  }, []);

  // Load challenges when account changes
  useEffect(() => {
    if (account) {
      loadChallenges();
    }
  }, [account, loadChallenges]);

  return {
    challenges,
    loading,
    error,
    transactionHistory,
    createChallenge,
    acceptChallenge,
    submitMove,
    getPlayerStats,
    getTransactionStatus,
    loadChallenges,
    hasContract: true,
    isConnected: !!account
  };
}