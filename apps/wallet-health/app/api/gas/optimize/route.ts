import { NextRequest, NextResponse } from 'next/server';
import { gasOptimizer } from '@/lib/gas-optimizer';
import { gasTracker } from '@/lib/gas-tracker';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chainId, urgency, gasEstimate, action } = body;

    if (!chainId) {
      return NextResponse.json(
        { error: 'Chain ID is required' },
        { status: 400 }
      );
    }

    // Record current gas price
    const currentGas = await gasTracker.getGasPrice(chainId);
    if (currentGas) {
      gasOptimizer.recordGasPrice(chainId, currentGas);
    }

    if (action === 'recommend') {
      const recommendation = gasOptimizer.getOptimizationRecommendation(
        chainId,
        urgency || 'medium',
        gasEstimate || 21000
      );

      return NextResponse.json({
        success: true,
        data: recommendation,
      });
    }

    if (action === 'predict') {
      const { targetTime } = body;
      if (!targetTime) {
        return NextResponse.json(
          { error: 'Target time is required' },
          { status: 400 }
        );
      }

      const prediction = gasOptimizer.predictGasPrice(chainId, targetTime);
      return NextResponse.json({
        success: true,
        data: { prediction },
      });
    }

    if (action === 'patterns') {
      const patterns = gasOptimizer.analyzeGasPatterns(chainId);
      return NextResponse.json({
        success: true,
        data: { patterns },
      });
    }

    if (action === 'stats') {
      const hours = body.hours ? parseInt(body.hours) : 24;
      const stats = gasOptimizer.getGasStatistics(chainId, hours);
      return NextResponse.json({
        success: true,
        data: stats,
      });
    }

    // Default: get recommendation
    const recommendation = gasOptimizer.getOptimizationRecommendation(
      chainId,
      urgency || 'medium',
      gasEstimate || 21000
    );

    return NextResponse.json({
      success: true,
      data: recommendation,
    });
  } catch (error: any) {
    console.error('Error optimizing gas:', error);
    return NextResponse.json(
      { error: 'Failed to optimize gas', message: error.message },
      { status: 500 }
    );
  }
}

