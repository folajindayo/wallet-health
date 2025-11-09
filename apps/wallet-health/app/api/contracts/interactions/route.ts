import { NextRequest, NextResponse } from 'next/server';
import { contractInteractionTracker } from '@/lib/contract-interaction-tracker';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, interaction, action, options } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    if (action === 'record') {
      if (!interaction) {
        return NextResponse.json(
          { error: 'Interaction is required' },
          { status: 400 }
        );
      }

      contractInteractionTracker.recordInteraction(walletAddress, interaction);
      return NextResponse.json({
        success: true,
        data: { message: 'Interaction recorded' },
      });
    }

    if (action === 'analyze') {
      const analysis = contractInteractionTracker.analyzeInteractions(
        walletAddress,
        options || {}
      );

      return NextResponse.json({
        success: true,
        data: analysis,
      });
    }

    if (action === 'get-contract') {
      const { contractAddress, chainId } = body;
      if (!contractAddress || !chainId) {
        return NextResponse.json(
          { error: 'Contract address and chain ID are required' },
          { status: 400 }
        );
      }

      const profile = contractInteractionTracker.getContractProfile(
        walletAddress,
        contractAddress,
        chainId
      );

      return NextResponse.json({
        success: true,
        data: { profile },
      });
    }

    if (action === 'get-interactions') {
      const { contractAddress, chainId } = body;
      if (!contractAddress || !chainId) {
        return NextResponse.json(
          { error: 'Contract address and chain ID are required' },
          { status: 400 }
        );
      }

      const interactions = contractInteractionTracker.getContractInteractions(
        walletAddress,
        contractAddress,
        chainId
      );

      return NextResponse.json({
        success: true,
        data: { interactions },
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error processing contract interactions:', error);
    return NextResponse.json(
      { error: 'Failed to process contract interactions', message: error.message },
      { status: 500 }
    );
  }
}

