/**
 * SecurityScore Component
 */

'use client';

import { SecurityScore as SecurityScoreVO } from '../src/domain/value-objects/security-score.vo';

interface SecurityScoreProps {
  score: number;
}

export function SecurityScore({ score }: SecurityScoreProps) {
  const scoreVO = SecurityScoreVO.create(score);

  return (
    <div className="p-6 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Security Score</h3>
      <div className="flex items-center gap-4">
        <div className={`text-5xl font-bold text-${scoreVO.color}-600`}>
          {score}
        </div>
        <div>
          <p className="text-sm text-gray-500">Risk Level</p>
          <p className="text-lg font-medium capitalize">{scoreVO.riskLevel}</p>
        </div>
      </div>
    </div>
  );
}

