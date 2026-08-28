'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Coins, Gauge, AlertTriangle, TrendingUp, Zap } from 'lucide-react';
import type { ObservabilityMetrics } from '@/types/observability';

interface MetricsCardsProps {
  metrics: ObservabilityMetrics | null;
  loading: boolean;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatCost(n: number): string {
  if (n >= 1) return `$${n.toFixed(2)}`;
  if (n >= 0.01) return `$${n.toFixed(3)}`;
  return `$${n.toFixed(4)}`;
}

export function MetricsCards({ metrics, loading }: MetricsCardsProps) {
  const cards = [
    {
      title: 'Total Traces',
      value: metrics?.total_traces ?? 0,
      icon: Activity,
      format: formatNumber,
    },
    {
      title: 'Total Spans',
      value: metrics?.total_spans ?? 0,
      icon: Zap,
      format: formatNumber,
    },
    {
      title: 'Total Tokens',
      value: metrics?.total_tokens ?? 0,
      icon: TrendingUp,
      format: formatNumber,
    },
    {
      title: 'Total Cost',
      value: metrics?.total_cost_usd ?? 0,
      icon: Coins,
      format: formatCost,
    },
    {
      title: 'Avg Latency',
      value: metrics?.avg_latency_ms ?? 0,
      icon: Gauge,
      format: (n: number) => `${Math.round(n)}ms`,
    },
    {
      title: 'Error Rate',
      value: metrics?.error_rate ?? 0,
      icon: AlertTriangle,
      format: (n: number) => `${n.toFixed(1)}%`,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : card.format(card.value)}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
