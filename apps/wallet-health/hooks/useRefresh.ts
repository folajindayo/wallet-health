/**
 * useRefresh Hook
 */

'use client';

import { useState, useCallback } from 'react';

export function useRefresh() {
  const [refreshCount, setRefreshCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setRefreshCount((prev) => prev + 1);
    
    // Simulate refresh delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    setIsRefreshing(false);
  }, []);

  return { refreshCount, isRefreshing, refresh };
}

