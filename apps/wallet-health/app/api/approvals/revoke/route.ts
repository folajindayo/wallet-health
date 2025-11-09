import { NextRequest, NextResponse } from 'next/server';
import { approvalRevoker } from '@/lib/approval-revoker';
import type { TokenApproval } from '@wallet-health/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { approvals, action } = body;

    if (!approvals || !Array.isArray(approvals)) {
      return NextResponse.json(
        { error: 'Approvals array is required' },
        { status: 400 }
      );
    }

    if (action === 'analyze') {
      const plan = approvalRevoker.analyzeApprovalsForRevocation(
        approvals as TokenApproval[]
      );
      const stats = approvalRevoker.getRevocationStats(plan);

      return NextResponse.json({
        success: true,
        data: {
          plan,
          stats,
        },
      });
    }

    if (action === 'generate') {
      const { approval, amount } = body;
      if (!approval) {
        return NextResponse.json(
          { error: 'Approval is required' },
          { status: 400 }
        );
      }

      const transaction = approvalRevoker.generateRevocationTransaction(
        approval as TokenApproval,
        amount || '0'
      );

      return NextResponse.json({
        success: true,
        data: { transaction },
      });
    }

    if (action === 'batch') {
      const transactions = approvalRevoker.generateBatchRevocationTransaction(
        approvals as TokenApproval[]
      );

      return NextResponse.json({
        success: true,
        data: transactions,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error processing revocation:', error);
    return NextResponse.json(
      { error: 'Failed to process revocation', message: error.message },
      { status: 500 }
    );
  }
}

