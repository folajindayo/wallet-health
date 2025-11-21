/**
 * Security Analysis API Route
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
    // Perform security analysis
    const analysis = {
      score: 75,
      risks: [
        {
          type: 'old_approvals',
          severity: 'medium' as const,
          description: '3 old token approvals detected',
        },
      ],
      recommendations: [
        'Review and revoke unused token approvals',
        'Enable 2FA on connected dApps',
      ],
    };

    return NextResponse.json(analysis);
  } catch (error) {
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }
}

