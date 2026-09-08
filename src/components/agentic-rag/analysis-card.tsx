'use client';

import type { QueryAnalysis } from '@/types/agentic-rag';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Brain, Zap, Target, Layers, ArrowRight } from 'lucide-react';

const INTENT_COLORS: Record<string, string> = {
  factual: 'bg-blue-500/10 text-blue-600',
  analytical: 'bg-violet-500/10 text-violet-600',
  comparative: 'bg-orange-500/10 text-orange-600',
  exploratory: 'bg-cyan-500/10 text-cyan-600',
  creative: 'bg-pink-500/10 text-pink-600',
  chitchat: 'bg-gray-500/10 text-gray-600',
  code: 'bg-green-500/10 text-green-600',
  math: 'bg-yellow-500/10 text-yellow-600',
};

const DECISION_COLORS: Record<string, string> = {
  skip: 'bg-yellow-500/10 text-yellow-600',
  retrieve: 'bg-green-500/10 text-green-600',
  ambiguous: 'bg-orange-500/10 text-orange-600',
};

const STRATEGY_LABELS: Record<string, string> = {
  single: 'Single Retrieval',
  multi_round: 'Multi-Round',
  decompose: 'Query Decomposition',
  step_back: 'Step-Back',
};

export function AnalysisCard({ analysis }: { analysis: QueryAnalysis }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Brain size={16} className="text-violet-500" />
          Query Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Decision */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Retrieval Decision</span>
          <Badge className={cn('font-medium', DECISION_COLORS[analysis.needsRetrieval])}>
            {analysis.needsRetrieval.toUpperCase()}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Confidence</span>
          <span className="text-sm font-mono">{(analysis.decisionConfidence * 100).toFixed(0)}%</span>
        </div>

        <p className="text-xs text-muted-foreground italic">{analysis.decisionReasoning}</p>

        {/* Intent & Complexity */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="flex items-center gap-1.5 mb-1">
              <Target size={12} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Intent</span>
            </div>
            <Badge className={cn('text-xs', INTENT_COLORS[analysis.intent])}>
              {analysis.intent}
            </Badge>
          </div>

          <div className="p-2 rounded-lg bg-muted/50">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap size={12} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Complexity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    analysis.complexity > 0.7 ? 'bg-red-500' :
                    analysis.complexity > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                  )}
                  style={{ width: `${analysis.complexity * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono">{(analysis.complexity * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Strategy */}
        <div className="p-2 rounded-lg bg-muted/50">
          <div className="flex items-center gap-1.5 mb-1">
            <Layers size={12} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Retrieval Strategy</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{STRATEGY_LABELS[analysis.retrievalStrategy]}</span>
            <span className="text-xs text-muted-foreground">
              Top-K: {analysis.suggestedTopK} | Max Rounds: {analysis.maxRetrievalRounds}
            </span>
          </div>
        </div>

        {/* Sub-questions */}
        {analysis.subQuestions.length > 0 && (
          <div>
            <span className="text-xs text-muted-foreground mb-1.5 block">Sub-questions</span>
            <div className="space-y-1">
              {analysis.subQuestions.map((q, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <ArrowRight size={12} className="text-muted-foreground mt-0.5 shrink-0" />
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Keywords */}
        {analysis.keywords.length > 0 && (
          <div>
            <span className="text-xs text-muted-foreground mb-1.5 block">Keywords</span>
            <div className="flex flex-wrap gap-1">
              {analysis.keywords.map((kw, i) => (
                <Badge key={i} variant="outline" className="text-xs">{kw}</Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
