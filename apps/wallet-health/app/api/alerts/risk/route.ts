import { NextRequest, NextResponse } from 'next/server';
import { riskAlertSystem } from '@/lib/risk-alert-system';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, alert, walletAddress, alertId, alertIds, rule, data } = body;

    switch (action) {
      case 'create':
        if (!alert) {
          return NextResponse.json(
            { success: false, message: 'alert is required' },
            { status: 400 }
          );
        }
        const createdAlert = riskAlertSystem.createAlert(alert);
        return NextResponse.json({ success: true, data: createdAlert });

      case 'get_alerts':
        if (!walletAddress) {
          return NextResponse.json(
            { success: false, message: 'walletAddress is required' },
            { status: 400 }
          );
        }
        const alerts = riskAlertSystem.getAlerts(walletAddress, body.options);
        return NextResponse.json({ success: true, data: alerts });

      case 'acknowledge':
        if (!walletAddress || !alertId) {
          return NextResponse.json(
            { success: false, message: 'walletAddress and alertId are required' },
            { status: 400 }
          );
        }
        const acknowledged = riskAlertSystem.acknowledgeAlert(walletAddress, alertId);
        return NextResponse.json({ success: true, data: { acknowledged } });

      case 'resolve':
        if (!walletAddress || !alertId) {
          return NextResponse.json(
            { success: false, message: 'walletAddress and alertId are required' },
            { status: 400 }
          );
        }
        const resolved = riskAlertSystem.resolveAlert(walletAddress, alertId);
        return NextResponse.json({ success: true, data: { resolved } });

      case 'bulk_acknowledge':
        if (!walletAddress || !alertIds) {
          return NextResponse.json(
            { success: false, message: 'walletAddress and alertIds are required' },
            { status: 400 }
          );
        }
        const acknowledgedCount = riskAlertSystem.bulkAcknowledge(walletAddress, alertIds);
        return NextResponse.json({ success: true, data: { acknowledged: acknowledgedCount } });

      case 'bulk_resolve':
        if (!walletAddress || !alertIds) {
          return NextResponse.json(
            { success: false, message: 'walletAddress and alertIds are required' },
            { status: 400 }
          );
        }
        const resolvedCount = riskAlertSystem.bulkResolve(walletAddress, alertIds);
        return NextResponse.json({ success: true, data: { resolved: resolvedCount } });

      case 'get_summary':
        if (!walletAddress) {
          return NextResponse.json(
            { success: false, message: 'walletAddress is required' },
            { status: 400 }
          );
        }
        const summary = riskAlertSystem.getSummary(walletAddress);
        return NextResponse.json({ success: true, data: summary });

      case 'create_rule':
        if (!rule) {
          return NextResponse.json(
            { success: false, message: 'rule is required' },
            { status: 400 }
          );
        }
        riskAlertSystem.createRule(rule);
        return NextResponse.json({ success: true });

      case 'evaluate_rules':
        if (!walletAddress || !data) {
          return NextResponse.json(
            { success: false, message: 'walletAddress and data are required' },
            { status: 400 }
          );
        }
        const createdAlerts = riskAlertSystem.evaluateRules(walletAddress, data);
        return NextResponse.json({ success: true, data: createdAlerts });

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Risk alert error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('walletAddress');
    const unacknowledgedOnly = searchParams.get('unacknowledgedOnly') === 'true';
    const severity = searchParams.get('severity')?.split(',') as any;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, message: 'walletAddress is required' },
        { status: 400 }
      );
    }

    const alerts = riskAlertSystem.getAlerts(walletAddress, {
      unacknowledgedOnly,
      severity,
      limit,
    });

    return NextResponse.json({ success: true, data: alerts });
  } catch (error: any) {
    console.error('Risk alert error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

