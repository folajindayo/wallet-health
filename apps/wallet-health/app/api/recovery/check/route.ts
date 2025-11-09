import { NextRequest, NextResponse } from 'next/server';
import { recoveryChecker } from '@/lib/recovery-checker';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phrase, context, action } = body;

    if (!phrase) {
      return NextResponse.json(
        { error: 'Recovery phrase is required' },
        { status: 400 }
      );
    }

    if (action === 'check') {
      const result = recoveryChecker.checkRecoveryPhrase(phrase);
      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    if (action === 'exposure') {
      const result = recoveryChecker.checkForExposure(phrase, context);
      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    if (action === 'validate') {
      const result = recoveryChecker.validateBIP39Format(phrase);
      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    // Default: check security
    const result = recoveryChecker.checkRecoveryPhrase(phrase);
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error checking recovery phrase:', error);
    return NextResponse.json(
      { error: 'Failed to check recovery phrase', message: error.message },
      { status: 500 }
    );
  }
}

