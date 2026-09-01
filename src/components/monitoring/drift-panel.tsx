'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, TrendingUp, CheckCircle } from 'lucide-react';
import type { DriftEvent } from '@/types/monitoring';

interface DriftPanelProps {
  drifts: DriftEvent[];
  onAcknowledge: (id: string) => void;
}

export function DriftPanel({ drifts, onAcknowledge }: DriftPanelProps) {
  const unacked = drifts.filter((d) => !d.acknowledged);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-orange-500" />
          Drift Detection ({unacked.length} active)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {drifts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No drift detected.</p>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {drifts.map((d) => (
              <div
                key={d.id}
                className={`flex items-start justify-between p-3 border rounded-lg ${d.acknowledged ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start gap-3">
                  {d.direction === 'degrading' ? (
                    <TrendingDown className="h-5 w-5 text-red-500 mt-0.5" />
                  ) : (
                    <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          d.direction === 'degrading'
                            ? 'bg-red-100 text-red-800 border-red-200'
                            : 'bg-green-100 text-green-800 border-green-200'
                        }
                      >
                        {d.direction}
                      </Badge>
                      <Badge variant="outline">{d.drift_type}</Badge>
                      <span className="text-xs text-muted-foreground">{d.metric}</span>
                    </div>
                    <p className="text-sm mt-1">{d.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Baseline: {d.baseline_value} → Current: {d.current_value} (
                      {d.change_pct > 0 ? '+' : ''}
                      {d.change_pct}%)
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(d.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                {!d.acknowledged && (
                  <Button size="sm" variant="ghost" onClick={() => onAcknowledge(d.id)}>
                    <CheckCircle className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
