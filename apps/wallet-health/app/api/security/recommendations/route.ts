import { NextRequest, NextResponse } from 'next/server';
import { securityRecommendationsEngine } from '@/lib/security-recommendations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { context, action, severity, category } = body;

    if (!context) {
      return NextResponse.json(
        { error: 'Context is required' },
        { status: 400 }
      );
    }

    if (action === 'generate') {
      const report = securityRecommendationsEngine.generateRecommendations(context);
      return NextResponse.json({
        success: true,
        data: report,
      });
    }

    if (action === 'by-severity' && severity) {
      const recommendations = securityRecommendationsEngine.getRecommendationsBySeverity(
        severity,
        context
      );
      return NextResponse.json({
        success: true,
        data: { recommendations },
      });
    }

    if (action === 'by-category' && category) {
      const recommendations = securityRecommendationsEngine.getRecommendationsByCategory(
        category,
        context
      );
      return NextResponse.json({
        success: true,
        data: { recommendations },
      });
    }

    // Default: generate all
    const report = securityRecommendationsEngine.generateRecommendations(context);
    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations', message: error.message },
      { status: 500 }
    );
  }
}

