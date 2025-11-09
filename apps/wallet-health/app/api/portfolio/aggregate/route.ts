import { NextRequest, NextResponse } from 'next/server';
import { multiChainPortfolioAggregator } from '@/lib/multi-chain-portfolio-aggregator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, chainPortfolios, action, aggregated } = body;

    if (action === 'aggregate') {
      if (!walletAddress || !chainPortfolios || !Array.isArray(chainPortfolios)) {
        return NextResponse.json(
          { error: 'Wallet address and chain portfolios array are required' },
          { status: 400 }
        );
      }

      const aggregated = multiChainPortfolioAggregator.aggregatePortfolio(
        walletAddress,
        chainPortfolios
      );
      return NextResponse.json({
        success: true,
        data: aggregated,
      });
    }

    if (action === 'token-totals') {
      if (!chainPortfolios || !Array.isArray(chainPortfolios)) {
        return NextResponse.json(
          { error: 'Chain portfolios array is required' },
          { status: 400 }
        );
      }

      const totals = multiChainPortfolioAggregator.calculateCrossChainTokenTotals(
        chainPortfolios
      );
      return NextResponse.json({
        success: true,
        data: { totals: Object.fromEntries(totals) },
      });
    }

    if (action === 'recommendations') {
      if (!aggregated) {
        return NextResponse.json(
          { error: 'Aggregated portfolio is required' },
          { status: 400 }
        );
      }

      const recommendations = multiChainPortfolioAggregator.getChainAllocationRecommendations(
        aggregated
      );
      return NextResponse.json({
        success: true,
        data: { recommendations },
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error aggregating portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to aggregate portfolio', message: error.message },
      { status: 500 }
    );
  }
}

