'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LossPoint } from '@/types/fine-tuning';

interface LossChartProps {
  history: LossPoint[];
  loading: boolean;
}

export function LossChart({ history, loading }: LossChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Training Loss</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Training Loss</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">No loss data yet.</p>
        </CardContent>
      </Card>
    );
  }

  const maxLoss = Math.max(...history.map((p) => p.loss));
  const minLoss = Math.min(...history.map((p) => p.loss));
  const range = maxLoss - minLoss || 1;
  const width = 400;
  const height = 150;
  const padding = 10;

  const points = history.map((p, i) => ({
    x: padding + (i / (history.length - 1 || 1)) * (width - 2 * padding),
    y: padding + ((p.loss - minLoss) / range) * (height - 2 * padding),
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1]?.x ?? 0} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Training Loss</span>
          <span className="text-sm font-normal text-muted-foreground">
            {history.length} steps | Best: {minLoss.toFixed(4)} | Latest:{' '}
            {history[history.length - 1]?.loss.toFixed(4)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40">
          <defs>
            <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((pct) => (
            <line
              key={pct}
              x1={padding}
              y1={padding + pct * (height - 2 * padding)}
              x2={width - padding}
              y2={padding + pct * (height - 2 * padding)}
              stroke="hsl(var(--muted))"
              strokeWidth={0.5}
            />
          ))}
          {/* Area fill */}
          <path d={areaD} fill="url(#lossGradient)" />
          {/* Loss line */}
          <path d={pathD} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} />
          {/* Points */}
          {points.length <= 50 &&
            points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={2} fill="hsl(var(--primary))" />
            ))}
        </svg>
      </CardContent>
    </Card>
  );
}
