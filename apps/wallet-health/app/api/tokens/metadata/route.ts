import { NextRequest, NextResponse } from 'next/server';
import { tokenMetadataCache } from '@/lib/token-metadata-cache';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenAddress = searchParams.get('tokenAddress');
    const chainId = searchParams.get('chainId');
    const action = searchParams.get('action');
    const query = searchParams.get('query');

    if (action === 'get' && tokenAddress && chainId) {
      const forceRefresh = searchParams.get('forceRefresh') === 'true';
      const metadata = await tokenMetadataCache.getMetadata(
        tokenAddress,
        parseInt(chainId),
        forceRefresh
      );

      return NextResponse.json({
        success: true,
        data: { metadata },
      });
    }

    if (action === 'search' && query) {
      const chainIdParam = searchParams.get('chainId') ? parseInt(searchParams.get('chainId')!) : undefined;
      const results = tokenMetadataCache.searchTokens(query, chainIdParam);
      return NextResponse.json({
        success: true,
        data: { tokens: results },
      });
    }

    if (action === 'verified') {
      const chainIdParam = searchParams.get('chainId') ? parseInt(searchParams.get('chainId')!) : undefined;
      const verified = tokenMetadataCache.getVerifiedTokens(chainIdParam);
      return NextResponse.json({
        success: true,
        data: { tokens: verified },
      });
    }

    if (action === 'stats') {
      const stats = tokenMetadataCache.getStats();
      return NextResponse.json({
        success: true,
        data: stats,
      });
    }

    if (action === 'export') {
      const cache = tokenMetadataCache.exportCache();
      return NextResponse.json({
        success: true,
        data: { cache },
      });
    }

    return NextResponse.json(
      { error: 'Invalid action or missing parameters' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error fetching token metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token metadata', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, metadata, metadataList, tokens, tokenAddress, chainId, cache } = body;

    if (action === 'set') {
      if (!metadata) {
        return NextResponse.json(
          { error: 'Metadata is required' },
          { status: 400 }
        );
      }

      tokenMetadataCache.setMetadata(metadata);
      return NextResponse.json({
        success: true,
        data: { message: 'Metadata set' },
      });
    }

    if (action === 'batch-set') {
      if (!metadataList || !Array.isArray(metadataList)) {
        return NextResponse.json(
          { error: 'Metadata list is required' },
          { status: 400 }
        );
      }

      tokenMetadataCache.batchSetMetadata(metadataList);
      return NextResponse.json({
        success: true,
        data: { message: 'Metadata batch set' },
      });
    }

    if (action === 'batch-get') {
      if (!tokens || !Array.isArray(tokens)) {
        return NextResponse.json(
          { error: 'Tokens array is required' },
          { status: 400 }
        );
      }

      const forceRefresh = body.forceRefresh === true;
      const results = await tokenMetadataCache.batchGetMetadata(tokens, forceRefresh);
      return NextResponse.json({
        success: true,
        data: { metadata: Object.fromEntries(results) },
      });
    }

    if (action === 'invalidate') {
      if (!tokenAddress || !chainId) {
        return NextResponse.json(
          { error: 'Token address and chain ID are required' },
          { status: 400 }
        );
      }

      const invalidated = tokenMetadataCache.invalidate(tokenAddress, chainId);
      return NextResponse.json({
        success: invalidated,
        data: { invalidated },
      });
    }

    if (action === 'clear-expired') {
      const cleared = tokenMetadataCache.clearExpired();
      return NextResponse.json({
        success: true,
        data: { cleared },
      });
    }

    if (action === 'clear-all') {
      tokenMetadataCache.clearAll();
      return NextResponse.json({
        success: true,
        data: { message: 'Cache cleared' },
      });
    }

    if (action === 'import') {
      if (!cache || !Array.isArray(cache)) {
        return NextResponse.json(
          { error: 'Cache array is required' },
          { status: 400 }
        );
      }

      tokenMetadataCache.importCache(cache);
      return NextResponse.json({
        success: true,
        data: { message: 'Cache imported' },
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error processing token metadata:', error);
    return NextResponse.json(
      { error: 'Failed to process token metadata', message: error.message },
      { status: 500 }
    );
  }
}

