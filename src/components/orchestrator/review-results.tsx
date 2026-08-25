'use client';

import { ShieldCheck, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import type { ReviewResult } from '@/types/agents';

interface ReviewResultsProps {
  result: ReviewResult;
}

const severityConfig = {
  error: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
  warning: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50' },
};

export function ReviewResults({ result }: ReviewResultsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className={result.passed ? 'text-green-500' : 'text-red-500'} />
          <span className="font-medium">Review Score</span>
        </div>
        <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
          {result.score}/100
        </div>
        {result.passed ? (
          <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">Passed</span>
        ) : (
          <span className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">Failed</span>
        )}
      </div>

      {/* Accessibility & Performance Scores */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded-lg p-3">
          <div className="text-sm text-muted-foreground">Accessibility</div>
          <div className={`text-xl font-bold ${getScoreColor(result.accessibility.score)}`}>
            {result.accessibility.score}/100
          </div>
        </div>
        <div className="border rounded-lg p-3">
          <div className="text-sm text-muted-foreground">Performance</div>
          <div className={`text-xl font-bold ${getScoreColor(result.performance.score)}`}>
            {result.performance.score}/100
          </div>
        </div>
      </div>

      {/* Issues */}
      {result.issues.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Issues ({result.issues.length})</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {result.issues.map((issue, index) => {
              const config = severityConfig[issue.severity];
              const Icon = config.icon;
              return (
                <div key={index} className={`flex items-start gap-2 p-2 rounded ${config.bg}`}>
                  <Icon size={14} className={`${config.color} mt-0.5 shrink-0`} />
                  <div className="text-sm">
                    <span className="font-medium capitalize">{issue.category}</span>
                    <span className="text-muted-foreground ml-2">{issue.message}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {result.suggestions.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Suggestions</h4>
          <ul className="space-y-1">
            {result.suggestions.map((suggestion, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" />
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
