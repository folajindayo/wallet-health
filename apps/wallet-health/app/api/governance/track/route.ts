import { NextRequest, NextResponse } from 'next/server';
import { governanceTracker } from '@/lib/governance-tracker';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, proposal, vote, position, action, dao, status, proposalId, chainId } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    if (action === 'add-proposal') {
      if (!proposal) {
        return NextResponse.json(
          { error: 'Proposal is required' },
          { status: 400 }
        );
      }

      governanceTracker.addProposal(walletAddress, proposal);
      return NextResponse.json({
        success: true,
        data: { message: 'Proposal added' },
      });
    }

    if (action === 'record-vote') {
      if (!vote) {
        return NextResponse.json(
          { error: 'Vote is required' },
          { status: 400 }
        );
      }

      governanceTracker.recordVote(walletAddress, vote);
      return NextResponse.json({
        success: true,
        data: { message: 'Vote recorded' },
      });
    }

    if (action === 'add-position') {
      if (!position) {
        return NextResponse.json(
          { error: 'Position is required' },
          { status: 400 }
        );
      }

      governanceTracker.addPosition(walletAddress, position);
      return NextResponse.json({
        success: true,
        data: { message: 'Position added' },
      });
    }

    if (action === 'summary') {
      const summary = governanceTracker.getSummary(walletAddress);
      return NextResponse.json({
        success: true,
        data: summary,
      });
    }

    if (action === 'proposals') {
      const proposals = governanceTracker.getProposals(walletAddress, dao, status);
      return NextResponse.json({
        success: true,
        data: { proposals },
      });
    }

    if (action === 'votes') {
      const votes = governanceTracker.getVotes(walletAddress, proposalId);
      return NextResponse.json({
        success: true,
        data: { votes },
      });
    }

    if (action === 'active') {
      const active = governanceTracker.getActiveProposals(walletAddress);
      return NextResponse.json({
        success: true,
        data: { proposals: active },
      });
    }

    if (action === 'voting-power') {
      if (!dao || !chainId) {
        return NextResponse.json(
          { error: 'DAO and chain ID are required' },
          { status: 400 }
        );
      }

      const power = governanceTracker.getVotingPower(walletAddress, dao, chainId);
      return NextResponse.json({
        success: true,
        data: { votingPower: power },
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
