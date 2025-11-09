import { NextRequest, NextResponse } from 'next/server';
import { activityHeatmapGenerator } from '@/lib/activity-heatmap';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { activities, days, action, heatmap1, heatmap2 } = body;

    if (!activities || !Array.isArray(activities)) {
      return NextResponse.json(
        { error: 'Activities array is required' },
        { status: 400 }
      );
    }

    if (action === 'generate') {
      const heatmap = activityHeatmapGenerator.generateHeatmap(activities, days || 30);
      return NextResponse.json({
        success: true,
        data: heatmap,
      });
    }

    if (action === 'stats') {
      const stats = activityHeatmapGenerator.generateStats(activities);
      return NextResponse.json({
        success: true,
        data: stats,
      });
    }

    if (action === 'compare' && heatmap1 && heatmap2) {
      const comparison = activityHeatmapGenerator.compareHeatmaps(heatmap1, heatmap2);
      return NextResponse.json({
        success: true,
        data: comparison,
      });
    }

    // Default: generate heatmap
    const heatmap = activityHeatmapGenerator.generateHeatmap(activities, days || 30);
    return NextResponse.json({
      success: true,
      data: heatmap,
    });
  } catch (error: any) {
    console.error('Error generating heatmap:', error);
    return NextResponse.json(
      { error: 'Failed to generate heatmap', message: error.message },
      { status: 500 }
    );
  }
}

