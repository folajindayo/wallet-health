import { NextRequest, NextResponse } from 'next/server';
import { calculateRiskScore } from '@/lib/risk-scorer';
import type { TokenApproval, TokenInfo } from '@wallet-health/types';

export async function POST(request: NextRequest) {
  try {
    const { approvals, tokens, hasENS = false } = await request.json();

    if (!approvals || !tokens) {
      return NextResponse.json(
        { error: 'Approvals and tokens data are required' },
        { status: 400 }
      );
    }

    // Calculate risk score
    const riskScore = calculateRiskScore(
      approvals as TokenApproval[],
      tokens as TokenInfo[],
      hasENS
    );

    return NextResponse.json({
      success: true,
      data: riskScore,
    });
  } catch (error: any) {
    console.error('Error calculating risk score:', error.message);
    return NextResponse.json(
      { 
        error: 'Failed to calculate risk score',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

