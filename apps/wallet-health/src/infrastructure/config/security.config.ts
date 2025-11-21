/**
 * Security Configuration
 */

export interface SecurityConfig {
  scanInterval: number;
  threatDetectionEnabled: boolean;
  criticalThreatThreshold: number;
  autoRevokeEnabled: boolean;
}

export const securityConfig: SecurityConfig = {
  scanInterval: 3600000, // 1 hour
  threatDetectionEnabled: true,
  criticalThreatThreshold: 3,
  autoRevokeEnabled: false,
};

