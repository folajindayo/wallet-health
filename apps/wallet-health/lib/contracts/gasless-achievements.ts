/**
 * GaslessAchievements Contract Integration
 * 
 * This module provides utilities for interacting with the GaslessAchievements
 * NFT contract on Base network. Players can claim achievement NFTs without
 * paying gas fees through EIP-2771 meta-transactions.
 */

import { Address, PublicClient, WalletClient } from 'viem';
import { base } from 'viem/chains';
import { GASLESS_ACHIEVEMENTS_ABI, GASLESS_ACHIEVEMENTS_ADDRESS } from '../../abi';

// Achievement types enum
export enum AchievementType {
  FIRST_JUMP = 0,
  SCORE_100 = 1,
  SCORE_500 = 2,
  SCORE_1000 = 3,
  SCORE_5000 = 4,
  CONSECUTIVE_10 = 5,
  CONSECUTIVE_50 = 6,
  POWER_UP_MASTER = 7,
  OBSTACLE_DODGER = 8,
  SPEED_DEMON = 9,
  DAILY_PLAYER = 10,
  WEEKLY_CHAMPION = 11,
  MULTIPLAYER_WINNER = 12,
  TOKEN_EARNER = 13,
  EARLY_ADOPTER = 14,
}

// Rarity levels enum
export enum Rarity {
  COMMON = 0,
  RARE = 1,
  EPIC = 2,
  LEGENDARY = 3,
}

// Achievement config type
export interface AchievementConfig {
  name: string;
  description: string;
  rarity: Rarity;
  scoreRequired: bigint;
  isActive: boolean;
  metadataURI: string;
}

// Achievement details type
export interface Achievement {
  achievementType: AchievementType;
  scoreAtUnlock: bigint;
  timestamp: bigint;
  player: Address;
  rarity: Rarity;
}

// Player stats type
export interface PlayerStats {
  consecutiveJumps: bigint;
  powerUpsCollected: bigint;
  obstaclesDodged: bigint;
  multiplayerWins: bigint;
  tokensEarned: bigint;
  daysPlayed: bigint;
  lastPlayedDay: bigint;
}

/**
 * Check if a player is eligible for an achievement (VIEW FUNCTION - NO GAS)
 */
export async function isEligible(
  publicClient: PublicClient,
  playerAddress: Address,
  achievementType: AchievementType
): Promise<boolean> {
  const result = await publicClient.readContract({
    address: GASLESS_ACHIEVEMENTS_ADDRESS,
    abi: GASLESS_ACHIEVEMENTS_ABI,
    functionName: 'isEligible',
    args: [playerAddress, achievementType],
  });

  return result as boolean;
}

/**
 * Get all eligible achievements for a player (VIEW FUNCTION - NO GAS)
 */
export async function getEligibleAchievements(
  publicClient: PublicClient,
  playerAddress: Address
): Promise<AchievementType[]> {
  const result = await publicClient.readContract({
    address: GASLESS_ACHIEVEMENTS_ADDRESS,
    abi: GASLESS_ACHIEVEMENTS_ABI,
    functionName: 'getEligibleAchievements',
    args: [playerAddress],
  });

  return result as AchievementType[];
}

/**
 * Get player's current score (VIEW FUNCTION - NO GAS)
 */
export async function getPlayerScore(
  publicClient: PublicClient,
  playerAddress: Address
): Promise<bigint> {
  const result = await publicClient.readContract({
    address: GASLESS_ACHIEVEMENTS_ADDRESS,
    abi: GASLESS_ACHIEVEMENTS_ABI,
    functionName: 'playerScores',
    args: [playerAddress],
  });

  return result as bigint;
}

/**
 * Get player stats (VIEW FUNCTION - NO GAS)
 */
export async function getPlayerStats(
  publicClient: PublicClient,
  playerAddress: Address
): Promise<PlayerStats> {
  const result = await publicClient.readContract({
    address: GASLESS_ACHIEVEMENTS_ADDRESS,
    abi: GASLESS_ACHIEVEMENTS_ABI,
    functionName: 'playerStats',
    args: [playerAddress],
  });

  const stats = result as [bigint, bigint, bigint, bigint, bigint, bigint, bigint];
  return {
    consecutiveJumps: stats[0],
    powerUpsCollected: stats[1],
    obstaclesDodged: stats[2],
    multiplayerWins: stats[3],
    tokensEarned: stats[4],
    daysPlayed: stats[5],
    lastPlayedDay: stats[6],
  };
}

/**
 * Get all achievements owned by a player (VIEW FUNCTION - NO GAS)
 */
