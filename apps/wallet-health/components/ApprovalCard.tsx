/**
 * ApprovalCard Component
 */

'use client';

interface Approval {
  tokenAddress: string;
  spender: string;
  amount: string;
  isUnlimited: boolean;
}

interface ApprovalCardProps {
  approval: Approval;
  onRevoke: (tokenAddress: string, spender: string) => void;
}

export function ApprovalCard({ approval, onRevoke }: ApprovalCardProps) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <p className="text-sm text-gray-500">Token</p>
          <p className="font-mono text-sm">{approval.tokenAddress.slice(0, 10)}...</p>
        </div>
        {approval.isUnlimited && (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
            Unlimited
          </span>
        )}
      </div>
      <div className="mb-3">
        <p className="text-sm text-gray-500">Spender</p>
        <p className="font-mono text-sm">{approval.spender.slice(0, 10)}...</p>
      </div>
      <button
        onClick={() => onRevoke(approval.tokenAddress, approval.spender)}
        className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Revoke
      </button>
    </div>
  );
}

