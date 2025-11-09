import { NextRequest, NextResponse } from 'next/server';
import { tokenSnapshotManager } from '@/lib/token-snapshot-manager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { snapshot, walletAddress, chainId, action, snapshot1, snapshot2, period, options } = body;

    if (action === 'create') {
      if (!snapshot) {
        return NextResponse.json(
          { error: 'Snapshot is required' },
          { status: 400 }
        );
      }

      tokenSnapshotManager.createSnapshot(snapshot);
      return NextResponse.json({
        success: true,
        data: { message: 'Snapshot created' },
      });
    }

    if (action === 'get') {
      if (!walletAddress || !chainId) {
        return NextResponse.json(
          { error: 'Wallet address and chain ID are required' },
          { status: 400 }
        );
      }

      const snapshots = tokenSnapshotManager.getSnapshots(
        walletAddress,
        chainId,
        options || {}
      );
      return NextResponse.json({
        success: true,
        data: { snapshots },
      });
    }

    if (action === 'latest') {
      if (!walletAddress || !chainId) {
        return NextResponse.json(
          { error: 'Wallet address and chain ID are required' },
          { status: 400 }
        );
      }

      const latest = tokenSnapshotManager.getLatestSnapshot(walletAddress, chainId);
      return NextResponse.json({
        success: true,
        data: { snapshot: latest },
      });
    }

    if (action === 'compare') {
      if (!snapshot1 || !snapshot2) {
        return NextResponse.json(
          { error: 'Both snapshots are required' },
          { status: 400 }
        );
      }

      const comparison = tokenSnapshotManager.compareSnapshots(snapshot1, snapshot2);
      return NextResponse.json({
        success: true,
        data: comparison,
      });
    }

    if (action === 'series') {
      if (!walletAddress || !chainId) {
        return NextResponse.json(
          { error: 'Wallet address and chain ID are required' },
          { status: 400 }
        );
      }

      const series = tokenSnapshotManager.getSnapshotSeries(walletAddress, chainId);
      return NextResponse.json({
        success: true,
        data: series,
      });
    }

    if (action === 'growth') {
      if (!walletAddress || !chainId || !period) {
        return NextResponse.json(
          { error: 'Wallet address, chain ID, and period are required' },
          { status: 400 }
        );
      }

      const growth = tokenSnapshotManager.calculateGrowth(walletAddress, chainId, period);
      return NextResponse.json({
        success: true,
        data: growth,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error processing token snapshot:', error);
    return NextResponse.json(
      { error: 'Failed to process token snapshot', message: error.message },
      { status: 500 }
    );
  }
}

