'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, ExternalLink, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { TokenInfo } from '@wallet-health/types';
import { useState } from 'react';

interface TokenListProps {
  tokens: TokenInfo[];
  chainId: number;
  onHideToken?: (tokenAddress: string) => void;
}

export function TokenList({ tokens, chainId, onHideToken }: TokenListProps) {
  const [showSpam, setShowSpam] = useState(false);

  const getExplorerUrl = (address: string) => {
    const explorers: Record<number, string> = {
      1: 'https://etherscan.io',
      56: 'https://bscscan.com',
      137: 'https://polygonscan.com',
      8453: 'https://basescan.org',
      42161: 'https://arbiscan.io',
    };
    return `${explorers[chainId] || explorers[1]}/token/${address}`;
  };

  const cleanTokens = tokens.filter(t => !t.isSpam);
  const spamTokens = tokens.filter(t => t.isSpam);
  const displayTokens = showSpam ? tokens : cleanTokens;

  const totalValue = cleanTokens.reduce((sum, token) => sum + (token.value || 0), 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Token Holdings
              <span className="text-sm font-normal text-muted-foreground">
                ({cleanTokens.length} tokens)
              </span>
            </CardTitle>
            <CardDescription>
              Total Portfolio Value: {formatCurrency(totalValue)}
            </CardDescription>
          </div>
          {spamTokens.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSpam(!showSpam)}
            >
              {showSpam ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide Spam ({spamTokens.length})
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Show Spam ({spamTokens.length})
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {displayTokens.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No tokens found in this wallet
          </p>
        ) : (
          <div className="space-y-3">
            {displayTokens.map((token, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  token.isSpam
                    ? 'border-yellow-500/50 bg-yellow-500/5'
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Token Logo */}
                    <div className="flex-shrink-0">
                      {token.logo ? (
                        <img
                          src={token.logo}
                          alt={token.symbol}
                          className="w-10 h-10 rounded-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 
                              `https://ui-avatars.com/api/?name=${token.symbol}&background=10b981&color=fff`;
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                          {token.symbol.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Token Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold truncate">
                          {token.name}
                        </span>
                        <span className="text-muted-foreground">
                          ({token.symbol})
                        </span>
                        {token.nativeToken && (
                          <Badge variant="secondary">Native</Badge>
                        )}
                        {token.isSpam && (
                          <Badge variant="outline" className="inline-flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Spam
                          </Badge>
                        )}
                        {token.isVerified && (
                          <Badge variant="default">✓ Verified</Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Balance: </span>
                          <span className="font-medium">
                            {formatNumber(parseFloat(token.balance), 4)} {token.symbol}
                          </span>
                        </div>
                        {token.price && token.price > 0 && (
                          <div>
                            <span className="text-muted-foreground">Value: </span>
                            <span className="font-medium text-primary">
                              {formatCurrency(token.value || 0)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(getExplorerUrl(token.address), '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    {token.isSpam && onHideToken && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onHideToken(token.address)}
                      >
                        <EyeOff className="h-4 w-4 mr-2" />
                        Hide
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

