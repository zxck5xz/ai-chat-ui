'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TimeSeriesPoint } from '@/types/eval';

interface TimeseriesChartProps {
  data: TimeSeriesPoint[];
  loading: boolean;
}

export function TimeseriesChart({ data, loading }: TimeseriesChartProps) {
  if (loading || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Metrics Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            {loading ? 'Loading...' : 'No data available'}
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxAccuracy = Math.max(...data.map(d => d.accuracy), 100);
  const maxLatency = Math.max(...data.map(d => d.latency), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Metrics Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Accuracy Chart */}
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">Accuracy (%)</div>
            <div className="h-32 flex items-end gap-1">
              {data.map((point, i) => (
                <div
                  key={i}
                  className="flex-1 bg-green-500 rounded-t"
                  style={{ height: `${(point.accuracy / maxAccuracy) * 100}%` }}
                  title={`${point.date}: ${point.accuracy.toFixed(1)}%`}
                />
              ))}
            </div>
          </div>

          {/* Latency Chart */}
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">Avg Latency (ms)</div>
            <div className="h-32 flex items-end gap-1">
              {data.map((point, i) => (
                <div
                  key={i}
                  className="flex-1 bg-blue-500 rounded-t"
                  style={{ height: `${(point.latency / maxLatency) * 100}%` }}
                  title={`${point.date}: ${point.latency.toFixed(0)}ms`}
                />
              ))}
            </div>
          </div>

          {/* X-axis labels */}
          <div className="flex gap-1 text-xs text-muted-foreground">
            {data.map((point, i) => (
              <div key={i} className="flex-1 text-center truncate">
                {point.date.slice(5)}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
