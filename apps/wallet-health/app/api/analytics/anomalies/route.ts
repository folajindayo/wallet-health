import { NextRequest, NextResponse } from 'next/server';
import { anomalyDetectionEngine } from '@/lib/anomaly-detection-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, transactions, approvals, tokens } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, message: 'walletAddress is required' },
        { status: 400 }
      );
    }

    const result = anomalyDetectionEngine.detectAnomalies({
      walletAddress,
      transactions: transactions || [],
      approvals: approvals || [],
      tokens: tokens || [],
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Anomaly detection error:', error);
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

    const profile = anomalyDetectionEngine.getBehaviorProfile(walletAddress);
    return NextResponse.json({ success: true, data: profile });
  } catch (error: any) {
    console.error('Anomaly detection error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

