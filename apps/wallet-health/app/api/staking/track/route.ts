import { NextRequest, NextResponse } from 'next/server';
import { stakingTracker } from '@/lib/staking-tracker';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, position, reward, action, positionId, updates, options } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    if (action === 'add-position') {
      if (!position) {
        return NextResponse.json(
          { error: 'Position is required' },
          { status: 400 }
        );
      }

      const createdPosition = stakingTracker.addPosition(walletAddress, position);
      return NextResponse.json({
        success: true,
        data: { position: createdPosition },
      });
    }

    if (action === 'update-position') {
      if (!positionId || !updates) {
        return NextResponse.json(
          { error: 'Position ID and updates are required' },
          { status: 400 }
        );
      }

      const updated = stakingTracker.updatePosition(walletAddress, positionId, updates);
      return NextResponse.json({
        success: updated,
        data: { updated },
      });
    }

    if (action === 'record-reward') {
      if (!reward) {
        return NextResponse.json(
          { error: 'Reward is required' },
          { status: 400 }
        );
      }

      stakingTracker.recordReward(walletAddress, reward);
      return NextResponse.json({
        success: true,
        data: { message: 'Reward recorded' },
      });
    }

    if (action === 'summary') {
      const summary = stakingTracker.getSummary(walletAddress);
      return NextResponse.json({
        success: true,
        data: summary,
      });
    }

    if (action === 'positions') {
      const positions = stakingTracker.getPositions(walletAddress, options || {});
      return NextResponse.json({
        success: true,
        data: { positions },
      });
    }

    if (action === 'rewards') {
      const rewards = stakingTracker.getRewards(walletAddress, options || {});
      return NextResponse.json({
        success: true,
        data: { rewards },
      });
    }

    if (action === 'estimated-rewards') {
      const estimates = stakingTracker.calculateEstimatedRewards(walletAddress);
      return NextResponse.json({
        success: true,
        data: estimates,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error processing staking request:', error);
    return NextResponse.json(
      { error: 'Failed to process staking request', message: error.message },
      { status: 500 }
    );
  }
}

