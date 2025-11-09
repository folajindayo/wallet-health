import { NextRequest, NextResponse } from 'next/server';
import { portfolioRebalancingAssistant } from '@/lib/portfolio-rebalancing-assistant';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, walletAddress, positions, targetAllocation, strategy, rebalanceThreshold, riskProfile, preferredTokens, maxPositions } = body;

    switch (action) {
      case 'generate_plan':
        if (!walletAddress || !positions) {
          return NextResponse.json(
            { success: false, message: 'walletAddress and positions are required' },
            { status: 400 }
          );
        }
        const plan = portfolioRebalancingAssistant.generatePlan({
          walletAddress,
          positions,
          targetAllocation,
          strategy,
          rebalanceThreshold,
        });
        return NextResponse.json({ success: true, data: plan });

      case 'generate_target_allocation':
        const allocation = portfolioRebalancingAssistant.generateTargetAllocation({
          riskProfile: riskProfile || 'moderate',
          preferredTokens,
          maxPositions,
        });
        return NextResponse.json({ success: true, data: allocation });

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Portfolio rebalancing error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

