import { NextRequest, NextResponse } from 'next/server';
import { walletConnectionAnalytics } from '@/lib/wallet-connection-analytics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, walletAddress, ...params } = body;

    switch (action) {
      case 'start_session':
        const sessionId = walletConnectionAnalytics.startSession({
          walletAddress: params.walletAddress,
          chainId: params.chainId,
          connectionMethod: params.connectionMethod || 'other',
          userAgent: request.headers.get('user-agent') || undefined,
        });
        return NextResponse.json({ success: true, data: { sessionId } });

      case 'end_session':
        const session = walletConnectionAnalytics.endSession(params.sessionId);
        return NextResponse.json({ success: true, data: session });

      case 'track_action':
        walletConnectionAnalytics.trackAction(params.sessionId, params.actionType);
        return NextResponse.json({ success: true });

      case 'get_analytics':
        const analytics = walletConnectionAnalytics.getAnalytics(walletAddress);
        return NextResponse.json({ success: true, data: analytics });

      case 'get_sessions':
        const sessions = walletConnectionAnalytics.getSessions(walletAddress);
        return NextResponse.json({ success: true, data: sessions });

      case 'get_active_sessions':
        const activeSessions = walletConnectionAnalytics.getActiveSessions(walletAddress);
        return NextResponse.json({ success: true, data: activeSessions });

      case 'export':
        const exportData = walletConnectionAnalytics.exportData(walletAddress);
        return NextResponse.json({ success: true, data: exportData });

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Connection analytics error:', error);
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

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, message: 'walletAddress is required' },
        { status: 400 }
      );
    }

    const analytics = walletConnectionAnalytics.getAnalytics(walletAddress);
    return NextResponse.json({ success: true, data: analytics });
  } catch (error: any) {
    console.error('Connection analytics error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

