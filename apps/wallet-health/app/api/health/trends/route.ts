import { NextRequest, NextResponse } from 'next/server';
import { healthTrendsTracker } from '@/lib/health-trends';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, snapshot, periods, action } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    if (action === 'record' && snapshot) {
      healthTrendsTracker.recordSnapshot(walletAddress, snapshot);
      return NextResponse.json({
        success: true,
        data: { message: 'Snapshot recorded' },
      });
    }

    if (action === 'get' || !action) {
      const trends = healthTrendsTracker.getTrends(
        walletAddress,
        periods || ['7d', '30d', '90d']
      );

      return NextResponse.json({
        success: true,
        data: trends,
      });
    }

    if (action === 'history') {
      const limit = body.limit ? parseInt(body.limit) : undefined;
      const history = healthTrendsTracker.getSnapshotHistory(walletAddress, limit);

      return NextResponse.json({
        success: true,
        data: { history },
      });
    }

    if (action === 'export') {
      const data = healthTrendsTracker.exportTrendsData(walletAddress);
      return NextResponse.json({
        success: true,
        data,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error processing health trends:', error);
    return NextResponse.json(
      { error: 'Failed to process health trends', message: error.message },
      { status: 500 }
    );
  }
}

