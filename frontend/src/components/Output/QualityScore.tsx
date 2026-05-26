import React from 'react';
import type { QualityScore as QualityScoreType } from '../../types';

interface Props {
  score: QualityScoreType;
}

export default function QualityScore({ score }: Props) {
  const color =
    score.overall >= 80
      ? 'text-green-600'
      : score.overall >= 60
      ? 'text-yellow-600'
      : 'text-red-600';

  return (
    <div className="p-4 text-center">
      <div className={`text-5xl font-bold ${color}`}>{score.overall}</div>
      <div className="text-gray-500 text-sm mt-1">Schema Quality Score</div>
      {score.recommendations.length > 0 && (
        <ul className="mt-4 text-left space-y-1">
          {score.recommendations.map((rec, i) => (
            <li key={i} className="text-xs text-gray-600 flex gap-2">
              <span className="text-yellow-500 flex-shrink-0">•</span>
              {rec}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
