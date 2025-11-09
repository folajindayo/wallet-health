import { NextRequest, NextResponse } from 'next/server';
import { crossChainBridgeTracker } from '@/lib/cross-chain-bridge-tracker';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, bridge, action, hash, status, completionHash, options } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    if (action === 'add') {
      if (!bridge) {
        return NextResponse.json(
          { error: 'Bridge transaction is required' },
          { status: 400 }
        );
      }

      crossChainBridgeTracker.addBridge(walletAddress, bridge);
      return NextResponse.json({
        success: true,
        data: { message: 'Bridge added' },
      });
    }

    if (action === 'update') {
      if (!hash || !status) {
        return NextResponse.json(
          { error: 'Hash and status are required' },
          { status: 400 }
        );
      }

      const updated = crossChainBridgeTracker.updateBridgeStatus(
        walletAddress,
        hash,
        status,
        completionHash
      );

      return NextResponse.json({
        success: updated,
        data: { updated },
      });
    }

    if (action === 'analyze') {
      const analysis = crossChainBridgeTracker.analyzeBridges(
        walletAddress,
        options || {}
      );

      return NextResponse.json({
        success: true,
        data: analysis,
      });
    }

    if (action === 'stats') {
      const stats = crossChainBridgeTracker.getStats(walletAddress);
      return NextResponse.json({
        success: true,
        data: stats,
      });
    }

    if (action === 'pending') {
      const pending = crossChainBridgeTracker.getPendingBridges(walletAddress);
      return NextResponse.json({
        success: true,
        data: { bridges: pending },
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error processing bridge request:', error);
    return NextResponse.json(
      { error: 'Failed to process bridge request', message: error.message },
      { status: 500 }
    );
  }
}

