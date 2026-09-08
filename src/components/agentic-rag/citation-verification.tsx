'use client';

import type { HallucinationCheckResult, HallucinationCheckClaim } from '@/hooks/use-agentic-rag';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Shield, CheckCircle, AlertTriangle, XCircle, FileText } from 'lucide-react';

const VERDICT_CONFIG: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  SUPPORTED: { icon: CheckCircle, color: 'text-green-500', label: 'Supported' },
  UNSUPPORTED: { icon: AlertTriangle, color: 'text-yellow-500', label: 'Unsupported' },
  CONTRADICTED: { icon: XCircle, color: 'text-red-500', label: 'Contradicted' },
};

function ClaimCard({ claim, index }: { claim: HallucinationCheckClaim; index: number }) {
  const config = VERDICT_CONFIG[claim.verdict];
  const Icon = config.icon;

  return (
    <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
      <div className="flex items-start gap-2">
        <span className="text-xs font-mono text-muted-foreground mt-0.5">#{index + 1}</span>
        <div className="flex-1">
          <p className="text-sm">{claim.text}</p>
        </div>
        <Badge className={cn('text-xs shrink-0', config.color.replace('text-', 'bg-').replace('500', '500/10'), config.color)}>
          <Icon size={10} className="mr-1" />
          {config.label}
        </Badge>
      </div>

      {claim.sourceQuote && (
        <div className="ml-6 p-2 rounded bg-background text-xs text-muted-foreground italic border-l-2 border-green-500/50">
          <FileText size={10} className="inline mr-1" />
          {claim.sourceQuote}
          {claim.sourceIndex.length > 0 && (
            <span className="ml-1 font-mono">
              (Source {claim.sourceIndex.join(', ')})
            </span>
          )}
        </div>
      )}

      <div className="ml-6 flex items-center gap-2">
        <div className="h-1 w-16 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full',
              claim.confidence > 0.7 ? 'bg-green-500' :
              claim.confidence > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
            )}
            style={{ width: `${claim.confidence * 100}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">{(claim.confidence * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
}

interface CitationVerificationProps {
  result: HallucinationCheckResult;
}

export function CitationVerification({ result }: CitationVerificationProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield size={16} className="text-violet-500" />
          Citation Verification
          {result.hallucinationDetected ? (
            <Badge variant="destructive" className="text-xs ml-auto">Hallucination Detected</Badge>
          ) : (
            <Badge className="text-xs ml-auto bg-green-500/10 text-green-600">Verified</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary stats */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 rounded-lg bg-muted/50">
            <p className="text-lg font-bold">{result.claims.length}</p>
            <p className="text-xs text-muted-foreground">Claims</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <p className="text-lg font-bold text-green-500">
              {result.claims.filter((c) => c.verdict === 'SUPPORTED').length}
            </p>
            <p className="text-xs text-muted-foreground">Supported</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <p className="text-lg font-bold text-yellow-500">{result.unsupportedCount}</p>
            <p className="text-xs text-muted-foreground">Unsupported</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <p className="text-lg font-bold text-red-500">{result.contradictedCount}</p>
            <p className="text-xs text-muted-foreground">Contradicted</p>
          </div>
        </div>

        {/* Overall metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Overall Score</span>
              <span className="text-xs font-mono">{(result.overallScore * 100).toFixed(0)}%</span>
            </div>
            <div className="h-1.5 bg-background rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  result.overallScore >= 0.7 ? 'bg-green-500' :
                  result.overallScore >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                )}
                style={{ width: `${result.overallScore * 100}%` }}
              />
            </div>
          </div>

          <div className="p-2 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Citation Accuracy</span>
              <span className="text-xs font-mono">{(result.citationAccuracy * 100).toFixed(0)}%</span>
            </div>
            <div className="h-1.5 bg-background rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  result.citationAccuracy >= 0.7 ? 'bg-green-500' :
                  result.citationAccuracy >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                )}
                style={{ width: `${result.citationAccuracy * 100}%` }}
              />
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground italic">{result.summary}</p>

        {/* Claims list */}
        {result.claims.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground">Claims Analysis</span>
            {result.claims.map((claim, i) => (
              <ClaimCard key={i} claim={claim} index={i} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
