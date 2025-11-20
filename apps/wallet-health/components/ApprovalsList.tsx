/**
 * ApprovalsList Component
 */

'use client';

import { useApprovals } from '../hooks/useApprovals';
import { ApprovalCard } from './ApprovalCard';
import { Loading } from './ui/Loading';

interface ApprovalsListProps {
  address: string;
}

export function ApprovalsList({ address }: ApprovalsListProps) {
  const { approvals, loading, error } = useApprovals(address);

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (approvals.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No token approvals found
      </div>
    );
  }

  const handleRevoke = async (tokenAddress: string, spender: string) => {
    console.log('Revoking approval:', { tokenAddress, spender });
    // Implementation
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Token Approvals</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {approvals.map((approval, index) => (
          <ApprovalCard
            key={`${approval.tokenAddress}-${approval.spender}-${index}`}
            approval={approval}
            onRevoke={handleRevoke}
          />
        ))}
      </div>
    </div>
  );
}

