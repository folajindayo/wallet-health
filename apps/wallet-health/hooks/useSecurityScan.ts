/**
 * useSecurityScan Hook
 */

import { useState, useCallback } from 'react';

export function useSecurityScan() {
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const scanWallet = useCallback(async (walletAddress: string, chainId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/security/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, chainId }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setScan(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { scan, loading, error, scanWallet };
}


