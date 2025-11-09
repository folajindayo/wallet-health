import { NextRequest, NextResponse } from 'next/server';
import { portfolioPerformanceTracker } from '@/lib/portfolio-performance';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, snapshot, action, period } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    if (action === 'record') {
      if (!snapshot) {
        return NextResponse.json(
          { error: 'Snapshot is required' },
          { status: 400 }
        );
      }

      portfolioPerformanceTracker.recordSnapshot(walletAddress, snapshot);
      return NextResponse.json({
        success: true,
        data: { message: 'Snapshot recorded' },
      });
    }

    if (action === 'calculate') {
      const metrics = portfolioPerformanceTracker.calculatePerformance(
        walletAddress,
        period || '30d'
      );

      return NextResponse.json({
        success: true,
        data: metrics,
      });
    }

    if (action === 'compare') {
      const comparison = await portfolioPerformanceTracker.compareWithBenchmarks(
        walletAddress,
        period || '30d'
      );

      return NextResponse.json({
        success: true,
        data: comparison,
      });
    }

    if (action === 'history') {
      const limit = body.limit ? parseInt(body.limit) : undefined;
      const history = portfolioPerformanceTracker.getPerformanceHistory(
        walletAddress,
        limit
      );

      return NextResponse.json({
        success: true,
        data: { history },
      });
    }

    if (action === 'allocation-changes') {
      const changes = portfolioPerformanceTracker.calculateAllocationChanges(
        walletAddress,
        period || '7d'
      );

      return NextResponse.json({
        success: true,
        data: { changes },
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error processing performance request:', error);
    return NextResponse.json(
      { error: 'Failed to process performance request', message: error.message },
      { status: 500 }
    );
  }
}

