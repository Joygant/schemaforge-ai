import React from 'react';
import { Globe, Tag, TrendingUp, AlertCircle } from 'lucide-react';
import type { BusinessSummary as BusinessSummaryType, QualityScore } from '../../types';

interface Props {
  summary: BusinessSummaryType;
  qualityScore: QualityScore;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-500' : 'bg-red-400';
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{value}/100</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function BusinessSummary({ summary, qualityScore }: Props) {
  return (
    <div className="p-6 space-y-6">
      {/* Company header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">{summary.companyName}</h2>
        <p className="text-adobe-red font-medium">{summary.industry} Industry</p>
      </div>

      {/* Executive summary */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-sm text-gray-700 leading-relaxed">{summary.executiveSummary}</p>
      </div>

      {/* Channels grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-adobe-blue" />
            <span className="text-sm font-semibold text-gray-700">Channels</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {(summary.channels.length ? summary.channels : ['Not specified']).map(c => (
              <span
                key={c}
                className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-semibold text-gray-700">Marketing</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {(summary.marketingChannels.length
              ? summary.marketingChannels
              : ['Not specified']
            ).map(c => (
              <span
                key={c}
                className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Data goals */}
      {summary.dataGoals.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm font-semibold text-gray-700">Data Goals</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {summary.dataGoals.map(goal => (
              <span
                key={goal}
                className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
              >
                {goal}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quality score breakdown */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Schema Quality Score
        </h3>
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-gray-900">{qualityScore.overall}</div>
            <div className="text-sm text-gray-500">out of 100</div>
          </div>
          <ScoreBar label="Identity Completeness" value={qualityScore.breakdown.identityCompleteness} />
          <ScoreBar label="Profile Readiness" value={qualityScore.breakdown.profileReadiness} />
          <ScoreBar label="Personalization Readiness" value={qualityScore.breakdown.personalizationReadiness} />
          <ScoreBar label="Activation Readiness" value={qualityScore.breakdown.activationReadiness} />
          <ScoreBar label="Duplication Risk Score" value={qualityScore.breakdown.duplicationRisk} />
        </div>
      </div>

      {/* Recommendations */}
      {qualityScore.recommendations.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-500" /> Recommendations
          </h3>
          <ul className="space-y-2">
            {qualityScore.recommendations.map((rec, i) => (
              <li
                key={i}
                className="flex gap-2 text-sm text-gray-600 bg-yellow-50 border border-yellow-100 rounded-lg p-3"
              >
                <span className="text-yellow-500 flex-shrink-0">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
