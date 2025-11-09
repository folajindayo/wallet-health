import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, bsc, polygon, base, arbitrum } from '@reown/appkit/networks';
import { WagmiProvider } from 'wagmi';
import { QueryClient } from '@tanstack/react-query';

// Get project ID from environment
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;

if (!projectId) {
  throw new Error('NEXT_PUBLIC_REOWN_PROJECT_ID is not set');
}

// Define supported chains
export const chains = [mainnet, bsc, polygon, base, arbitrum];

// Chain metadata for display
export const chainMetadata = {
  [mainnet.id]: {
    name: 'Ethereum',
    icon: '⟠',
    color: '#627EEA',
  },
  [bsc.id]: {
    name: 'BNB Chain',
    icon: '🔶',
    color: '#F3BA2F',
  },
  [polygon.id]: {
    name: 'Polygon',
    icon: '🟣',
    color: '#8247E5',
  },
  [base.id]: {
    name: 'Base',
    icon: '🔵',
    color: '#0052FF',
  },
  [arbitrum.id]: {
    name: 'Arbitrum',
    icon: '🔷',
    color: '#28A0F0',
  },
};

// Wagmi config
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: chains as any,
});

export const config = wagmiAdapter.wagmiConfig;

// Create the modal
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: chains as any,
  defaultNetwork: mainnet,
  metadata: {
    name: 'Wallet Health Monitor',
    description: 'Scan your wallet for security risks',
    url: 'https://wallet-health.app',
    icons: ['https://wallet-health.app/icon.png'],
  },
  features: {
    analytics: true,
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#10b981',
    '--w3m-border-radius-master': '8px',
  },
});

