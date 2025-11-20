/**
 * useApprovals Hook
 */

'use client';

import { useState, useEffect } from 'react';
import { ApprovalService, TokenApproval } from '../lib/services/approval.service';

export function useApprovals(address: string | null) {
  const [approvals, setApprovals] = useState<TokenApproval[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;

    const fetchApprovals = async () => {
      setLoading(true);
      setError(null);

      try {
        const service = new ApprovalService();
        const data = await service.getApprovals(address);
        setApprovals(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovals();
  }, [address]);

  return { approvals, loading, error };
}

