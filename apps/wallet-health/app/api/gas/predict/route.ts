import { NextRequest, NextResponse } from 'next/server';
import { gasPricePredictor } from '@/lib/gas-price-predictor';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chainId, prices, urgency, timeHorizon, maxWaitMinutes, action } = body;

    if (action === 'add-data') {
      if (!chainId || !prices) {
        return NextResponse.json(
          { error: 'Chain ID and prices are required' },
          { status: 400 }
        );
      }

      gasPricePredictor.addDataPoint(chainId, prices);
      return NextResponse.json({
        success: true,
        data: { message: 'Data point added' },
      });
    }

    if (action === 'predict') {
      if (!chainId) {
        return NextResponse.json(
          { error: 'Chain ID is required' },
          { status: 400 }
        );
      }

      const prediction = gasPricePredictor.predict(
        chainId,
        urgency || 'medium',
        timeHorizon || '1h'
      );
      return NextResponse.json({
        success: true,
        data: prediction,
      });
    }

    if (action === 'optimal') {
      if (!chainId || urgency === undefined) {
        return NextResponse.json(
          { error: 'Chain ID and urgency are required' },
          { status: 400 }
        );
      }

      const optimal = gasPricePredictor.getOptimalPrice(
        chainId,
        urgency,
        maxWaitMinutes
      );
      return NextResponse.json({
        success: true,
        data: optimal,
      });
    }

    if (action === 'history') {
      if (!chainId) {
        return NextResponse.json(
          { error: 'Chain ID is required' },
          { status: 400 }
        );
      }

      const history = gasPricePredictor.getHistory(chainId, body.limit);
      return NextResponse.json({
        success: true,
        data: { history },
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error predicting gas prices:', error);
    return NextResponse.json(
      { error: 'Failed to predict gas prices', message: error.message },
      { status: 500 }
    );
  }
}

