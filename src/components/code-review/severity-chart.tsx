'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SeverityBreakdown } from '@/types/code-review';

interface SeverityChartProps {
  data: SeverityBreakdown[];
}

export function SeverityChart({ data }: SeverityChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No severity data available
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);

  const getColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Issues by Severity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item) => {
            const percentage = total > 0 ? (item.count / total) * 100 : 0;
            return (
              <div key={item.severity} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize">{item.severity}</span>
                  <span className="text-muted-foreground">
                    {item.count} ({Math.round(percentage)}%)
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getColor(item.severity)} transition-all`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
