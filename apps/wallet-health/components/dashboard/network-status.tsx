'use client';

import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Activity } from 'lucide-react';
import { useAccount, useBlockNumber } from 'wagmi';
import { chainMetadata } from '@/lib/web3-config';

export function NetworkStatus() {
  const { isConnected, chain } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true });

  if (!isConnected || !chain) {
    return (
      <Badge variant="destructive" className="inline-flex items-center gap-1.5">
        <WifiOff className="h-3 w-3" />
        Disconnected
      </Badge>
    );
  }

  const metadata = chainMetadata[chain.id as keyof typeof chainMetadata];

  return (
    <div className="inline-flex items-center gap-2">
      <Badge variant="success" className="inline-flex items-center gap-1.5">
        <Activity className="h-3 w-3 animate-pulse" />
        Connected
      </Badge>
      <Badge variant="outline" className="inline-flex items-center gap-1.5">
        <span>{metadata?.icon || '🔗'}</span>
        <span>{metadata?.name || chain.name}</span>
      </Badge>
      {blockNumber && (
        <Badge variant="outline" className="font-mono text-xs">
          Block #{blockNumber.toString()}
        </Badge>
      )}
    </div>
  );
}

