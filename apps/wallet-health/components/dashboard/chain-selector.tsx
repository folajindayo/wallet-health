'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { chainMetadata } from '@/lib/web3-config';
import { useSwitchChain, useChainId } from 'wagmi';

const SUPPORTED_CHAINS = [1, 56, 137, 8453, 42161] as const;

export function ChainSelector() {
  const currentChainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Network</CardTitle>
        <CardDescription>
          Switch between supported chains to scan different networks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {SUPPORTED_CHAINS.map((chainId) => {
            const metadata = chainMetadata[chainId];
            const isActive = currentChainId === chainId;

            return (
              <Button
                key={chainId}
                variant={isActive ? 'default' : 'outline'}
                className="h-auto flex-col items-center gap-2 py-4"
                onClick={() => !isActive && switchChain({ chainId })}
                disabled={isPending || isActive}
              >
                <span className="text-2xl">{metadata.icon}</span>
                <span className="text-sm font-medium">{metadata.name}</span>
                {isActive && (
                  <Badge variant="success" className="text-xs">
                    Active
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>

        {isPending && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Switching network...
          </div>
        )}
      </CardContent>
    </Card>
  );
}

