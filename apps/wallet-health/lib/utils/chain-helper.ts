/**
 * Chain Helper
 */

export function getChainName(chainId: number): string {
  const chains: Record<number, string> = {
    1: 'Ethereum',
    137: 'Polygon',
    8453: 'Base',
    42161: 'Arbitrum',
    10: 'Optimism',
  };
  
  return chains[chainId] || 'Unknown';
}

export function getExplorerUrl(chainId: number, hash: string): string {
  const explorers: Record<number, string> = {
    1: 'https://etherscan.io',
    137: 'https://polygonscan.com',
    8453: 'https://basescan.org',
    42161: 'https://arbiscan.io',
    10: 'https://optimistic.etherscan.io',
  };
  
  const baseUrl = explorers[chainId];
  return baseUrl ? `${baseUrl}/tx/${hash}` : '';
}

