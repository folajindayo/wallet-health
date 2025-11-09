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

    // Fetch NFTs from GoldRush API
    const url = `${GOLDRUSH_BASE_URL}/${chainId}/address/${walletAddress}/balances_nft/`;
    
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${GOLDRUSH_API_KEY}`,
      },
    });

    const items = response.data.data?.items || [];

    // Transform the data to our format
    const transformedNFTs = items.flatMap((item: any) => {
      if (!item.nft_data || item.nft_data.length === 0) return [];
      
      return item.nft_data.map((nft: any) => ({
        tokenId: nft.token_id || '0',
        name: nft.external_data?.name || `${item.contract_name} #${nft.token_id}`,
        collection: item.contract_name || 'Unknown Collection',
        image: nft.external_data?.image || nft.external_data?.image_512 || nft.external_data?.image_256 || '',
        description: nft.external_data?.description || '',
        contractAddress: item.contract_address,
        tokenUrl: nft.token_url,
        floorPrice: null, // GoldRush doesn't provide floor price directly
      }));
    });

    // Filter out NFTs without images
    const validNFTs = transformedNFTs.filter((nft: any) => nft.image);

    return NextResponse.json({
      success: true,
      data: validNFTs,
      count: validNFTs.length,
    });
  } catch (error: any) {
    console.error('Error fetching NFTs:', error.message);
    return NextResponse.json(
      { 
        error: 'Failed to fetch NFTs',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

