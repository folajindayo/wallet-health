/**
 * Threat Type Constants
 */

export const THREAT_TYPES = {
  MALICIOUS_APPROVAL: 'malicious_approval',
  SUSPICIOUS_CONTRACT: 'suspicious_contract',
  HIGH_VALUE_EXPOSURE: 'high_value_exposure',
  PHISHING_RISK: 'phishing_risk',
  OUTDATED_APPROVAL: 'outdated_approval',
} as const;

export type ThreatTypeType = typeof THREAT_TYPES[keyof typeof THREAT_TYPES];

export const THREAT_TYPE_DESCRIPTIONS: Record<string, string> = {
  malicious_approval: 'Potentially malicious token approval',
  suspicious_contract: 'Suspicious smart contract interaction',
  high_value_exposure: 'High value assets at risk',
  phishing_risk: 'Potential phishing attempt',
  outdated_approval: 'Outdated token approval',
};

