/**
 * Approvals API Route
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { error: 'Address is required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://api.covalenthq.com/v1/eth-mainnet/approvals/${address}/`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.GOLDRUSH_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch approvals');
    }

    const data = await response.json();
    return NextResponse.json(data.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

