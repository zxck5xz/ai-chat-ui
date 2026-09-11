'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { FactCheckResult, ClaimVerdict } from '@/types/debate';

const VERDICT_COLORS: Record<ClaimVerdict, string> = {
  supported: 'bg-green-100 text-green-800',
  unsupported: 'bg-yellow-100 text-yellow-800',
  contradicted: 'bg-red-100 text-red-800',
  unverifiable: 'bg-gray-100 text-gray-800',
};

interface FactCheckPanelProps {
  factCheck: FactCheckResult;
}

export function FactCheckPanel({ factCheck }: FactCheckPanelProps) {
  const {
    total_claims,
    supported,
    unsupported,
    contradicted,
    unverifiable,
    accuracy_rate,
    claims,
  } = factCheck;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Fact-Check Results</span>
          <Badge variant={accuracy_rate >= 0.7 ? 'default' : 'destructive'}>
            {(accuracy_rate * 100).toFixed(0)}% Accuracy
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 rounded-lg bg-green-50">
            <div className="text-2xl font-bold text-green-600">{supported}</div>
            <div className="text-xs text-muted-foreground">Supported</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-yellow-50">
            <div className="text-2xl font-bold text-yellow-600">{unsupported}</div>
            <div className="text-xs text-muted-foreground">Unsupported</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-red-50">
            <div className="text-2xl font-bold text-red-600">{contradicted}</div>
            <div className="text-xs text-muted-foreground">Contradicted</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-50">
            <div className="text-2xl font-bold text-gray-600">{unverifiable}</div>
            <div className="text-xs text-muted-foreground">Unverifiable</div>
          </div>
        </div>

        {claims.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Claim Details ({total_claims} total)
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {claims.map((claim) => (
                <div key={claim.id} className="text-xs p-2 rounded border">
                  <div className="flex items-start gap-2">
                    <Badge className={VERDICT_COLORS[claim.verdict]} variant="outline">
                      {claim.verdict}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm">{claim.text}</p>
                      {claim.source && (
                        <p className="text-muted-foreground mt-1">Source: {claim.source}</p>
                      )}
                      <p className="text-muted-foreground mt-1">{claim.explanation}</p>
                    </div>
                    <span className="text-muted-foreground">
                      {(claim.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
