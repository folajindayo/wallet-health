import { NextRequest, NextResponse } from 'next/server';
import { tokenPriceTracker } from '@/lib/token-price-tracker';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenAddress = searchParams.get('tokenAddress');
    const chainId = searchParams.get('chainId');
    const action = searchParams.get('action');

    if (!tokenAddress || !chainId) {
      return NextResponse.json(
        { error: 'Token address and chain ID are required' },
        { status: 400 }
      );
    }

    if (action === 'history') {
      const hours = searchParams.get('hours') ? parseInt(searchParams.get('hours')!) : 24;
      const history = tokenPriceTracker.getPriceHistory(
        tokenAddress,
        parseInt(chainId),
        hours
      );

      return NextResponse.json({
        success: true,
        data: { history },
      });
    }

    if (action === 'predict') {
      const timeframe = (searchParams.get('timeframe') || '24h') as '1h' | '24h' | '7d';
      const prediction = tokenPriceTracker.predictPrice(
        tokenAddress,
        parseInt(chainId),
        timeframe
      );

      return NextResponse.json({
        success: true,
        data: { prediction },
      });
    }

    // Default: get current price
    const price = await tokenPriceTracker.getPrice(tokenAddress, parseInt(chainId));
    return NextResponse.json({
      success: true,
      data: { price },
    });
  } catch (error: any) {
    console.error('Error fetching token price:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token price', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, walletAddress, tokens, alert } = body;

    if (action === 'portfolio') {
      if (!walletAddress || !tokens) {
        return NextResponse.json(
          { error: 'Wallet address and tokens are required' },
          { status: 400 }
        );
      }

      const portfolioValue = await tokenPriceTracker.calculatePortfolioValue(
        walletAddress,
        tokens
      );

      return NextResponse.json({
        success: true,
        data: portfolioValue,
      });
    }

    if (action === 'batch') {
      if (!tokens || !Array.isArray(tokens)) {
        return NextResponse.json(
          { error: 'Tokens array is required' },
          { status: 400 }
        );
      }

      const prices = await tokenPriceTracker.getPrices(tokens);
      return NextResponse.json({
        success: true,
        data: { prices: Object.fromEntries(prices) },
      });
    }

    if (action === 'alert') {
      if (!walletAddress || !alert) {
        return NextResponse.json(
          { error: 'Wallet address and alert are required' },
          { status: 400 }
        );
      }

      const createdAlert = tokenPriceTracker.createAlert(walletAddress, alert);
      return NextResponse.json({
        success: true,
        data: { alert: createdAlert },
      });
    }

    if (action === 'check-alerts') {
      if (!walletAddress) {
        return NextResponse.json(
          { error: 'Wallet address is required' },
          { status: 400 }
        );
      }

      const triggered = await tokenPriceTracker.checkAlerts(walletAddress);
      return NextResponse.json({
        success: true,
        data: { triggered },
      });
    }

    if (action === 'get-alerts') {
      if (!walletAddress) {
        return NextResponse.json(
          { error: 'Wallet address is required' },
          { status: 400 }
        );
      }

      const activeOnly = body.activeOnly !== false;
      const alerts = tokenPriceTracker.getAlerts(walletAddress, activeOnly);
      return NextResponse.json({
        success: true,
        data: { alerts },
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error processing price request:', error);
    return NextResponse.json(
      { error: 'Failed to process price request', message: error.message },
      { status: 500 }
    );
  }
}

