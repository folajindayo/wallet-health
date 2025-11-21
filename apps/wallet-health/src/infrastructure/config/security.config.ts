/**
 * Security Configuration
 */

export const securityConfig = {
  scan: {
    timeout: 30000,
    maxConcurrentScans: 5,
    cacheEnabled: true,
    cacheDuration: 3600, // 1 hour in seconds
  },
  riskThresholds: {
    low: 20,
    medium: 40,
    high: 70,
    critical: 90,
  },
  threatWeights: {
    critical: 10,
    high: 5,
    medium: 2,
    low: 1,
  },
  alerts: {
    enabled: true,
    criticalThreshold: 80,
    notificationChannels: ['email', 'webhook'],
  },
  rateLimiting: {
    maxRequestsPerMinute: 10,
    maxRequestsPerHour: 100,
  },
};

export const apiEndpoints = {
  scan: '/api/security/scan',
  threats: '/api/threats',
  riskScore: '/api/risk-score',
};
