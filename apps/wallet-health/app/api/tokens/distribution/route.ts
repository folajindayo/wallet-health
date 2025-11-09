import { NextRequest, NextResponse } from 'next/server';
import { tokenDistributionAnalyzer } from '@/lib/token-distribution-analyzer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokenAddress, tokenSymbol, totalSupply, holders, distribution1, distribution2, action } = body;

    if (action === 'analyze') {
      if (!tokenAddress || !tokenSymbol || !totalSupply || !holders) {
        return NextResponse.json(
          { error: 'Token address, symbol, total supply, and holders are required' },
          { status: 400 }
        );
      }

      const distribution = tokenDistributionAnalyzer.analyzeDistribution(
        tokenAddress,
        tokenSymbol,
        totalSupply,
        holders
      );
      return NextResponse.json({
        success: true,
        data: distribution,
      });
    }

    if (action === 'compare') {
      if (!distribution1 || !distribution2) {
        return NextResponse.json(
          { error: 'Both distributions are required' },
          { status: 400 }
        );
      }

      const comparison = tokenDistributionAnalyzer.compareDistributions(distribution1, distribution2);
      return NextResponse.json({
        success: true,
        data: comparison,
      });
    }

    if (action === 'health-score') {
      if (!distribution1) {
        return NextResponse.json(
          { error: 'Distribution is required' },
          { status: 400 }
        );
      }

      const score = tokenDistributionAnalyzer.getDistributionHealthScore(distribution1);
      return NextResponse.json({
        success: true,
        data: { healthScore: score },
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error analyzing token distribution:', error);
    return NextResponse.json(
      { error: 'Failed to analyze token distribution', message: error.message },
      { status: 500 }
    );
  }
}

