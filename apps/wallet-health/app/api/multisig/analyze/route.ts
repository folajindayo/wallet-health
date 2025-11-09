import { NextRequest, NextResponse } from 'next/server';
import { multisigAnalyzer } from '@/lib/multisig-analyzer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet, transactions, compare } = body;

    if (compare && Array.isArray(compare)) {
      // Compare multiple multisig wallets
      const analyses = await Promise.all(
        compare.map((w: any) => multisigAnalyzer.analyzeMultisig(w))
      );
      const comparison = multisigAnalyzer.compareMultisigs(analyses);
      
      return NextResponse.json({
        success: true,
        data: {
          analyses,
          comparison,
        },
      });
    }

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet configuration is required' },
        { status: 400 }
      );
    }

    // Analyze single multisig wallet
    const analysis = await multisigAnalyzer.analyzeMultisig(wallet);

    // Analyze pending transactions if provided
    let pendingAnalysis = null;
    if (transactions && Array.isArray(transactions)) {
      pendingAnalysis = await multisigAnalyzer.analyzePendingTransactions(
        wallet,
        transactions
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        analysis,
        pendingTransactions: pendingAnalysis,
      },
    });
  } catch (error: any) {
    console.error('Error analyzing multisig:', error);
    return NextResponse.json(
      { error: 'Failed to analyze multisig wallet', message: error.message },
      { status: 500 }
    );
  }
}

