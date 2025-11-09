import { NextRequest, NextResponse } from 'next/server';
import { tokenApprovalManager } from '@/lib/token-approval-manager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, walletAddress, approvals, chainId, approvalAddresses, tokenAddress, spenderAddress } = body;

    switch (action) {
      case 'add_approvals':
        if (!walletAddress || !approvals) {
          return NextResponse.json(
            { success: false, message: 'walletAddress and approvals are required' },
            { status: 400 }
          );
        }
        tokenApprovalManager.addApprovals(walletAddress, approvals);
        return NextResponse.json({ success: true });

      case 'get_approvals':
        if (!walletAddress) {
          return NextResponse.json(
            { success: false, message: 'walletAddress is required' },
            { status: 400 }
          );
        }
        const allApprovals = tokenApprovalManager.getApprovals(walletAddress, chainId);
        return NextResponse.json({ success: true, data: allApprovals });

      case 'get_risky':
        if (!walletAddress) {
          return NextResponse.json(
            { success: false, message: 'walletAddress is required' },
            { status: 400 }
          );
        }
        const riskyApprovals = tokenApprovalManager.getRiskyApprovals(walletAddress, body.minRiskLevel);
        return NextResponse.json({ success: true, data: riskyApprovals });

      case 'generate_batch_revoke':
        if (!walletAddress || !approvalAddresses) {
          return NextResponse.json(
            { success: false, message: 'walletAddress and approvalAddresses are required' },
            { status: 400 }
          );
        }
        const batch = tokenApprovalManager.generateBatchRevoke(walletAddress, approvalAddresses);
        return NextResponse.json({ success: true, data: batch });

      case 'get_recommendations':
        if (!walletAddress) {
          return NextResponse.json(
            { success: false, message: 'walletAddress is required' },
            { status: 400 }
          );
        }
        const recommendations = tokenApprovalManager.generateRecommendations(walletAddress);
        return NextResponse.json({ success: true, data: recommendations });

      case 'get_health_score':
        if (!walletAddress) {
          return NextResponse.json(
            { success: false, message: 'walletAddress is required' },
            { status: 400 }
          );
        }
        const healthScore = tokenApprovalManager.calculateApprovalHealthScore(walletAddress);
        return NextResponse.json({ success: true, data: healthScore });

      case 'get_statistics':
        if (!walletAddress) {
          return NextResponse.json(
            { success: false, message: 'walletAddress is required' },
            { status: 400 }
          );
        }
        const statistics = tokenApprovalManager.getStatistics(walletAddress);
        return NextResponse.json({ success: true, data: statistics });

      case 'remove_approval':
        if (!walletAddress || !tokenAddress || !spenderAddress || !chainId) {
          return NextResponse.json(
            { success: false, message: 'walletAddress, tokenAddress, spenderAddress, and chainId are required' },
            { status: 400 }
          );
        }
        const removed = tokenApprovalManager.removeApproval(walletAddress, tokenAddress, spenderAddress, chainId);
        return NextResponse.json({ success: true, data: { removed } });

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Approval management error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

