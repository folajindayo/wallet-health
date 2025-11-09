import { NextRequest, NextResponse } from 'next/server';
import { governanceTracker } from '@/lib/governance-tracker';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { proposal, vote, walletAddress, action, dao, chainId, options } = body;

    if (action === 'add-proposal') {
      if (!proposal) {
        return NextResponse.json(
          { error: 'Proposal is required' },
          { status: 400 }
        );
      }

      governanceTracker.addProposal(proposal);
      return NextResponse.json({
        success: true,
        data: { message: 'Proposal added' },
      });
    }

    if (action === 'record-vote') {
      if (!walletAddress || !vote) {
        return NextResponse.json(
          { error: 'Wallet address and vote are required' },
          { status: 400 }
        );
      }

      governanceTracker.recordVote(walletAddress, vote);
      return NextResponse.json({
        success: true,
        data: { message: 'Vote recorded' },
      });
    }

    if (action === 'participation') {
      if (!walletAddress) {
        return NextResponse.json(
          { error: 'Wallet address is required' },
          { status: 400 }
        );
      }

      const participation = governanceTracker.getParticipation(walletAddress);
      return NextResponse.json({
        success: true,
        data: participation,
      });
    }

    if (action === 'proposals') {
      if (!dao || !chainId) {
        return NextResponse.json(
          { error: 'DAO and chain ID are required' },
          { status: 400 }
        );
      }

      const proposals = governanceTracker.getProposals(dao, chainId);
      return NextResponse.json({
        success: true,
        data: { proposals },
      });
    }

    if (action === 'votes') {
      if (!walletAddress) {
        return NextResponse.json(
          { error: 'Wallet address is required' },
          { status: 400 }
        );
      }

      const votes = governanceTracker.getVotes(walletAddress, options || {});
      return NextResponse.json({
        success: true,
        data: { votes },
      });
    }

    if (action === 'active') {
      const proposals = governanceTracker.getActiveProposals(dao, chainId);
      return NextResponse.json({
        success: true,
        data: { proposals },
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error processing governance request:', error);
    return NextResponse.json(
      { error: 'Failed to process governance request', message: error.message },
      { status: 500 }
    );
  }
}

