import { NextRequest, NextResponse } from 'next/server';
import { compareWallets } from '@/lib/wallet-monitor';
import type { TokenApproval, TokenInfo } from '@wallet-health/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet1, wallet2 } = body;

    if (!wallet1 || !wallet2) {
      return NextResponse.json(
        { error: 'Both wallet1 and wallet2 are required' },
        { status: 400 }
      );
    }

    const comparison = compareWallets(
      {
        address: wallet1.address,
        approvals: wallet1.approvals || [],
        tokens: wallet1.tokens || [],
      },
      {
        address: wallet2.address,
        approvals: wallet2.approvals || [],
        tokens: wallet2.tokens || [],
      }
    );

    // Calculate similarity score
    const totalApprovals = wallet1.approvals.length + wallet2.approvals.length;
    const totalTokens = wallet1.tokens.length + wallet2.tokens.length;
    
    const approvalSimilarity = totalApprovals > 0
      ? (comparison.commonApprovals.length * 2) / totalApprovals
      : 0;
    
    const tokenSimilarity = totalTokens > 0
      ? (comparison.commonTokens.length * 2) / totalTokens
      : 0;

    const overallSimilarity = (approvalSimilarity + tokenSimilarity) / 2;

    return NextResponse.json({
      success: true,
      data: {
        comparison,
        similarity: {
          approvalSimilarity: Math.round(approvalSimilarity * 100),
          tokenSimilarity: Math.round(tokenSimilarity * 100),
          overallSimilarity: Math.round(overallSimilarity * 100),
        },
      },
    });
  } catch (error: any) {
    console.error('Error comparing wallets:', error);
    return NextResponse.json(
      { error: 'Failed to compare wallets', message: error.message },
      { status: 500 }
    );
  }
}

