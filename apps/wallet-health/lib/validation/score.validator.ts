/**
 * Score Validator
 */

export function validateSecurityScore(score: number): {
  isValid: boolean;
  error?: string;
} {
  if (typeof score !== 'number') {
    return { isValid: false, error: 'Score must be a number' };
  }
  
  if (score < 0 || score > 100) {
    return { isValid: false, error: 'Score must be between 0 and 100' };
  }
  
  return { isValid: true };
}

export function validateRiskLevel(level: string): {
  isValid: boolean;
  error?: string;
} {
  const validLevels = ['low', 'medium', 'high', 'critical'];
  
  if (!validLevels.includes(level)) {
    return {
      isValid: false,
      error: `Risk level must be one of: ${validLevels.join(', ')}`,
    };
  }
  
  return { isValid: true };
}

