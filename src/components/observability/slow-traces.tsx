'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TraceSpan } from '@/types/observability';
import { Badge } from '@/components/ui/badge';

interface SlowTracesProps {
  traces: TraceSpan[];
  loading: boolean;
}

function formatDuration(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.round(ms)}ms`;
}

export function SlowTraces({ traces, loading }: SlowTracesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Slowest Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : traces.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No slow traces detected.</p>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {traces.map((trace) => (
              <div
                key={trace.id}
                className="flex items-center justify-between p-2 border rounded-lg text-sm"
              >
                <div>
                  <span className="font-medium">{trace.operation}</span>
                  {trace.model && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {trace.model}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span>{trace.total_tokens.toLocaleString()} tokens</span>
                  <span className="font-mono text-orange-600 font-medium">
                    {formatDuration(trace.latency_ms)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
