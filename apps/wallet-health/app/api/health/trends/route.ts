import { NextRequest, NextResponse } from 'next/server';
import { walletHealthTrends } from '@/lib/wallet-health-trends';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, walletAddress, snapshot, options } = body;

    switch (action) {
      case 'add_snapshot':
        if (!walletAddress || !snapshot) {
          return NextResponse.json(
            { success: false, message: 'walletAddress and snapshot are required' },
            { status: 400 }
          );
        }
        walletHealthTrends.addSnapshot(walletAddress, snapshot);
        return NextResponse.json({ success: true });

      case 'get_trend':
        if (!walletAddress) {
          return NextResponse.json(
            { success: false, message: 'walletAddress is required' },
            { status: 400 }
          );
        }
        const trend = walletHealthTrends.getTrend(walletAddress, options);
        return NextResponse.json({ success: true, data: trend });

      case 'get_snapshots':
        if (!walletAddress) {
          return NextResponse.json(
            { success: false, message: 'walletAddress is required' },
            { status: 400 }
          );
        }
        const snapshots = walletHealthTrends.getSnapshots(walletAddress);
        return NextResponse.json({ success: true, data: snapshots });

      case 'export':
        if (!walletAddress) {
          return NextResponse.json(
            { success: false, message: 'walletAddress is required' },
            { status: 400 }
          );
        }
        const exportData = walletHealthTrends.exportTrendData(walletAddress);
        return NextResponse.json({ success: true, data: exportData });

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Health trends error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('walletAddress');
    const lookbackDays = searchParams.get('lookbackDays');

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, message: 'walletAddress is required' },
        { status: 400 }
      );
    }

    const options = lookbackDays ? { lookbackDays: parseInt(lookbackDays) } : undefined;
    const trend = walletHealthTrends.getTrend(walletAddress, options);
    return NextResponse.json({ success: true, data: trend });
  } catch (error: any) {
    console.error('Health trends error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
