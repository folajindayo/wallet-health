import { NextRequest, NextResponse } from 'next/server';
import { mevProtectionAnalyzer } from '@/lib/mev-protection-analyzer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transaction, transactions, action, chainId, transactionType, valueUSD } = body;

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

      const analysis = mevProtectionAnalyzer.analyzeTransactions(transactions);
      return NextResponse.json({
        success: true,
        data: analysis,
      });
    }

    if (action === 'strategies') {
      if (!chainId) {
        return NextResponse.json(
          { error: 'Chain ID is required' },
          { status: 400 }
        );
      }

      const strategies = mevProtectionAnalyzer.getProtectionStrategies(chainId);
      return NextResponse.json({
        success: true,
        data: { strategies },
      });
    }

    if (action === 'recommend') {
      if (!chainId || !transactionType) {
        return NextResponse.json(
          { error: 'Chain ID and transaction type are required' },
          { status: 400 }
        );
      }

      const recommendation = mevProtectionAnalyzer.recommendProtection(
        chainId,
        transactionType,
        valueUSD
      );

      return NextResponse.json({
        success: true,
        data: { recommendation },
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
