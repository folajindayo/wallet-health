import { NextRequest, NextResponse } from 'next/server';
import { walletReputationSystem } from '@/lib/wallet-reputation-system';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, data, wallet1, wallet2, action, limit } = body;

    if (action === 'calculate') {
      if (!walletAddress || !data) {
        return NextResponse.json(
          { error: 'Wallet address and data are required' },
          { status: 400 }
        );
      }

      const score = walletReputationSystem.calculateScore(walletAddress, data);
      return NextResponse.json({
        success: true,
        data: score,
      });
    }

    if (action === 'get') {
      if (!walletAddress) {
        return NextResponse.json(
          { error: 'Wallet address is required' },
          { status: 400 }
        );
      }

      const score = walletReputationSystem.getScore(walletAddress);
      return NextResponse.json({
        success: true,
        data: { score },
      });
    }

    if (action === 'history') {
      if (!walletAddress) {
        return NextResponse.json(
          { error: 'Wallet address is required' },
          { status: 400 }
        );
      }

      const history = walletReputationSystem.getHistory(walletAddress);
      return NextResponse.json({
        success: true,
        data: history,
      });
    }

    if (action === 'compare') {
      if (!wallet1 || !wallet2) {
        return NextResponse.json(
          { error: 'Both wallet addresses are required' },
          { status: 400 }
        );
      }

      const comparison = walletReputationSystem.compareWallets(wallet1, wallet2);
      return NextResponse.json({
        success: true,
        data: comparison,
      });
    }

    if (action === 'top') {
      const top = walletReputationSystem.getTopWallets(limit || 10);
      return NextResponse.json({
        success: true,
        data: { wallets: top },
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error processing reputation:', error);
    return NextResponse.json(
      { error: 'Failed to process reputation', message: error.message },
      { status: 500 }
    );
  }
}

