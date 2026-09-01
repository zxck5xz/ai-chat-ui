'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import type { AnomalyEvent } from '@/types/monitoring';

interface AnomalyPanelProps {
  anomalies: AnomalyEvent[];
  onAcknowledge: (id: string) => void;
}

export function AnomalyPanel({ anomalies, onAcknowledge }: AnomalyPanelProps) {
  const unacked = anomalies.filter((a) => !a.acknowledged);

  const severityColor = (s: string) => {
    switch (s) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const typeIcon = (t: string) => {
    switch (t) {
      case 'spike':
        return '↑';
      case 'drop':
        return '↓';
      case 'drift':
        return '↕';
      default:
        return '•';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          Anomaly Detection ({unacked.length} active)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {anomalies.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No anomalies detected.</p>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {anomalies.map((a) => (
              <div
                key={a.id}
                className={`flex items-start justify-between p-3 border rounded-lg ${a.acknowledged ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">{typeIcon(a.anomaly_type)}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className={severityColor(a.severity)}>{a.severity}</Badge>
                      <Badge variant="outline">{a.anomaly_type}</Badge>
                      <span className="text-xs text-muted-foreground">{a.metric}</span>
                    </div>
                    <p className="text-sm mt-1">{a.description}</p>
                    {a.z_score !== null && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Z-score: {a.z_score} | Expected: [{a.expected_min} — {a.expected_max}]
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(a.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                {!a.acknowledged && (
                  <Button size="sm" variant="ghost" onClick={() => onAcknowledge(a.id)}>
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
