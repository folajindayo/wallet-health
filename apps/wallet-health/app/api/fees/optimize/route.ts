import { NextRequest, NextResponse } from 'next/server';
import { transactionFeeOptimizer } from '@/lib/transaction-fee-optimizer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chainId, gasEstimate, urgency, currentGasPrice, transactionType, chains, transactionCount, gasPerTransaction, valueUSD } = body;

    if (body.action === 'optimize') {
      if (!chainId || !gasEstimate) {
        return NextResponse.json(
          { error: 'Chain ID and gas estimate are required' },
          { status: 400 }
        );
      }

      const optimization = transactionFeeOptimizer.optimizeFee(
        chainId,
        gasEstimate,
        urgency || 'medium',
        currentGasPrice
      );
      return NextResponse.json({
        success: true,
        data: optimization,
      });
    }

    if (body.action === 'compare-chains') {
      if (!transactionType) {
        return NextResponse.json(
          { error: 'Transaction type is required' },
          { status: 400 }
        );
      }

      const comparison = transactionFeeOptimizer.compareCrossChainFees(
        transactionType,
        gasEstimate || 0,
        chains
      );
      return NextResponse.json({
        success: true,
        data: comparison,
      });
    }

    if (body.action === 'batch-savings') {
      if (!chainId || !transactionCount || !gasPerTransaction) {
        return NextResponse.json(
          { error: 'Chain ID, transaction count, and gas per transaction are required' },
          { status: 400 }
        );
      }

      const savings = transactionFeeOptimizer.estimateBatchSavings(
        chainId,
        transactionCount,
        gasPerTransaction
      );
      return NextResponse.json({
        success: true,
        data: savings,
      });
    }

    if (body.action === 'recommend-chain') {
      if (!transactionType) {
        return NextResponse.json(
          { error: 'Transaction type is required' },
          { status: 400 }
        );
      }

      const recommendation = transactionFeeOptimizer.recommendOptimalChain(
        transactionType,
        urgency || 'medium',
        valueUSD
      );
      return NextResponse.json({
        success: true,
        data: recommendation,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error optimizing fees:', error);
    return NextResponse.json(
      { error: 'Failed to optimize fees', message: error.message },
      { status: 500 }
    );
  }
}

