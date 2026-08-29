'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, GitBranch, HelpCircle } from 'lucide-react';
import type { QueryUnderstandingResult, QueryComplexity } from '@/types/search-engine';

interface QueryInfoProps {
  info: QueryUnderstandingResult;
}

const COMPLEXITY_CONFIG: Record<QueryComplexity, { label: string; color: string; icon: any }> = {
  simple: { label: 'Simple', color: 'text-green-400 bg-green-400/10', icon: Zap },
  moderate: { label: 'Moderate', color: 'text-blue-400 bg-blue-400/10', icon: Brain },
  complex: { label: 'Complex', color: 'text-purple-400 bg-purple-400/10', icon: GitBranch },
  ambiguous: { label: 'Ambiguous', color: 'text-yellow-400 bg-yellow-400/10', icon: HelpCircle },
};

const STRATEGY_LABELS: Record<string, string> = {
  hyde: 'HyDE (Hypothetical Document)',
  multi_query: 'Multi-Query Expansion',
  decomposition: 'Query Decomposition',
  step_back: 'Step-Back Prompting',
  alias_only: 'Alias Expansion',
};

export function QueryInfo({ info }: QueryInfoProps) {
  const { classified, expanded, rewritten } = info;
  const complexityConfig = COMPLEXITY_CONFIG[classified.complexity];
  const ComplexityIcon = complexityConfig.icon;

  return (
    <Card className="p-4 bg-gray-900 border-gray-700 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">Query Analysis</h3>
        <Badge className={complexityConfig.color}>
          <ComplexityIcon size={12} className="mr-1" />
          {complexityConfig.label}
        </Badge>
      </div>

      {/* Complexity */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-gray-500">Confidence</span>
          <div className="text-white">{(classified.confidence * 100).toFixed(0)}%</div>
        </div>
        <div>
          <span className="text-gray-500">Strategy</span>
          <div className="text-white">{STRATEGY_LABELS[expanded.strategy] || expanded.strategy}</div>
        </div>
      </div>

      {/* Reasoning */}
      <div className="text-xs">
        <span className="text-gray-500">Reasoning: </span>
        <span className="text-gray-300">{classified.reasoning}</span>
      </div>

      {/* Keywords */}
      {classified.keywords.length > 0 && (
        <div>
          <span className="text-xs text-gray-500">Keywords: </span>
          <div className="flex flex-wrap gap-1 mt-1">
            {classified.keywords.map((kw, i) => (
              <Badge key={i} variant="outline" className="text-[10px]">
                {kw}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Expanded Queries */}
      {expanded.expandedQueries.length > 1 && (
        <div>
          <span className="text-xs text-gray-500">Expanded Queries: </span>
          <ul className="mt-1 space-y-1">
            {expanded.expandedQueries.map((q, i) => (
              <li key={i} className="text-xs text-gray-400 pl-2 border-l border-gray-700">
                {i === 0 ? <span className="text-white">{q}</span> : q}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Rewritten */}
      {rewritten.contextInjected && (
        <div className="bg-gray-800 rounded p-2 text-xs">
          <span className="text-gray-500">Rewritten: </span>
          <span className="text-gray-300">{rewritten.rewrittenQuery}</span>
          {rewritten.pronounsResolved.length > 0 && (
            <div className="text-gray-500 mt-1">
              Resolved: {rewritten.pronounsResolved.join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Latency */}
      <div className="text-[10px] text-gray-600">
        Processing: {info.totalLatencyMs}ms
      </div>
    </Card>
  );
}
