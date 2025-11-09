import { NextRequest, NextResponse } from 'next/server';
import { activityTimeline } from '@/lib/activity-timeline';
import type { TokenApproval } from '@wallet-health/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      transactions,
      approvals = [],
      options = {},
    } = body;

    if (!transactions || !Array.isArray(transactions)) {
      return NextResponse.json(
        { error: 'Transactions array is required' },
        { status: 400 }
      );
    }

    const timeline = await activityTimeline.generateTimeline(
      transactions,
      approvals as TokenApproval[],
      options
    );

    return NextResponse.json({
      success: true,
      data: timeline,
    });
  } catch (error: any) {
    console.error('Error generating timeline:', error);
    return NextResponse.json(
      { error: 'Failed to generate timeline', message: error.message },
      { status: 500 }
    );
  }
}

