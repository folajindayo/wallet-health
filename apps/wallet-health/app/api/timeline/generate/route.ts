import { NextRequest, NextResponse } from 'next/server';
import { walletActivityTimelineGenerator } from '@/lib/wallet-activity-timeline-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, events, riskLevels, startDate, endDate } = body;

    if (!walletAddress || !events || !Array.isArray(events)) {
      return NextResponse.json(
        { success: false, message: 'walletAddress and events array are required' },
        { status: 400 }
      );
    }

    const timeline = walletActivityTimelineGenerator.generateTimeline({
      walletAddress,
      events,
    });

    // Filter by risk levels if provided
    let filteredTimeline = timeline;
    if (riskLevels && Array.isArray(riskLevels) && riskLevels.length > 0) {
      filteredTimeline = walletActivityTimelineGenerator.filterByRisk(timeline, riskLevels);
    }

    // Filter by date range if provided
    if (startDate && endDate) {
      const filteredEvents = walletActivityTimelineGenerator.getEventsByDateRange(
        filteredTimeline,
        startDate,
        endDate
      );
      // Rebuild timeline with filtered events
      filteredTimeline = walletActivityTimelineGenerator.generateTimeline({
        walletAddress,
        events: filteredEvents.map((e) => ({
          type: e.type,
          timestamp: e.timestamp,
          title: e.title,
          description: e.description,
          riskLevel: e.riskLevel,
          chainId: e.chainId,
          hash: e.hash,
          from: e.from,
          to: e.to,
          value: e.value,
          tokenAddress: e.tokenAddress,
          metadata: e.metadata,
        })),
      });
    }

    return NextResponse.json({ success: true, data: filteredTimeline });
  } catch (error: any) {
    console.error('Timeline generation error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

