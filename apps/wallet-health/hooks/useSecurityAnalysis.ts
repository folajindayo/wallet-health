/**
 * useSecurityAnalysis Hook
 */

'use client';

import { useState, useEffect } from 'react';

interface SecurityAnalysis {
  score: number;
  risks: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
  }>;
  recommendations: string[];
}

export function useSecurityAnalysis(address: string | undefined) {
  const [analysis, setAnalysis] = useState<SecurityAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!address) {
      setAnalysis(null);
      return;
    }

    setIsLoading(true);
    fetch(`/api/security/analyze?address=${address}`)
      .then((res) => res.json())
      .then(setAnalysis)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [address]);

  return { analysis, isLoading };
}

