import { NextRequest, NextResponse } from 'next/server';
import { mevProtectionAnalyzer } from '@/lib/mev-protection-analyzer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transaction, transactions, action } = body;

    if (action === 'analyze') {
      if (!transaction) {
        return NextResponse.json(
          { error: 'Transaction is required' },
          { status: 400 }
        );
      }

      const analysis = mevProtectionAnalyzer.analyzeTransaction(transaction);
      return NextResponse.json({
        success: true,
        data: analysis,
      });
    }

    if (action === 'analyze-batch') {
      if (!transactions || !Array.isArray(transactions)) {
        return NextResponse.json(
          { error: 'Transactions array is required' },
          { status: 400 }
        );
      }

      const result = mevProtectionAnalyzer.analyzeTransactions(transactions);
      const recommendations = mevProtectionAnalyzer.getProtectionRecommendations(result.stats);

      return NextResponse.json({
        success: true,
        data: {
          ...result,
          recommendations,
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error analyzing MEV protection:', error);
    return NextResponse.json(
      { error: 'Failed to analyze MEV protection', message: error.message },
      { status: 500 }
    );
  }
}

