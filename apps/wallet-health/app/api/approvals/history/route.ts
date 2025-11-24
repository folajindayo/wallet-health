import { NextRequest, NextResponse } from 'next/server';
import { approvalHistoryTracker } from '@/lib/approval-history-tracker';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, entry, snapshot, action, period, options } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    if (action === 'record-entry') {
      if (!entry) {
        return NextResponse.json(
          { error: 'Entry is required' },
          { status: 400 }
        );
      }

      approvalHistoryTracker.recordEntry(walletAddress, entry);
      return NextResponse.json({
        success: true,
        data: { message: 'Entry recorded' },
      });
    }

    if (action === 'record-snapshot') {
      if (!snapshot) {
        return NextResponse.json(
          { error: 'Snapshot is required' },
          { status: 400 }
        );
      }

      approvalHistoryTracker.recordSnapshot(walletAddress, snapshot);
      return NextResponse.json({
        success: true,
        data: { message: 'Snapshot recorded' },
      });
    }

    if (action === 'trend') {
      const trend = approvalHistoryTracker.getTrend(walletAddress, period || '30d');
      return NextResponse.json({
        success: true,
        data: trend,
      });
    }

    if (action === 'patterns') {
      const patterns = approvalHistoryTracker.detectPatterns(walletAddress);
      return NextResponse.json({
        success: true,
        data: { patterns },
      });
    }

    if (action === 'history') {
      const history = approvalHistoryTracker.getHistory(walletAddress, options || {});
      return NextResponse.json({
        success: true,
        data: { history },
      });
    }

    if (action === 'snapshots') {
      const limit = body.limit ? parseInt(body.limit) : undefined;
      const snapshots = approvalHistoryTracker.getSnapshotHistory(walletAddress, limit);
      return NextResponse.json({
        success: true,
        data: { snapshots },
      });
    }

    if (action === 'compare') {
      const { snapshot1, snapshot2 } = body;
      if (!snapshot1 || !snapshot2) {
        return NextResponse.json(
          { error: 'Both snapshots are required' },
          { status: 400 }
        );
      }

      const comparison = approvalHistoryTracker.compareSnapshots(snapshot1, snapshot2);
      return NextResponse.json({
        success: true,
        data: comparison,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error processing approval history:', error);
    return NextResponse.json(
      { error: 'Failed to process approval history', message: error.message },
      { status: 500 }
    );
  }
}

