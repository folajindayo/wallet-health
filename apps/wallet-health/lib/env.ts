/**
 * Environment Variables
 */

export const ENV = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  MONGODB_URI: process.env.MONGODB_URI || '',
  GOLDRUSH_API_KEY: process.env.GOLDRUSH_API_KEY || '',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
} as const;

