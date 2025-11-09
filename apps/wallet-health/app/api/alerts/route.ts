import { NextRequest, NextResponse } from 'next/server';
import { alertManager } from '@/lib/alert-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const unacknowledgedOnly = searchParams.get('unacknowledgedOnly') === 'true';
    const severity = searchParams.get('severity')?.split(',') as any;
    const type = searchParams.get('type')?.split(',') as any;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const since = searchParams.get('since') ? parseInt(searchParams.get('since')!) : undefined;

    const alerts = alertManager.getAlerts(walletAddress, {
      unacknowledgedOnly,
      severity,
      type,
      limit,
      since,
    });

    const stats = alertManager.getAlertStats(walletAddress);

    return NextResponse.json({
      success: true,
      data: {
        alerts,
        stats,
      },
    });
  } catch (error: any) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, alertId, action } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    if (action === 'acknowledge' && alertId) {
      const acknowledged = alertManager.acknowledgeAlert(walletAddress, alertId);
      return NextResponse.json({
        success: acknowledged,
        data: { acknowledged },
      });
    }

    if (action === 'create') {
      const alert = await alertManager.createAlert(body);
      return NextResponse.json({
        success: true,
        data: { alert },
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error processing alert:', error);
    return NextResponse.json(
      { error: 'Failed to process alert', message: error.message },
      { status: 500 }
    );
  }
}

