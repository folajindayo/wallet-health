import { NextRequest, NextResponse } from 'next/server';
import { transactionCostOptimizer } from '@/lib/transaction-cost-optimizer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, chainId, gasLimit, currentGasPrice, urgency, gasPriceData, transactions, chains, ethPrice } = body;

    switch (action) {
      case 'optimize':
        if (!chainId || !gasLimit || currentGasPrice === undefined) {
          return NextResponse.json(
            { success: false, message: 'chainId, gasLimit, and currentGasPrice are required' },
            { status: 400 }
          );
        }
        if (ethPrice) {
          transactionCostOptimizer.updateEthPrice(ethPrice);
        }
        const optimization = transactionCostOptimizer.optimizeCost({
          chainId,
          gasLimit,
          currentGasPrice,
          urgency: urgency || 'medium',
          gasPriceData,
        });
        return NextResponse.json({ success: true, data: optimization });

      case 'optimize_batch':
        if (!chainId || !transactions || !Array.isArray(transactions)) {
          return NextResponse.json(
            { success: false, message: 'chainId and transactions array are required' },
            { status: 400 }
          );
        }
        if (ethPrice) {
          transactionCostOptimizer.updateEthPrice(ethPrice);
        }
        const batchOptimization = transactionCostOptimizer.optimizeBatch({
          chainId,
          transactions,
          gasPrice: currentGasPrice || 30,
        });
        return NextResponse.json({ success: true, data: batchOptimization });

      case 'compare_chains':
        if (!gasLimit || !chains || !Array.isArray(chains)) {
          return NextResponse.json(
            { success: false, message: 'gasLimit and chains array are required' },
            { status: 400 }
          );
        }
        if (ethPrice) {
          transactionCostOptimizer.updateEthPrice(ethPrice);
        }
        const comparison = transactionCostOptimizer.compareChains({
          gasLimit,
          chains,
        });
        return NextResponse.json({ success: true, data: comparison });

      case 'add_gas_data':
        if (!chainId || currentGasPrice === undefined) {
          return NextResponse.json(
            { success: false, message: 'chainId and currentGasPrice are required' },
            { status: 400 }
          );
        }
        transactionCostOptimizer.addGasPriceData(chainId, currentGasPrice);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Cost optimization error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

