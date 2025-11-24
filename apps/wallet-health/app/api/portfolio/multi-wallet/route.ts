import { NextRequest, NextResponse } from 'next/server';
import { multiWalletPortfolioManager } from '@/lib/multi-wallet-portfolio-manager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, portfolio, address, addresses, groupName, walletAddresses } = body;

    switch (action) {
      case 'add_wallet':
        if (!portfolio) {
          return NextResponse.json(
            { success: false, message: 'portfolio is required' },
            { status: 400 }
          );
        }
        multiWalletPortfolioManager.addWallet(portfolio);
        return NextResponse.json({ success: true });

      case 'remove_wallet':
        if (!address) {
          return NextResponse.json(
            { success: false, message: 'address is required' },
            { status: 400 }
          );
        }
        const removed = multiWalletPortfolioManager.removeWallet(address);
        return NextResponse.json({ success: true, data: { removed } });

      case 'get_summary':
        const summary = multiWalletPortfolioManager.getSummary(addresses);
        return NextResponse.json({ success: true, data: summary });

      case 'compare':
        if (!addresses || addresses.length < 2) {
          return NextResponse.json(
            { success: false, message: 'At least 2 addresses are required' },
            { status: 400 }
          );
        }
        const comparison = multiWalletPortfolioManager.compareWallets(addresses);
        return NextResponse.json({ success: true, data: comparison });

      case 'create_group':
        if (!groupName || !walletAddresses) {
          return NextResponse.json(
            { success: false, message: 'groupName and walletAddresses are required' },
            { status: 400 }
          );
        }
        multiWalletPortfolioManager.createGroup(groupName, walletAddresses);
        return NextResponse.json({ success: true });

      case 'get_groups':
        const groups = multiWalletPortfolioManager.getGroups();
        return NextResponse.json({ success: true, data: groups });

      case 'export':
        const exportData = multiWalletPortfolioManager.exportPortfolio(addresses);
        return NextResponse.json({ success: true, data: exportData });

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Multi-wallet portfolio error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');
    const addresses = searchParams.get('addresses')?.split(',');

    if (address) {
      const wallet = multiWalletPortfolioManager.getWallet(address);
      return NextResponse.json({ success: true, data: wallet });
    }

    if (addresses) {
      const summary = multiWalletPortfolioManager.getSummary(addresses);
      return NextResponse.json({ success: true, data: summary });
    }

    const allWallets = multiWalletPortfolioManager.getAllWallets();
    return NextResponse.json({ success: true, data: allWallets });
  } catch (error: any) {
    console.error('Multi-wallet portfolio error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

