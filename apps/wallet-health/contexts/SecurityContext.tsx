/**
 * Security Context
 */

'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface SecurityData {
  score: number;
  approvals: any[];
  threats: any[];
}

interface SecurityContextType {
  securityData: SecurityData | null;
  updateSecurityData: (data: SecurityData) => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export function SecurityProvider({ children }: { children: ReactNode }) {
  const [securityData, setSecurityData] = useState<SecurityData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const value = {
    securityData,
    updateSecurityData: setSecurityData,
    isLoading,
    setLoading: setIsLoading,
  };

  return <SecurityContext.Provider value={value}>{children}</SecurityContext.Provider>;
}

export function useSecurityContext() {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider');
  }
  return context;
}

