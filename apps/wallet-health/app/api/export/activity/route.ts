import { NextRequest, NextResponse } from 'next/server';
import { walletActivityExporter } from '@/lib/wallet-activity-exporter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, data, options, action } = body;

    if (!walletAddress || !data || !options) {
      return NextResponse.json(
        { error: 'Wallet address, data, and options are required' },
        { status: 400 }
      );
    }

    if (action === 'export') {
      const result = await walletActivityExporter.exportWalletData(
        walletAddress,
        data,
        options
      );
      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    if (action === 'summary') {
      const summary = walletActivityExporter.generateSummary(data, options);
      return NextResponse.json({
        success: true,
        data: summary,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error exporting activity:', error);
    return NextResponse.json(
      { error: 'Failed to export activity', message: error.message },
      { status: 500 }
    );
  }
}

