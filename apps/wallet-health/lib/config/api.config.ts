/**
 * API Configuration
 */

export const API_CONFIG = {
  goldrush: {
    baseUrl: 'https://api.covalenthq.com/v1',
    key: process.env.GOLDRUSH_API_KEY || '',
    timeout: 30000,
  },
  mongodb: {
    uri: process.env.MONGODB_URI || '',
    dbName: 'wallet-health',
  },
  cache: {
    ttl: 5 * 60 * 1000, // 5 minutes
  },
};

export const SUPPORTED_CHAINS = [
  { id: 1, name: 'Ethereum', symbol: 'ETH' },
  { id: 137, name: 'Polygon', symbol: 'MATIC' },
  { id: 8453, name: 'Base', symbol: 'ETH' },
  { id: 42161, name: 'Arbitrum', symbol: 'ETH' },
  { id: 10, name: 'Optimism', symbol: 'ETH' },
];

