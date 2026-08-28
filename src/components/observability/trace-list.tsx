'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Trace } from '@/types/observability';
import { Badge } from '@/components/ui/badge';

interface TraceListProps {
  traces: Trace[];
  loading: boolean;
  onSelect: (trace: Trace) => void;
  selectedId?: string;
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
    case 'partial':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function TraceList({ traces, loading, onSelect, selectedId }: TraceListProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Traces</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Traces ({traces.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {traces.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No traces recorded yet.
            </p>
          )}
          {traces.map((trace) => (
            <div
              key={trace.id}
              className={`p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                selectedId === trace.id ? 'border-primary bg-accent' : ''
              }`}
              onClick={() => onSelect(trace)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{trace.operation}</span>
                <Badge className={statusColor(trace.status)}>{trace.status}</Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{trace.total_spans} spans</span>
                <span>{formatDuration(trace.total_latency_ms)}</span>
                <span>{trace.total_tokens.toLocaleString()} tokens</span>
                <span>{formatCost(trace.total_cost_usd)}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(trace.started_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
