import { NextRequest, NextResponse } from 'next/server';
import { saveWalletScan } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const scanData = await request.json();

    const {
      walletAddress,
      chainId,
      score,
      riskLevel,
      approvals,
      tokens,
      alerts,
    } = scanData;

    if (!walletAddress || !chainId) {
      return NextResponse.json(
        { error: 'Wallet address and chain ID are required' },
        { status: 400 }
      );
    }

    // Save scan to database
    const result = await saveWalletScan({
      walletAddress: walletAddress.toLowerCase(),
      chainId,
      score: score || 0,
      riskLevel: riskLevel || 'moderate',
      approvals: approvals || [],
      tokens: tokens || [],
      alerts: alerts || [],
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      data: {
        id: result.insertedId,
        message: 'Scan saved successfully',
      },
    });
  } catch (error: any) {
    console.error('Error saving scan:', error.message);
    return NextResponse.json(
      { 
        error: 'Failed to save scan',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

