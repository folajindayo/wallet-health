import { NextRequest, NextResponse } from 'next/server';
import { walletSecurityScoreTracker } from '@/lib/wallet-security-score-tracker';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, walletAddress, snapshot, days } = body;

    switch (action) {
      case 'add_snapshot':
        if (!walletAddress || !snapshot) {
          return NextResponse.json(
            { success: false, message: 'walletAddress and snapshot are required' },
            { status: 400 }
          );
        }
        walletSecurityScoreTracker.addSnapshot(walletAddress, snapshot);
        return NextResponse.json({ success: true });

      case 'get_history':
        if (!walletAddress) {
          return NextResponse.json(
            { success: false, message: 'walletAddress is required' },
            { status: 400 }
          );
        }
        const history = walletSecurityScoreTracker.getHistory(walletAddress, days);
        return NextResponse.json({ success: true, data: history });

      case 'get_statistics':
        if (!walletAddress) {
          return NextResponse.json(
            { success: false, message: 'walletAddress is required' },
            { status: 400 }
          );
        }
        const statistics = walletSecurityScoreTracker.getStatistics(walletAddress);
        return NextResponse.json({ success: true, data: statistics });

      case 'export':
        if (!walletAddress) {
          return NextResponse.json(
            { success: false, message: 'walletAddress is required' },
            { status: 400 }
          );
        }
        const exportData = walletSecurityScoreTracker.exportHistory(walletAddress);
        return NextResponse.json({ success: true, data: exportData });

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Security score tracker error:', error);
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
    const days = searchParams.get('days');

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, message: 'walletAddress is required' },
        { status: 400 }
      );
    }

    const history = walletSecurityScoreTracker.getHistory(
      walletAddress,
      days ? parseInt(days) : undefined
    );
    return NextResponse.json({ success: true, data: history });
  } catch (error: any) {
    console.error('Security score tracker error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

