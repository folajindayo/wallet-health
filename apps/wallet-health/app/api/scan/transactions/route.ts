import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const GOLDRUSH_API_KEY = process.env.GOLDRUSH_API_KEY;
const GOLDRUSH_BASE_URL = 'https://api.covalenthq.com/v1';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, chainId, limit = 10 } = await request.json();

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

    // Fetch recent transactions from GoldRush API
    const url = `${GOLDRUSH_BASE_URL}/${chainId}/address/${walletAddress}/transactions_v3/`;
    
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${GOLDRUSH_API_KEY}`,
      },
      params: {
        'page-size': limit,
      },
    });

    const items = response.data.data?.items || [];

    // Transform the data to our format
    const transformedTransactions = items.map((tx: any) => ({
      hash: tx.tx_hash,
      blockHeight: tx.block_height,
      timestamp: tx.block_signed_at,
      from: tx.from_address,
      to: tx.to_address,
      value: tx.value,
      gasSpent: tx.gas_spent,
      gasPrice: tx.gas_price,
      successful: tx.successful,
      method: tx.log_events?.[0]?.decoded?.name || 'Transfer',
    }));

    return NextResponse.json({
      success: true,
      data: transformedTransactions,
      count: transformedTransactions.length,
    });
  } catch (error: any) {
    console.error('Error fetching transactions:', error.message);
    return NextResponse.json(
      { 
        error: 'Failed to fetch transactions',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