export async function getPlayerAchievements(
  publicClient: PublicClient,
  playerAddress: Address
): Promise<bigint[]> {
  const result = await publicClient.readContract({
    address: GASLESS_ACHIEVEMENTS_ADDRESS,
    abi: GASLESS_ACHIEVEMENTS_ABI,
    functionName: 'getPlayerAchievements',
    args: [playerAddress],
  });

  return result as bigint[];
}

/**
 * Get achievement details for a token ID (VIEW FUNCTION - NO GAS)
 */
export async function getAchievementDetails(
  publicClient: PublicClient,
  tokenId: bigint
): Promise<Achievement> {
  const result = await publicClient.readContract({
    address: GASLESS_ACHIEVEMENTS_ADDRESS,
    abi: GASLESS_ACHIEVEMENTS_ABI,
    functionName: 'getAchievementDetails',
    args: [tokenId],
  });

  const achievement = result as { 
    achievementType: AchievementType;
    scoreAtUnlock: bigint;
    timestamp: bigint;
    player: Address;
    rarity: Rarity;
  };
  return {
    achievementType: achievement.achievementType,
    scoreAtUnlock: achievement.scoreAtUnlock,
    timestamp: achievement.timestamp,
    player: achievement.player,
    rarity: achievement.rarity,
  };
}

/**
 * Claim an achievement NFT (GASLESS via meta-transaction)
 * Note: This requires a trusted forwarder setup for gasless transactions
 */
export async function claimAchievement(
  walletClient: WalletClient,
  account: Address,
  achievementType: AchievementType
): Promise<{ hash: Address; tokenId?: bigint }> {
  const hash = await walletClient.writeContract({
    address: GASLESS_ACHIEVEMENTS_ADDRESS,
    abi: GASLESS_ACHIEVEMENTS_ABI,
    functionName: 'claimAchievement',
    args: [achievementType],
    account,
    chain: base,
  });

  return { hash };
}

/**
 * Batch claim multiple achievements (GASLESS via meta-transaction)
 */
export async function batchClaimAchievements(
  walletClient: WalletClient,
  account: Address,
  achievementTypes: AchievementType[]
): Promise<{ hash: Address }> {
  const hash = await walletClient.writeContract({
    address: GASLESS_ACHIEVEMENTS_ADDRESS,
    abi: GASLESS_ACHIEVEMENTS_ABI,
    functionName: 'batchClaimAchievements',
    args: [achievementTypes],
    account,
    chain: base,
  });

  return { hash };
}

/**
 * Get achievement config (VIEW FUNCTION - NO GAS)
 */
export async function getAchievementConfig(
  publicClient: PublicClient,
  achievementType: AchievementType
): Promise<AchievementConfig> {
  const result = await publicClient.readContract({
    address: GASLESS_ACHIEVEMENTS_ADDRESS,
    abi: GASLESS_ACHIEVEMENTS_ABI,
    functionName: 'achievementConfigs',
    args: [achievementType],
  });

  const config = result as [string, string, Rarity, bigint, boolean, string];
  return {
    name: config[0],
    description: config[1],
    rarity: config[2],
    scoreRequired: config[3],
    isActive: config[4],
    metadataURI: config[5],
  };
}

/**
 * Get rarity name from enum
 */
export function getRarityName(rarity: Rarity): string {
  switch (rarity) {
    case Rarity.COMMON:
      return 'Common';
    case Rarity.RARE:
      return 'Rare';
    case Rarity.EPIC:
      return 'Epic';
    case Rarity.LEGENDARY:
      return 'Legendary';
    default:
      return 'Unknown';
  }
}

/**
 * Get achievement type name from enum
 */
export function getAchievementTypeName(type: AchievementType): string {
  const names: { [key in AchievementType]: string } = {
    [AchievementType.FIRST_JUMP]: 'First Jump',
    [AchievementType.SCORE_100]: 'Century',
    [AchievementType.SCORE_500]: 'Rising Star',
    [AchievementType.SCORE_1000]: 'Skilled Player',
    [AchievementType.SCORE_5000]: 'Master Jumper',
    [AchievementType.CONSECUTIVE_10]: 'Combo Starter',
    [AchievementType.CONSECUTIVE_50]: 'Combo Master',
    [AchievementType.POWER_UP_MASTER]: 'Power Collector',
    [AchievementType.OBSTACLE_DODGER]: 'Untouchable',
    [AchievementType.SPEED_DEMON]: 'Speed Demon',
    [AchievementType.DAILY_PLAYER]: 'Dedicated',
    [AchievementType.WEEKLY_CHAMPION]: 'Weekly Champion',
    [AchievementType.MULTIPLAYER_WINNER]: 'PvP Champion',
    [AchievementType.TOKEN_EARNER]: 'Token Master',
    [AchievementType.EARLY_ADOPTER]: 'Early Adopter',
  };

  return names[type] || 'Unknown Achievement';
}

