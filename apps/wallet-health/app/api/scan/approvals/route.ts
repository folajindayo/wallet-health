import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const GOLDRUSH_API_KEY = process.env.GOLDRUSH_API_KEY;
const GOLDRUSH_BASE_URL = 'https://api.covalenthq.com/v1';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, chainId } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    if (!GOLDRUSH_API_KEY) {
      return NextResponse.json(
        { error: 'GoldRush API key not configured' },
        { status: 500 }
      );
    }

    // Fetch token approvals from GoldRush API
    // Using the approvals endpoint
    const url = `${GOLDRUSH_BASE_URL}/${chainId}/approvals/${walletAddress}/`;
    
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${GOLDRUSH_API_KEY}`,
      },
    });

    const approvals = response.data.data?.items || [];

    // Transform the data to our format
    const transformedApprovals = approvals.map((approval: any) => {
      const allowance = approval.value || '0';
      const isUnlimited = 
        allowance === '115792089237316195423570985008687907853269984665640564039457584007913129639935' ||
        BigInt(allowance) > BigInt('1000000000000000000000000000');

      return {
        token: approval.token_address,
        tokenSymbol: approval.token_ticker_symbol || 'Unknown',
        tokenName: approval.token_name || 'Unknown Token',
        spender: approval.spender_address,
        spenderName: approval.spender_name || 'Unknown',
        allowance,
        isUnlimited,
        isRisky: false, // Will be determined by risk analysis
        lastUpdated: approval.block_signed_at,
        blockHeight: approval.block_height,
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedApprovals,
      count: transformedApprovals.length,
    });
  } catch (error: any) {
    console.error('Error fetching approvals:', error.message);
    return NextResponse.json(
      { 
        error: 'Failed to fetch approvals',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

