import { NextRequest, NextResponse } from 'next/server';
import { watchlistManager } from '@/lib/watchlist-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = searchParams.get('id');

    if (action === 'get' && id) {
      const watchlist = watchlistManager.getWatchlist(id);
      return NextResponse.json({
        success: true,
        data: { watchlist },
      });
    }

    if (action === 'search') {
      const name = searchParams.get('name') || undefined;
      const tags = searchParams.get('tags')?.split(',');
      const walletAddress = searchParams.get('walletAddress') || undefined;

      const results = watchlistManager.searchWatchlists({
        name,
        tags,
        walletAddress,
      });

      return NextResponse.json({
        success: true,
        data: { watchlists: results },
      });
    }

    if (action === 'alerts' && id) {
      const unacknowledgedOnly = searchParams.get('unacknowledgedOnly') === 'true';
      const severity = searchParams.get('severity')?.split(',') as any;
      const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

      const alerts = watchlistManager.getAlerts(id, {
        unacknowledgedOnly,
        severity,
        limit,
      });

      return NextResponse.json({
        success: true,
        data: { alerts },
      });
    }

    if (action === 'stats' && id) {
      const stats = watchlistManager.getWatchlistStats(id);
      return NextResponse.json({
        success: true,
        data: stats,
      });
    }

    // Default: get all
    const watchlists = watchlistManager.getAllWatchlists();
    return NextResponse.json({
      success: true,
      data: { watchlists },
    });
  } catch (error: any) {
    console.error('Error fetching watchlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch watchlist', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, watchlist, id, updates, walletAddress, watchlistId, alert, alertId, group } = body;

    if (action === 'create') {
      if (!watchlist) {
        return NextResponse.json(
          { error: 'Watchlist is required' },
          { status: 400 }
        );
      }

      const created = watchlistManager.createWatchlist(watchlist);
      return NextResponse.json({
        success: true,
        data: { watchlist: created },
      });
    }

    if (action === 'update') {
      if (!id || !updates) {
        return NextResponse.json(
          { error: 'ID and updates are required' },
          { status: 400 }
        );
      }

      const updated = watchlistManager.updateWatchlist(id, updates);
      return NextResponse.json({
        success: updated,
        data: { updated },
      });
    }

    if (action === 'delete') {
      if (!id) {
        return NextResponse.json(
          { error: 'ID is required' },
          { status: 400 }
        );
      }

      const deleted = watchlistManager.deleteWatchlist(id);
      return NextResponse.json({
        success: deleted,
        data: { deleted },
      });
    }

    if (action === 'add-wallet') {
      if (!watchlistId || !walletAddress) {
        return NextResponse.json(
          { error: 'Watchlist ID and wallet address are required' },
          { status: 400 }
        );
      }

      const added = watchlistManager.addWalletToWatchlist(watchlistId, walletAddress);
      return NextResponse.json({
        success: added,
        data: { added },
      });
    }

    if (action === 'remove-wallet') {
      if (!watchlistId || !walletAddress) {
        return NextResponse.json(
          { error: 'Watchlist ID and wallet address are required' },
          { status: 400 }
        );
      }

      const removed = watchlistManager.removeWalletFromWatchlist(watchlistId, walletAddress);
      return NextResponse.json({
        success: removed,
        data: { removed },
      });
    }

    if (action === 'add-alert') {
      if (!watchlistId || !alert) {
        return NextResponse.json(
          { error: 'Watchlist ID and alert are required' },
          { status: 400 }
        );
      }

      const createdAlert = watchlistManager.addAlert(watchlistId, alert);
      return NextResponse.json({
        success: true,
        data: { alert: createdAlert },
      });
    }

    if (action === 'acknowledge-alert') {
      if (!watchlistId || !alertId) {
        return NextResponse.json(
          { error: 'Watchlist ID and alert ID are required' },
          { status: 400 }
        );
      }

      const acknowledged = watchlistManager.acknowledgeAlert(watchlistId, alertId);
      return NextResponse.json({
        success: acknowledged,
        data: { acknowledged },
      });
    }

    if (action === 'create-group') {
      if (!group) {
        return NextResponse.json(
          { error: 'Group is required' },
          { status: 400 }
        );
      }

      const createdGroup = watchlistManager.createGroup(group);
      return NextResponse.json({
        success: true,
        data: { group: createdGroup },
      });
    }

    if (action === 'get-groups') {
      const groups = watchlistManager.getAllGroups();
      return NextResponse.json({
        success: true,
        data: { groups },
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error processing watchlist:', error);
    return NextResponse.json(
      { error: 'Failed to process watchlist', message: error.message },
      { status: 500 }
    );
  }
}

