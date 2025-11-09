import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const GOLDRUSH_API_KEY = process.env.GOLDRUSH_API_KEY;
const GOLDRUSH_BASE_URL = 'https://api.covalenthq.com/v1';

// Etherscan API endpoints for verification (as fallback)
const ETHERSCAN_API_URLS: Record<number, string> = {
  1: 'https://api.etherscan.io/api',
  56: 'https://api.bscscan.com/api',
  137: 'https://api.polygonscan.com/api',
  8453: 'https://api.basescan.org/api',
  42161: 'https://api.arbiscan.io/api',
};

export async function POST(request: NextRequest) {
  try {
    const { contractAddress, chainId } = await request.json();

    if (!contractAddress || !chainId) {
      return NextResponse.json(
        { error: 'Contract address and chain ID are required' },
        { status: 400 }
      );
    }

    if (!GOLDRUSH_API_KEY) {
      return NextResponse.json(
        { error: 'GoldRush API key not configured' },
        { status: 500 }
      );
    }

    // Try to get contract metadata from GoldRush
    const url = `${GOLDRUSH_BASE_URL}/${chainId}/tokens/${contractAddress}/token_holders_v2/`;
    
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${GOLDRUSH_API_KEY}`,
        },
      });

      const contractData = response.data.data?.items?.[0];
      
      if (contractData) {
        return NextResponse.json({
          success: true,
          data: {
            isVerified: true,
            contractAddress,
            name: contractData.contract_name,
            symbol: contractData.contract_ticker_symbol,
            createdAt: null, // GoldRush doesn't provide this
            holderCount: response.data.data?.pagination?.total_count || 0,
          },
        });
      }
    } catch (error) {
      // If GoldRush fails, continue to fallback
      console.log('GoldRush check failed, trying fallback');
    }

    // Fallback: Basic verification check (simplified)
    // In production, you'd want to use actual blockchain explorer APIs with API keys
    return NextResponse.json({
      success: true,
      data: {
        isVerified: false,
        contractAddress,
        name: 'Unknown',
        symbol: 'Unknown',
        createdAt: null,
        holderCount: 0,
      },
    });
  } catch (error: any) {
    console.error('Error checking contract:', error.message);
    return NextResponse.json(
      { 
        error: 'Failed to check contract',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

