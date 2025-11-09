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

    // Fetch token balances from GoldRush API
    const url = `${GOLDRUSH_BASE_URL}/${chainId}/address/${walletAddress}/balances_v2/`;
    
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${GOLDRUSH_API_KEY}`,
      },
      params: {
        'no-spam': false, // We want to see spam tokens to flag them
      },
    });

    const items = response.data.data?.items || [];

    // Transform the data to our format
    const transformedTokens = items.map((item: any) => {
      const balance = item.balance || '0';
      const decimals = item.contract_decimals || 18;
      const price = item.quote_rate || 0;
      
      // Calculate human-readable balance
      const balanceFormatted = (BigInt(balance) / BigInt(10 ** decimals)).toString();
      const value = parseFloat(balanceFormatted) * price;

      // Detect potential spam
      const isSpam = 
        item.is_spam === true ||
        (item.balance === '0' && !item.native_token) ||
        (item.contract_name?.toLowerCase().includes('visit') ||
         item.contract_name?.toLowerCase().includes('claim') ||
         item.contract_name?.toLowerCase().includes('airdrop'));

      return {
        address: item.contract_address,
        symbol: item.contract_ticker_symbol || 'Unknown',
        name: item.contract_name || 'Unknown Token',
        balance: balanceFormatted,
        decimals,
        logo: item.logo_url,
        isSpam,
        isVerified: item.is_verified || false,
        price,
        value,
        nativeToken: item.native_token || false,
      };
    });

    // Filter out zero balance non-native tokens
    const filteredTokens = transformedTokens.filter((token: any) => 
      token.nativeToken || parseFloat(token.balance) > 0
    );

    return NextResponse.json({
      success: true,
      data: filteredTokens,
      count: filteredTokens.length,
    });
  } catch (error: any) {
    console.error('Error fetching tokens:', error.message);
    return NextResponse.json(
      { 
        error: 'Failed to fetch tokens',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

