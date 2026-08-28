'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LatencyPercentile } from '@/types/observability';

interface LatencyTableProps {
  percentiles: LatencyPercentile[];
  loading: boolean;
}

function formatMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.round(ms)}ms`;
}

export function LatencyTable({ percentiles, loading }: LatencyTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Latency Percentiles</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : percentiles.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No latency data yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Model</th>
                  <th className="text-right py-2 font-medium">P50</th>
                  <th className="text-right py-2 font-medium">P90</th>
                  <th className="text-right py-2 font-medium">P95</th>
                  <th className="text-right py-2 font-medium">P99</th>
                  <th className="text-right py-2 font-medium">Avg</th>
                  <th className="text-right py-2 font-medium">Requests</th>
                </tr>
              </thead>
              <tbody>
                {percentiles.map((p) => (
                  <tr key={p.model} className="border-b last:border-0">
                    <td className="py-2 font-medium">{p.model}</td>
                    <td className="py-2 text-right">{formatMs(p.p50)}</td>
                    <td className="py-2 text-right">{formatMs(p.p90)}</td>
                    <td className="py-2 text-right text-orange-600">{formatMs(p.p95)}</td>
                    <td className="py-2 text-right text-red-600">{formatMs(p.p99)}</td>
                    <td className="py-2 text-right">{formatMs(p.avg)}</td>
                    <td className="py-2 text-right text-muted-foreground">
                      {p.count.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
