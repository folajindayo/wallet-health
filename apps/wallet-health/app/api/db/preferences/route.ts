import { NextRequest, NextResponse } from 'next/server';
import { getUserPreferences, saveUserPreferences } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const preferences = await getUserPreferences(walletAddress.toLowerCase());

    return NextResponse.json({
      success: true,
      data: preferences || {
        walletAddress: walletAddress.toLowerCase(),
        hiddenTokens: [],
        notifications: true,
        theme: 'dark',
      },
    });
  } catch (error: any) {
    console.error('Error fetching preferences:', error.message);
    return NextResponse.json(
      { 
        error: 'Failed to fetch preferences',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const preferences = await request.json();
    const { walletAddress } = preferences;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    await saveUserPreferences({
      ...preferences,
      walletAddress: walletAddress.toLowerCase(),
    });

    return NextResponse.json({
      success: true,
      message: 'Preferences saved successfully',
    });
  } catch (error: any) {
    console.error('Error saving preferences:', error.message);
    return NextResponse.json(
      { 
        error: 'Failed to save preferences',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

