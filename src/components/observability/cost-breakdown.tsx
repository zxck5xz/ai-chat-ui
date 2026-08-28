'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CostByModel } from '@/types/observability';

interface CostBreakdownProps {
  models: CostByModel[];
  loading: boolean;
}

function formatCost(n: number): string {
  if (n >= 1) return `$${n.toFixed(2)}`;
  if (n >= 0.01) return `$${n.toFixed(3)}`;
  return `$${n.toFixed(4)}`;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function CostBreakdown({ models, loading }: CostBreakdownProps) {
  const totalCost = models.reduce((sum, m) => sum + m.cost_usd, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost by Model</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : models.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No cost data yet.</p>
        ) : (
          <div className="space-y-3">
            {models.map((model) => {
              const pct = totalCost > 0 ? (model.cost_usd / totalCost) * 100 : 0;
              return (
                <div key={model.model}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{model.model}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatCost(model.cost_usd)} ({formatTokens(model.tokens)} tokens)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total</span>
                <span className="text-sm font-bold">{formatCost(totalCost)}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
