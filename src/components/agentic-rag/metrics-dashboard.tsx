'use client';

import type { AgenticRAGMetrics } from '@/hooks/use-agentic-rag';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Brain, Clock, Zap, AlertTriangle, RefreshCw } from 'lucide-react';

interface MetricsDashboardProps {
  metrics: AgenticRAGMetrics;
}

export function MetricsDashboard({ metrics }: MetricsDashboardProps) {
  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={14} className="text-blue-500" />
              <span className="text-xs text-muted-foreground">Total Runs</span>
            </div>
            <p className="text-2xl font-bold">{metrics.totalRuns}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain size={14} className="text-violet-500" />
              <span className="text-xs text-muted-foreground">Avg Confidence</span>
            </div>
            <p className="text-2xl font-bold">{(metrics.avgConfidence * 100).toFixed(0)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className="text-green-500" />
              <span className="text-xs text-muted-foreground">Avg Latency</span>
            </div>
            <p className="text-2xl font-bold">{metrics.avgLatencyMs.toFixed(0)}ms</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-orange-500" />
              <span className="text-xs text-muted-foreground">Avg Rounds</span>
            </div>
            <p className="text-2xl font-bold">{metrics.avgRounds.toFixed(1)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-red-500" />
              <span className="text-xs text-muted-foreground">Hallucination Rate</span>
            </div>
            <p className="text-2xl font-bold">{(metrics.hallucinationRate * 100).toFixed(0)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw size={14} className="text-cyan-500" />
              <span className="text-xs text-muted-foreground">Correction Rate</span>
            </div>
            <p className="text-2xl font-bold">{(metrics.correctionRate * 100).toFixed(0)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Confidence Distribution */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Confidence Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics.confidenceDistribution.map((dist) => (
              <div key={dist.range} className="flex items-center gap-3">
                <span className="text-xs font-mono w-12 text-muted-foreground">{dist.range}</span>
                <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/60 rounded-full transition-all"
                    style={{
                      width: `${metrics.totalRuns > 0 ? (dist.count / metrics.totalRuns) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-mono w-8 text-right">{dist.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Intent & Strategy breakdown */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Runs by Intent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {Object.entries(metrics.runsByIntent)
                .sort((a, b) => b[1] - a[1])
                .map(([intent, count]) => (
                  <div key={intent} className="flex items-center justify-between text-xs">
                    <Badge variant="outline" className="text-xs">{intent}</Badge>
                    <span className="font-mono">{count}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Runs by Strategy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {Object.entries(metrics.runsByStrategy)
                .sort((a, b) => b[1] - a[1])
                .map(([strategy, count]) => (
                  <div key={strategy} className="flex items-center justify-between text-xs">
                    <Badge variant="outline" className="text-xs">{strategy}</Badge>
                    <span className="font-mono">{count}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent runs */}
      {metrics.recentRuns.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Recent Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.recentRuns.map((run) => (
                <div key={run.id} className="flex items-center justify-between text-xs p-2 rounded bg-muted/30">
                  <span className="truncate flex-1">{run.query}</span>
                  <div className="flex items-center gap-2 ml-2">
                    <Badge variant={run.confidence.score >= 0.7 ? 'default' : 'destructive'} className="text-xs">
                      {(run.confidence.score * 100).toFixed(0)}%
                    </Badge>
                    <span className="text-muted-foreground">{run.totalRounds}r</span>
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
