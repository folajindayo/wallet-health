import { NextRequest, NextResponse } from 'next/server';
import { ensResolver } from '@/lib/ens-resolver';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain, address, batch } = body;

    if (batch) {
      if (batch.domains) {
        const results = await ensResolver.batchResolveENS(batch.domains);
        return NextResponse.json({
          success: true,
          data: { results },
        });
      }

      if (batch.addresses) {
        const results = await ensResolver.batchResolveAddress(batch.addresses);
        return NextResponse.json({
          success: true,
          data: { results },
        });
      }
    }

    if (domain) {
      const result = await ensResolver.resolveENS(domain);
      return NextResponse.json({
        success: true,
        data: { result },
      });
    }

    if (address) {
      const result = await ensResolver.resolveAddress(address);
      return NextResponse.json({
        success: true,
        data: { result },
      });
    }

    return NextResponse.json(
      { error: 'Either domain or address is required' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error resolving ENS:', error);
    return NextResponse.json(
      { error: 'Failed to resolve ENS', message: error.message },
      { status: 500 }
    );
  }
}

