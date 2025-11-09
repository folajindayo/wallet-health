import { NextRequest, NextResponse } from 'next/server';
import { transactionBatchAnalyzer } from '@/lib/transaction-batch-analyzer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactions, action, batch1, batch2 } = body;

    if (!transactions || !Array.isArray(transactions)) {
      return NextResponse.json(
        { error: 'Transactions array is required' },
        { status: 400 }
      );
    }

    if (action === 'analyze') {
      const analysis = transactionBatchAnalyzer.analyzeBatch(transactions);
      return NextResponse.json({
        success: true,
        data: analysis,
      });
    }

    if (action === 'compare' && batch1 && batch2) {
      const comparison = transactionBatchAnalyzer.compareBatches(batch1, batch2);
      return NextResponse.json({
        success: true,
        data: comparison,
      });
    }

    // Default: analyze
    const analysis = transactionBatchAnalyzer.analyzeBatch(transactions);
    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    console.error('Error analyzing transaction batch:', error);
    return NextResponse.json(
      { error: 'Failed to analyze transaction batch', message: error.message },
      { status: 500 }
    );
  }
}

