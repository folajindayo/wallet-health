import { NextRequest, NextResponse } from 'next/server';
import { transactionPatternDetector } from '@/lib/transaction-pattern-detector';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, transactions, options } = body;

    if (!walletAddress || !transactions || !Array.isArray(transactions)) {
      return NextResponse.json(
        { success: false, message: 'walletAddress and transactions array are required' },
        { status: 400 }
      );
    }

    const analysis = transactionPatternDetector.analyzePatterns(
      transactions,
      walletAddress,
      options
    );

    return NextResponse.json({ success: true, data: analysis });
  } catch (error: any) {
    console.error('Pattern detection error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

