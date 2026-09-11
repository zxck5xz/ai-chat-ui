'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DebateMetrics as MetricsType } from '@/types/debate';

interface MetricsDashboardProps {
  metrics: MetricsType;
}

export function MetricsDashboard({ metrics }: MetricsDashboardProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{metrics.total_debates}</div>
            <div className="text-xs text-muted-foreground">Total Debates</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{(metrics.avg_duration_ms / 1000).toFixed(1)}s</div>
            <div className="text-xs text-muted-foreground">Avg Duration</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {(metrics.avg_accuracy_rate * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground">Avg Accuracy</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{metrics.avg_claims_per_debate.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">Avg Claims</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Format Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(metrics.format_breakdown).map(([format, count]) => (
                <div key={format} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{format.replace('_', ' ')}</span>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Position Win Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(metrics.position_win_rates).map(([position, rate]) => (
                <div key={position} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{position}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(rate as number) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-10 text-right">
                      {((rate as number) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {metrics.recent_debates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Debates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.recent_debates.map((debate) => (
                <div
                  key={debate.id}
                  className="flex items-center justify-between p-2 rounded border text-sm"
                >
                  <span className="truncate flex-1">{debate.question}</span>
                  <div className="flex items-center gap-2 ml-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        debate.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {debate.status}
                    </span>
                    <span className="text-muted-foreground">
                      {(debate.duration_ms / 1000).toFixed(1)}s
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
