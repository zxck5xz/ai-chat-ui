'use client';

import type { ModelVersioningStats } from '@/types/model-versioning';

interface StatsCardsProps {
  stats: ModelVersioningStats | null;
}

export function StatsCards({ stats }: StatsCardsProps) {
  if (!stats) return null;

  const cards = [
    { label: 'Total Versions', value: stats.totalVersions, color: 'text-blue-500' },
    { label: 'Active Versions', value: stats.activeVersions, color: 'text-green-500' },
    { label: 'Total Deployments', value: stats.totalDeployments, color: 'text-purple-500' },
    { label: 'Active Deployments', value: stats.activeDeployments, color: 'text-emerald-500' },
    { label: 'Total Rollbacks', value: stats.totalRollbacks, color: 'text-orange-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="p-4 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground">{card.label}</p>
          <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
