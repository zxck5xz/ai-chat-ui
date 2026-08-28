'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Trace, TraceSpan } from '@/types/observability';

interface TraceDetailProps {
  trace: Trace | null;
  spans: TraceSpan[];
  loading: boolean;
}

function formatDuration(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.round(ms)}ms`;
}

function formatCost(n: number): string {
  if (n >= 0.01) return `$${n.toFixed(3)}`;
  return `$${n.toFixed(4)}`;
}

function statusColor(status: string): string {
  switch (status) {
    case 'ok':
      return 'bg-green-100 text-green-800';
    case 'error':
      return 'bg-red-100 text-red-800';
    case 'timeout':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function TraceDetail({ trace, spans, loading }: TraceDetailProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trace Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!trace) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trace Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Select a trace to view details
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trace Detail</CardTitle>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{trace.operation}</span>
          <Badge className={statusColor(trace.status)}>{trace.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-2 bg-muted rounded">
            <div className="text-xs text-muted-foreground">Spans</div>
            <div className="font-medium">{trace.total_spans}</div>
          </div>
          <div className="p-2 bg-muted rounded">
            <div className="text-xs text-muted-foreground">Latency</div>
            <div className="font-medium">{formatDuration(trace.total_latency_ms)}</div>
          </div>
          <div className="p-2 bg-muted rounded">
            <div className="text-xs text-muted-foreground">Tokens</div>
            <div className="font-medium">{trace.total_tokens.toLocaleString()}</div>
          </div>
          <div className="p-2 bg-muted rounded">
            <div className="text-xs text-muted-foreground">Cost</div>
            <div className="font-medium">{formatCost(trace.total_cost_usd)}</div>
          </div>
        </div>

        {trace.user_id && (
          <div className="text-sm">
            <span className="text-muted-foreground">User:</span> {trace.user_id}
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium mb-2">Spans ({spans.length})</h4>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {spans.map((span) => (
              <div key={span.id} className="p-3 border rounded-lg text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{span.operation}</span>
                  <div className="flex items-center gap-2">
                    {span.model && (
                      <Badge variant="outline" className="text-xs">
                        {span.model}
                      </Badge>
                    )}
                    <Badge className={statusColor(span.status)}>{span.status}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{span.service}</span>
                  <span>{formatDuration(span.latency_ms)}</span>
                  <span>{span.total_tokens.toLocaleString()} tokens</span>
                  <span>{formatCost(span.cost_usd)}</span>
                </div>
                {span.metadata && (
                  <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                    {JSON.stringify(JSON.parse(span.metadata), null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
