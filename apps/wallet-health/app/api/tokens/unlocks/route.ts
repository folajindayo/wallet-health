import { NextRequest, NextResponse } from 'next/server';
import { tokenUnlockTracker } from '@/lib/token-unlock-tracker';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, unlock, event, action } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    if (action === 'add-schedule') {
      if (!unlock) {
        return NextResponse.json(
          { error: 'Unlock schedule is required' },
          { status: 400 }
        );
      }

      tokenUnlockTracker.addUnlockSchedule(walletAddress, unlock);
      return NextResponse.json({
        success: true,
        data: { message: 'Unlock schedule added' },
      });
    }

    if (action === 'record-event') {
      if (!event) {
        return NextResponse.json(
          { error: 'Unlock event is required' },
          { status: 400 }
        );
      }

      tokenUnlockTracker.recordUnlockEvent(walletAddress, event);
      return NextResponse.json({
        success: true,
        data: { message: 'Unlock event recorded' },
      });
    }

    if (action === 'summary') {
      const daysAhead = body.daysAhead ? parseInt(body.daysAhead) : 90;
      const summary = tokenUnlockTracker.getUnlockSummary(walletAddress, daysAhead);

      return NextResponse.json({
        success: true,
        data: summary,
      });
    }

    if (action === 'next-unlock') {
      const { tokenAddress, chainId } = body;
      if (!tokenAddress || !chainId) {
        return NextResponse.json(
          { error: 'Token address and chain ID are required' },
          { status: 400 }
        );
      }

      const nextUnlock = tokenUnlockTracker.getNextUnlock(
        walletAddress,
        tokenAddress,
        chainId
      );

      return NextResponse.json({
        success: true,
        data: { nextUnlock },
      });
    }

    if (action === 'progress') {
      const { tokenAddress, chainId } = body;
      if (!tokenAddress || !chainId) {
        return NextResponse.json(
          { error: 'Token address and chain ID are required' },
          { status: 400 }
        );
      }

      const progress = tokenUnlockTracker.calculateUnlockProgress(
        walletAddress,
        tokenAddress,
        chainId
      );

      return NextResponse.json({
        success: true,
        data: { progress },
      });
    }

    if (action === 'all') {
      const unlocks = tokenUnlockTracker.getAllUnlocks(walletAddress);
      return NextResponse.json({
        success: true,
        data: { unlocks },
      });
    }

    if (action === 'events') {
      const limit = body.limit ? parseInt(body.limit) : undefined;
      const events = tokenUnlockTracker.getUnlockEvents(walletAddress, limit);
      return NextResponse.json({
        success: true,
        data: { events },
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error processing token unlocks:', error);
    return NextResponse.json(
      { error: 'Failed to process token unlocks', message: error.message },
      { status: 500 }
    );
  }
}

