/**
 * useWallet Hook
 */

'use client';

import { useAppKit, useAppKitAccount } from '@reown/appkit/react';

export function useWallet() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  const connect = () => open();
  const disconnect = () => open();

  return {
    address,
    isConnected,
    connect,
    disconnect,
  };
}

