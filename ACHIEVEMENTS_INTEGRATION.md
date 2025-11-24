# GaslessAchievements Contract Integration

This document explains how to use the GaslessAchievements NFT contract in the Wallet Health application.

## Contract Details

- **Contract Address**: `0x2c366F0a2c9CB85ef7e1f6Af7b264640840faA89`
- **Network**: Base Mainnet (Chain ID: 8453)
- **ABI Location**: `/apps/wallet-health/abi.ts`

## Overview

The GaslessAchievements contract is an ERC-721 NFT contract for game achievements with gasless claiming via EIP-2771 meta-transactions. Features include:

- Gasless achievement claiming (no gas fees for players)
- Player score and stats tracking
- Multiple achievement types with different rarities
- ERC-721 standard NFTs with metadata

## Usage in React Components

### 1. Using the Hook

The `useGaslessAchievements` hook provides a complete interface:

```typescript
'use client';

import { useAccount } from 'wagmi';
import { useGaslessAchievements } from '@/hooks/useGaslessAchievements';

function AchievementsPage() {
  const { address } = useAccount();
  const {
    loading,
    error,
    playerScore,
    playerStats,
    eligibleAchievements,
    ownedAchievements,
    claim,
    batchClaim,
    loadPlayerData,
    checkEligibility,
    getAchievementTypeName,
    getRarityName,
    AchievementType,
    Rarity,
  } = useGaslessAchievements();

  // Claim a single achievement
  const handleClaim = async (achievementType: AchievementType) => {
    try {
      const result = await claim(achievementType);
      console.log('Achievement claimed:', result.hash);
      
      // Data is automatically reloaded after claiming
    } catch (err) {
      console.error('Failed to claim:', err);
    }
  };

  // Batch claim all eligible achievements
  const handleClaimAll = async () => {
    if (eligibleAchievements.length === 0) return;

    try {
      const result = await batchClaim(eligibleAchievements);
      console.log('Achievements claimed:', result.hash);
    } catch (err) {
      console.error('Failed to batch claim:', err);
    }
  };

  return (
    <div>
      <h1>Your Achievements</h1>
      
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Player Stats */}
      <div className="stats">
        <h2>Score: {playerScore.toString()}</h2>
        {playerStats && (
          <div>
            <p>Consecutive Jumps: {playerStats.consecutiveJumps.toString()}</p>
            <p>Power-Ups: {playerStats.powerUpsCollected.toString()}</p>
            <p>Obstacles Dodged: {playerStats.obstaclesDodged.toString()}</p>
            <p>Days Played: {playerStats.daysPlayed.toString()}</p>
          </div>
        )}
      </div>

      {/* Eligible Achievements */}
      <div className="eligible">
        <h2>Eligible to Claim ({eligibleAchievements.length})</h2>
        {eligibleAchievements.map((type) => (
          <div key={type}>
            <p>{getAchievementTypeName(type)}</p>
            <button onClick={() => handleClaim(type)}>
              Claim (Gasless)
            </button>
          </div>
        ))}
        
        {eligibleAchievements.length > 0 && (
          <button onClick={handleClaimAll}>
            Claim All ({eligibleAchievements.length})
          </button>
        )}
      </div>

      {/* Owned Achievements */}
      <div className="owned">
        <h2>Your Collection ({ownedAchievements.length})</h2>
        {ownedAchievements.map((tokenId) => (
          <div key={tokenId.toString()}>
            <p>Token #{tokenId.toString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 2. Direct Contract Functions

You can also use the contract functions directly with wagmi:

```typescript
import { usePublicClient } from 'wagmi';
import {
  getPlayerScore,
  getEligibleAchievements,
  getAchievementDetails,
  AchievementType,
} from '@/lib/contracts/gasless-achievements';

function AchievementChecker() {
  const publicClient = usePublicClient();

  const checkPlayer = async (playerAddress: string) => {
    if (!publicClient) return;

    // Get player score (no gas required)
    const score = await getPlayerScore(
      publicClient,
      playerAddress as `0x${string}`
    );

    console.log('Player score:', score.toString());

    // Get eligible achievements
    const eligible = await getEligibleAchievements(
      publicClient,
      playerAddress as `0x${string}`
    );

    console.log('Eligible achievements:', eligible);

    // Check specific achievement details
    const details = await getAchievementDetails(publicClient, 1n);
    console.log('Achievement details:', {
      type: details.achievementType,
      scoreAtUnlock: details.scoreAtUnlock.toString(),
      rarity: details.rarity,
    });
  };

  return <button onClick={() => checkPlayer('0x...')}>Check Player</button>;
}
```

## API Routes

Server-side API routes are available for fetching achievement data:

### GET /api/achievements

Fetch all player achievement data:

```typescript
const response = await fetch('/api/achievements?address=0x1234...');
const data = await response.json();

console.log('Player data:', {
  score: data.score,
  stats: data.stats,
  eligibleAchievements: data.eligibleAchievements,
  ownedAchievements: data.ownedAchievements,
});
```

### POST /api/achievements

Get specific achievement configuration:

```typescript
const response = await fetch('/api/achievements', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ achievementType: 0 }), // FIRST_JUMP
});

const data = await response.json();
console.log('Achievement config:', data.config);
```

## Achievement Types

The contract supports the following achievement types:

- **FIRST_JUMP** (0): First time playing
- **SCORE_100** (1): Reach 100 points
- **SCORE_500** (2): Reach 500 points
- **SCORE_1000** (3): Reach 1,000 points
- **SCORE_5000** (4): Reach 5,000 points
- **CONSECUTIVE_10** (5): 10 consecutive jumps
- **CONSECUTIVE_50** (6): 50 consecutive jumps
- **POWER_UP_MASTER** (7): Collect many power-ups
- **OBSTACLE_DODGER** (8): Dodge many obstacles
- **SPEED_DEMON** (9): Complete with high speed
- **DAILY_PLAYER** (10): Play daily
- **WEEKLY_CHAMPION** (11): Weekly high score
- **MULTIPLAYER_WINNER** (12): Win multiplayer matches
- **TOKEN_EARNER** (13): Earn game tokens
- **EARLY_ADOPTER** (14): Early platform user

## Rarity Levels

Achievements have different rarity levels:

- **COMMON** (0): Common achievements
- **RARE** (1): Harder to earn
- **EPIC** (2): Significant accomplishments
- **LEGENDARY** (3): Ultimate achievements

## Gasless Transactions

The contract uses EIP-2771 meta-transactions for gasless claiming:

1. Players sign a message off-chain
2. A trusted forwarder submits the transaction
3. Contract verifies the signature
4. Player receives NFT without paying gas

## Player Stats Tracked

The contract tracks various player statistics:

- `consecutiveJumps`: Best consecutive jump streak
- `powerUpsCollected`: Total power-ups collected
- `obstaclesDodged`: Total obstacles dodged
- `multiplayerWins`: Multiplayer match wins
- `tokensEarned`: In-game tokens earned
- `daysPlayed`: Total days played
- `lastPlayedDay`: Last day number played

## Events

The contract emits the following events:

- `AchievementClaimed`: When a player claims an achievement
- `PlayerScoreUpdated`: When player score changes
- `PlayerStatsUpdated`: When player stats change
- `AchievementConfigUpdated`: When achievement config is modified

## Security Notes

1. All view functions are gas-free
2. Claiming requires signature verification
3. Achievements can only be claimed once per player
4. Player must be eligible based on score/stats
5. Contract is pausable for emergency stops


