/**
 * Security Helper Functions
 */

export function calculateThreatScore(threats: any[]): number {
  if (threats.length === 0) return 0;
  
  const weights = {
    critical: 10,
    high: 5,
    medium: 2,
    low: 1,
  };
  
  const totalScore = threats.reduce((sum, threat) => {
    return sum + (weights[threat.severity as keyof typeof weights] || 0);
  }, 0);
  
  return Math.min(100, totalScore);
}

export function categorizeThreat(threatType: string): string {
  const categories: Record<string, string> = {
    phishing: 'Social Engineering',
    malware: 'Malicious Code',
    exploit: 'Smart Contract Vulnerability',
    scam: 'Fraudulent Activity',
  };
  
  return categories[threatType] || 'Unknown';
}

export function getPriorityLevel(severity: string): number {
  const priorities: Record<string, number> = {
    critical: 1,
    high: 2,
    medium: 3,
    low: 4,
  };
  
  return priorities[severity] || 5;
}

