'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ModelEval } from '@/types/fine-tuning';

interface EvalComparisonProps {
  latestEval: ModelEval | null;
  loading: boolean;
}

function formatPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function formatMs(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}s`;
  return `${Math.round(n)}ms`;
}

function formatCost(n: number): string {
  if (n >= 0.01) return `$${n.toFixed(3)}`;
  return `$${n.toFixed(4)}`;
}

export function EvalComparison({ latestEval, loading }: EvalComparisonProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Model Evaluation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!latestEval) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Model Evaluation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">No evaluations yet.</p>
        </CardContent>
      </Card>
    );
  }

  const rows = [
    {
      label: 'Pass Rate',
      base: formatPct(latestEval.base_pass_rate),
      ft: formatPct(latestEval.ft_pass_rate),
      positive: latestEval.ft_pass_rate >= latestEval.base_pass_rate,
    },
    {
      label: 'Avg Latency',
      base: formatMs(latestEval.base_avg_latency),
      ft: formatMs(latestEval.ft_avg_latency),
      positive: latestEval.ft_avg_latency <= latestEval.base_avg_latency,
    },
    {
      label: 'Avg Cost',
      base: formatCost(latestEval.base_avg_cost),
      ft: formatCost(latestEval.ft_avg_cost),
      positive: latestEval.ft_avg_cost <= latestEval.base_avg_cost,
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Model Evaluation</CardTitle>
        <Badge
          className={
            latestEval.improvement_pct >= 0
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }
        >
          {latestEval.improvement_pct >= 0 ? '+' : ''}
          {latestEval.improvement_pct.toFixed(1)}% improvement
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          <div>Base: {latestEval.base_model}</div>
          <div>Fine-tuned: {latestEval.fine_tuned_model}</div>
          <div>Eval set: {latestEval.eval_set}</div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 font-medium">Metric</th>
              <th className="text-right py-2 font-medium">Base Model</th>
              <th className="text-right py-2 font-medium">Fine-tuned</th>
              <th className="text-right py-2 font-medium">Delta</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b last:border-0">
                <td className="py-2 font-medium">{row.label}</td>
                <td className="py-2 text-right text-muted-foreground">{row.base}</td>
                <td className="py-2 text-right font-medium">{row.ft}</td>
                <td
                  className={`py-2 text-right font-medium ${row.positive ? 'text-green-600' : 'text-red-600'}`}
                >
                  {row.positive ? '↑' : '↓'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-xs text-muted-foreground">
          {latestEval.total_cases} test cases evaluated
        </div>
      </CardContent>
    </Card>
  );
}
