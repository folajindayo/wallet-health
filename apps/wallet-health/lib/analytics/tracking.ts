/**
 * Analytics Tracking
 */

export const EVENTS = {
  SECURITY_SCAN: 'security_scan',
  APPROVAL_REVOKED: 'approval_revoked',
  THREAT_DETECTED: 'threat_detected',
  REPORT_GENERATED: 'report_generated',
} as const;

export function trackSecurityEvent(
  event: string,
  metadata?: Record<string, any>
) {
  if (typeof window === 'undefined') return;
  
  console.log('Security Event:', event, metadata);
  
  // Analytics integration
}

