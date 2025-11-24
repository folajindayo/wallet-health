import { NextRequest, NextResponse } from 'next/server';
import { walletActivityPredictor } from '@/lib/wallet-activity-predictor';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, walletAddress, history, timeHorizonDays } = body;

    switch (action) {
      case 'add_history':
        if (!walletAddress || !history) {
          return NextResponse.json(
            { success: false, message: 'walletAddress and history are required' },
            { status: 400 }
          );
        }
        walletActivityPredictor.addHistory(walletAddress, history);
        return NextResponse.json({ success: true });

      case 'predict':
        if (!walletAddress) {
          return NextResponse.json(
            { success: false, message: 'walletAddress is required' },
            { status: 400 }
          );
        }
        const prediction = walletActivityPredictor.predictActivity(
          walletAddress,
          timeHorizonDays || 7
        );
        return NextResponse.json({ success: true, data: prediction });

      case 'get_history':
        if (!walletAddress) {
          return NextResponse.json(
            { success: false, message: 'walletAddress is required' },
            { status: 400 }
          );
        }
        const activityHistory = walletActivityPredictor.getHistory(walletAddress);
        return NextResponse.json({ success: true, data: activityHistory });

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Activity prediction error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

