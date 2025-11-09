import { NextRequest, NextResponse } from 'next/server';
import { walletComparisonTool } from '@/lib/wallet-comparison-tool';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet1, wallet2, wallets, action } = body;

    if (action === 'compare-two') {
      if (!wallet1 || !wallet2) {
        return NextResponse.json(
          { error: 'Both wallets are required' },
          { status: 400 }
        );
      }

      const comparison = walletComparisonTool.compareWallets(wallet1, wallet2);
      return NextResponse.json({
        success: true,
        data: comparison,
      });
    }

    if (action === 'compare-multiple') {
      if (!wallets || !Array.isArray(wallets) || wallets.length < 2) {
        return NextResponse.json(
          { error: 'At least 2 wallets are required' },
          { status: 400 }
        );
      }

      const comparison = walletComparisonTool.compareMultipleWallets(wallets);
      return NextResponse.json({
        success: true,
        data: comparison,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error comparing wallets:', error);
    return NextResponse.json(
      { error: 'Failed to compare wallets', message: error.message },
      { status: 500 }
    );
  }
}

