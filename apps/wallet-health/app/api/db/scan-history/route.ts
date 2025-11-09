import { NextRequest, NextResponse } from 'next/server';
import { getScanHistory, getLatestScan } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('walletAddress');
    const limit = parseInt(searchParams.get('limit') || '10');
    const latest = searchParams.get('latest') === 'true';

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    let data;
    
    if (latest) {
      // Get only the latest scan
      data = await getLatestScan(walletAddress.toLowerCase());
    } else {
      // Get scan history
      data = await getScanHistory(walletAddress.toLowerCase(), limit);
    }

    return NextResponse.json({
      success: true,
      data,
      count: Array.isArray(data) ? data.length : (data ? 1 : 0),
    });
  } catch (error: any) {
    console.error('Error fetching scan history:', error.message);
    return NextResponse.json(
      { 
        error: 'Failed to fetch scan history',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

