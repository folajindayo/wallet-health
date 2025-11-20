/**
 * useGaslessAchievements Hook
 * 
 * React hook for interacting with the GaslessAchievements contract
 * Provides functions to check eligibility, claim achievements, and view player stats
 */

import { useState, useCallback, useEffect } from 'react';
import { usePublicClient, useWalletClient, useAccount } from 'wagmi';
import { Address } from 'viem';
import {
  AchievementType,
  Rarity,
  Achievement,
  PlayerStats,
  isEligible,
  getEligibleAchievements,
  getPlayerScore,
  getPlayerStats,
  getPlayerAchievements,
  getAchievementDetails,
  claimAchievement,
  batchClaimAchievements,
  getAchievementConfig,
  getRarityName,
  getAchievementTypeName,
} from '@/lib/contracts/gasless-achievements';

export function useGaslessAchievements() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Player data states
  const [playerScore, setPlayerScore] = useState<bigint>(0n);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [eligibleAchievements, setEligibleAchievements] = useState<AchievementType[]>([]);
  const [ownedAchievements, setOwnedAchievements] = useState<bigint[]>([]);

  // Load player data
  const loadPlayerData = useCallback(async () => {
    if (!publicClient || !address) return;

    try {
      setLoading(true);
      setError(null);

      const [score, stats, eligible, owned] = await Promise.all([
        getPlayerScore(publicClient, address as Address),
        getPlayerStats(publicClient, address as Address),
        getEligibleAchievements(publicClient, address as Address),
        getPlayerAchievements(publicClient, address as Address),
      ]);

      setPlayerScore(score);
      setPlayerStats(stats);
      setEligibleAchievements(eligible);
      setOwnedAchievements(owned);
    } catch (err: any) {
      console.error('Failed to load player data:', err);
      setError(err.message || 'Failed to load player data');
    } finally {
      setLoading(false);
    }
  }, [publicClient, address]);

  // Auto-load player data when address changes
  useEffect(() => {
    if (address) {
      loadPlayerData();
    }
  }, [address, loadPlayerData]);

  // Check if player is eligible for specific achievement
  const checkEligibility = useCallback(
    async (achievementType: AchievementType): Promise<boolean> => {
      if (!publicClient || !address) return false;

      try {
        return await isEligible(publicClient, address as Address, achievementType);
      } catch (err: any) {
        console.error('Failed to check eligibility:', err);
        return false;
      }
    },
    [publicClient, address]
  );

  // Claim a single achievement
  const claim = useCallback(
    async (achievementType: AchievementType) => {
      if (!walletClient || !address) {
        throw new Error('Wallet not connected');
      }

      try {
        setLoading(true);
        setError(null);

        const result = await claimAchievement(
          walletClient,
          address as Address,
          achievementType
        );

        // Reload player data after claim
        await loadPlayerData();

        return result;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to claim achievement';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [walletClient, address, loadPlayerData]
  );

  // Batch claim multiple achievements
  const batchClaim = useCallback(
    async (achievementTypes: AchievementType[]) => {
      if (!walletClient || !address) {
        throw new Error('Wallet not connected');
      }

      try {
        setLoading(true);
        setError(null);

        const result = await batchClaimAchievements(
          walletClient,
          address as Address,
          achievementTypes
        );

        // Reload player data after claim
        await loadPlayerData();

        return result;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to batch claim achievements';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [walletClient, address, loadPlayerData]
  );

  // Get achievement details by token ID
  const getDetails = useCallback(
    async (tokenId: bigint): Promise<Achievement | null> => {
      if (!publicClient) return null;

      try {
        return await getAchievementDetails(publicClient, tokenId);
      } catch (err: any) {
        console.error('Failed to get achievement details:', err);
        return null;
      }
    },
    [publicClient]
  );

  // Get achievement configuration
  const getConfig = useCallback(
    async (achievementType: AchievementType) => {
      if (!publicClient) return null;

      try {
        return await getAchievementConfig(publicClient, achievementType);
      } catch (err: any) {
        console.error('Failed to get achievement config:', err);
        return null;
      }
    },
    [publicClient]
  );

  return {
    // State
    loading,
    error,
    playerScore,
    playerStats,
    eligibleAchievements,
    ownedAchievements,

    // Functions
    loadPlayerData,
    checkEligibility,
    claim,
    batchClaim,
    getDetails,
    getConfig,

    // Utilities
    getRarityName,
    getAchievementTypeName,

    // Enums
    AchievementType,
    Rarity,
  };
}

