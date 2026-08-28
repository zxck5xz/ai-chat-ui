'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, FileText, Play, CheckCircle, TrendingUp, FlaskConical } from 'lucide-react';
import type { FineTuningMetrics } from '@/types/fine-tuning';

interface MetricsCardsProps {
  metrics: FineTuningMetrics | null;
  loading: boolean;
}

export function MetricsCards({ metrics, loading }: MetricsCardsProps) {
  const cards = [
    { title: 'Datasets', value: metrics?.total_datasets ?? 0, icon: Database },
    { title: 'Total Entries', value: metrics?.total_entries ?? 0, icon: FileText },
    { title: 'Training Jobs', value: metrics?.total_jobs ?? 0, icon: Play },
    { title: 'Completed', value: metrics?.completed_jobs ?? 0, icon: CheckCircle },
    {
      title: 'Avg Improvement',
      value: `${(metrics?.avg_improvement ?? 0).toFixed(1)}%`,
      icon: TrendingUp,
    },
    { title: 'Active A/B Tests', value: metrics?.active_ab_tests ?? 0, icon: FlaskConical },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
