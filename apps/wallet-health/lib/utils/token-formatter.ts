/**
 * Token Formatter
 */

export function formatTokenAmount(amount: string, decimals: number = 18): string {
  const value = BigInt(amount);
  const divisor = BigInt(10 ** decimals);
  const result = Number(value) / Number(divisor);
  
  if (result < 0.0001) return '< 0.0001';
  if (result < 1) return result.toFixed(4);
  if (result < 1000) return result.toFixed(2);
  if (result < 1000000) return (result / 1000).toFixed(2) + 'K';
  return (result / 1000000).toFixed(2) + 'M';
}

export function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

