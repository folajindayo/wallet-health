/**
 * Security Level Constants
 */

export const SECURITY_LEVELS = {
  CRITICAL: {
    min: 0,
    max: 40,
    label: 'Critical',
    color: 'red',
    description: 'Immediate action required',
  },
  HIGH: {
    min: 41,
    max: 60,
    label: 'High Risk',
    color: 'orange',
    description: 'Multiple security issues detected',
  },
  MEDIUM: {
    min: 61,
    max: 80,
    label: 'Medium Risk',
    color: 'yellow',
    description: 'Some security concerns',
  },
  LOW: {
    min: 81,
    max: 100,
    label: 'Low Risk',
    color: 'green',
    description: 'Good security posture',
  },
} as const;

export function getSecurityLevel(score: number) {
  for (const level of Object.values(SECURITY_LEVELS)) {
    if (score >= level.min && score <= level.max) {
      return level;
    }
  }
  return SECURITY_LEVELS.CRITICAL;
}

