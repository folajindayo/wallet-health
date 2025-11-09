'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, ExternalLink, Grid, List } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';

interface NFT {
  tokenId: string;
  name: string;
  collection: string;
  image: string;
  contractAddress: string;
  floorPrice?: number;
}

interface NFTGalleryProps {
  walletAddress: string;
  chainId: number;
}

export function NFTGallery({ walletAddress, chainId }: NFTGalleryProps) {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchNFTs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress, chainId]);

  const fetchNFTs = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/scan/nfts', {
        walletAddress,
        chainId,
      });

      if (response.data.success) {
        setNfts(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch NFTs:', error);
      // Generate mock data for demo
      setNfts([
        {
          tokenId: '1',
          name: 'Example NFT #1',
          collection: 'Example Collection',
          image: 'https://via.placeholder.com/300',
          contractAddress: '0x...',
          floorPrice: 0.5,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            NFT Gallery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              NFT Gallery
              <Badge variant="outline">{nfts.length}</Badge>
            </CardTitle>
            <CardDescription>Your NFT collection</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {nfts.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No NFTs found in this wallet</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {nfts.map((nft, index) => (
              <div
                key={index}
                className="group relative rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="aspect-square bg-muted">
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 
                        'https://via.placeholder.com/300?text=NFT';
                    }}
                  />
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-sm truncate">{nft.name}</h4>
                  <p className="text-xs text-muted-foreground truncate">{nft.collection}</p>
                  {nft.floorPrice && (
                    <p className="text-xs text-primary mt-1">
                      Floor: {nft.floorPrice} ETH
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => window.open(getExplorerUrl(nft.contractAddress), '_blank')}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {nfts.map((nft, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="w-16 h-16 rounded object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 
                      'https://via.placeholder.com/64?text=NFT';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{nft.name}</h4>
                  <p className="text-xs text-muted-foreground truncate">{nft.collection}</p>
                  {nft.floorPrice && (
                    <p className="text-xs text-primary mt-1">
                      Floor: {nft.floorPrice} ETH
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(getExplorerUrl(nft.contractAddress), '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

