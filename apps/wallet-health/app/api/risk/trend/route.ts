import { NextRequest, NextResponse } from 'next/server';
import { riskTrendAnalyzer } from '@/lib/risk-trend-analyzer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, snapshot, action, period, walletAddresses } = body;

    if (!walletAddress && !walletAddresses) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    if (action === 'add-snapshot') {
      if (!walletAddress || !snapshot) {
        return NextResponse.json(
          { error: 'Wallet address and snapshot are required' },
          { status: 400 }
        );
      }

      riskTrendAnalyzer.addSnapshot(walletAddress, snapshot);
      return NextResponse.json({
        success: true,
        data: { message: 'Snapshot added' },
      });
    }

    if (action === 'analyze') {
      if (!walletAddress) {
        return NextResponse.json(
          { error: 'Wallet address is required' },
          { status: 400 }
        );
      }

      const trend = riskTrendAnalyzer.analyzeTrend(walletAddress, period || '30d');
      return NextResponse.json({
        success: true,
        data: trend,
      });
    }

    if (action === 'history') {
      if (!walletAddress) {
        return NextResponse.json(
          { error: 'Wallet address is required' },
          { status: 400 }
        );
      }

      const limit = body.limit ? parseInt(body.limit) : undefined;
      const history = riskTrendAnalyzer.getSnapshotHistory(walletAddress, limit);
      return NextResponse.json({
        success: true,
        data: { history },
      });
    }

    if (action === 'compare') {
      if (!walletAddresses || !Array.isArray(walletAddresses)) {
        return NextResponse.json(
          { error: 'Wallet addresses array is required' },
          { status: 400 }
        );
      }

      const comparison = riskTrendAnalyzer.compareWallets(walletAddresses);
      return NextResponse.json({
        success: true,
        data: comparison,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error processing risk trend:', error);
    return NextResponse.json(
      { error: 'Failed to process risk trend', message: error.message },
      { status: 500 }
    );
  }
}

