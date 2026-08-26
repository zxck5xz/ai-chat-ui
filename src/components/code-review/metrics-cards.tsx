'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import type { ReviewMetrics } from '@/types/code-review';

interface MetricsCardsProps {
  metrics: ReviewMetrics | null;
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  if (!metrics) return null;

  const cards = [
    {
      title: 'Total Reviews',
      value: metrics.total_reviews,
      icon: Code,
      color: 'text-blue-500',
    },
    {
      title: 'Completed',
      value: metrics.completed,
      icon: CheckCircle,
      color: 'text-green-500',
    },
    {
      title: 'Failed',
      value: metrics.failed,
      icon: XCircle,
      color: 'text-red-500',
    },
    {
      title: 'Total Issues',
      value: metrics.total_issues || 0,
      icon: AlertTriangle,
      color: 'text-yellow-500',
    },
    {
      title: 'Avg Issues/Review',
      value: metrics.avg_issues ? Math.round(metrics.avg_issues * 10) / 10 : 0,
      icon: AlertTriangle,
      color: 'text-orange-500',
    },
    {
      title: 'Avg Latency',
      value: metrics.avg_latency ? `${Math.round(metrics.avg_latency)}ms` : 'N/A',
      icon: Clock,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
