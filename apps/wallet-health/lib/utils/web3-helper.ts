/**
 * Web3 Helper
 */

export function isWeb3Available(): boolean {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
}

export async function getChainId(): Promise<number> {
  if (!isWeb3Available()) return 1;

  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  return parseInt(chainId, 16);
}

export async function getAccounts(): Promise<string[]> {
  if (!isWeb3Available()) return [];

  const accounts = await window.ethereum.request({ method: 'eth_accounts' });
  return accounts;
}

export function watchChainChange(callback: (chainId: number) => void) {
  if (!isWeb3Available()) return;

  window.ethereum.on('chainChanged', (chainId: string) => {
    callback(parseInt(chainId, 16));
  });
}

