import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, Address } from 'viem';
import { base } from 'viem/chains';
import {
  getPlayerScore,
  getPlayerStats,
  getEligibleAchievements,
  getPlayerAchievements,
  getAchievementDetails,
  getAchievementConfig,
  AchievementType,
} from '@/lib/contracts/gasless-achievements';

/**
 * GET /api/achievements?address=0x...
 * Get player achievements data
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Missing address parameter' },
        { status: 400 }
      );
    }

    const publicClient = createPublicClient({
      chain: base,
      transport: http(),
    });

    // Fetch all player data
    const [score, stats, eligible, owned] = await Promise.all([
      getPlayerScore(publicClient, address as Address),
      getPlayerStats(publicClient, address as Address),
      getEligibleAchievements(publicClient, address as Address),
      getPlayerAchievements(publicClient, address as Address),
    ]);

    // Get details for owned achievements
    const ownedDetails = await Promise.all(
      owned.map(async (tokenId) => {
        const details = await getAchievementDetails(publicClient, tokenId);
        return {
          tokenId: tokenId.toString(),
          ...details,
          achievementType: Number(details.achievementType),
          scoreAtUnlock: details.scoreAtUnlock.toString(),
          timestamp: details.timestamp.toString(),
          rarity: Number(details.rarity),
        };
      })
    );

    // Get configs for eligible achievements
    const eligibleConfigs = await Promise.all(
      eligible.map(async (type) => {
        const config = await getAchievementConfig(publicClient, type);
        return {
          type: Number(type),
          ...config,
          scoreRequired: config.scoreRequired.toString(),
          rarity: Number(config.rarity),
        };
      })
    );

    return NextResponse.json({
      success: true,
      address,
      score: score.toString(),
      stats: {
        consecutiveJumps: stats.consecutiveJumps.toString(),
        powerUpsCollected: stats.powerUpsCollected.toString(),
        obstaclesDodged: stats.obstaclesDodged.toString(),
        multiplayerWins: stats.multiplayerWins.toString(),
        tokensEarned: stats.tokensEarned.toString(),
        daysPlayed: stats.daysPlayed.toString(),
        lastPlayedDay: stats.lastPlayedDay.toString(),
      },
      eligibleAchievements: eligibleConfigs,
      ownedAchievements: ownedDetails,
    });
  } catch (error: any) {
    console.error('Achievements API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch achievements data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/achievements
 * Get specific achievement config
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { achievementType } = body;

    if (achievementType === undefined) {
      return NextResponse.json(
        { error: 'Missing achievementType parameter' },
        { status: 400 }
      );
    }

    const publicClient = createPublicClient({
      chain: base,
      transport: http(),
    });

    const config = await getAchievementConfig(
      publicClient,
      achievementType as AchievementType
    );

    return NextResponse.json({
      success: true,
      config: {
        ...config,
        scoreRequired: config.scoreRequired.toString(),
        rarity: Number(config.rarity),
      },
    });
  } catch (error: any) {
    console.error('Achievements API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch achievement config' },
      { status: 500 }
    );
  }
}


