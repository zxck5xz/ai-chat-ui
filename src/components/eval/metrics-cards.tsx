'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, AlertTriangle, ThumbsUp, ThumbsDown, Activity, Zap } from 'lucide-react';
import type { EvalMetrics } from '@/types/eval';

interface MetricsCardsProps {
  metrics: EvalMetrics | null;
  loading: boolean;
}

export function MetricsCards({ metrics, loading }: MetricsCardsProps) {
  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-20 mb-2" />
              <div className="h-8 bg-muted rounded w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Runs',
      value: metrics.total_runs,
      icon: Activity,
      color: 'text-blue-500',
    },
    {
      title: 'Total Cases',
      value: metrics.total_cases,
      icon: CheckCircle,
      color: 'text-green-500',
    },
    {
      title: 'Avg Accuracy',
      value: `${metrics.avg_accuracy}%`,
      icon: Target,
      color: metrics.avg_accuracy >= 80 ? 'text-green-500' : 'text-yellow-500',
    },
    {
      title: 'Avg Latency',
      value: `${metrics.avg_latency}ms`,
      icon: Clock,
      color: metrics.avg_latency <= 1000 ? 'text-green-500' : 'text-yellow-500',
    },
    {
      title: 'Avg Cost',
      value: `$${metrics.avg_cost.toFixed(4)}`,
      icon: Zap,
      color: 'text-purple-500',
    },
    {
      title: 'Hallucination Rate',
      value: `${metrics.hallucination_rate}%`,
      icon: AlertTriangle,
      color: metrics.hallucination_rate <= 5 ? 'text-green-500' : 'text-red-500',
    },
    {
      title: 'Positive Feedback',
      value: metrics.feedback_positive,
      icon: ThumbsUp,
      color: 'text-green-500',
    },
    {
      title: 'Negative Feedback',
      value: metrics.feedback_negative,
      icon: ThumbsDown,
      color: 'text-red-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
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

function Target({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
