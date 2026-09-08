'use client';

import type { ConfidenceEvaluation } from '@/types/agentic-rag';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

function GaugeRing({ score }: { score: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score);
  const color = score >= 0.7 ? '#22c55e' : score >= 0.4 ? '#eab308' : '#ef4444';

  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
        <circle
          cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold" style={{ color }}>{(score * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
}

export function ConfidenceGauge({ confidence }: { confidence: ConfidenceEvaluation }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield size={16} className="text-orange-500" />
          Confidence Evaluation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <GaugeRing score={confidence.score} />
          <div className="flex-1 space-y-2">
            <p className="text-xs text-muted-foreground">{confidence.reasoning}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            {confidence.hasHallucination ? (
              <AlertTriangle size={14} className="text-red-500 shrink-0" />
            ) : (
              <CheckCircle size={14} className="text-green-500 shrink-0" />
            )}
            <div>
              <p className="text-xs font-medium">Hallucination</p>
              <p className="text-xs text-muted-foreground">{confidence.hasHallucination ? 'Detected' : 'None'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <div className={cn(
              'w-3.5 h-3.5 rounded-full shrink-0',
              confidence.contradictionsFound > 0 ? 'bg-red-500' : 'bg-green-500'
            )} />
            <div>
              <p className="text-xs font-medium">Contradictions</p>
              <p className="text-xs text-muted-foreground">{confidence.contradictionsFound} found</p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Citation Coverage</span>
            <span className="text-xs font-mono">{(confidence.citationCoverage * 100).toFixed(0)}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                confidence.citationCoverage >= 0.6 ? 'bg-green-500' :
                confidence.citationCoverage >= 0.3 ? 'bg-yellow-500' : 'bg-red-500'
              )}
              style={{ width: `${confidence.citationCoverage * 100}%` }}
            />
          </div>
        </div>

        {(confidence.needsRegeneration || confidence.needsMoreRetrieval) && (
          <div className="flex gap-2">
            {confidence.needsRegeneration && (
              <Badge variant="destructive" className="text-xs">Needs Regeneration</Badge>
            )}
            {confidence.needsMoreRetrieval && (
              <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">Needs More Retrieval</Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
