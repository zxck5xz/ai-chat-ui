'use client';

import type { MCPDashboardStats } from '@/types/mcp';

interface StatsCardsProps {
  stats: MCPDashboardStats | null;
}

export function StatsCards({ stats }: StatsCardsProps) {
  if (!stats) return null;

  const cards = [
    { label: 'Total Servers', value: stats.totalServers, color: 'text-blue-500' },
    { label: 'Connected', value: stats.connectedServers, color: 'text-green-500' },
    { label: 'Total Tools', value: stats.totalTools, color: 'text-purple-500' },
    { label: 'Total Calls', value: stats.totalCalls, color: 'text-orange-500' },
    {
      label: 'Success Rate',
      value: `${stats.successRate.toFixed(1)}%`,
      color:
        stats.successRate >= 95
          ? 'text-green-500'
          : stats.successRate >= 80
            ? 'text-yellow-500'
            : 'text-red-500',
    },
    {
      label: 'Avg Latency',
      value: `${stats.avgLatencyMs.toFixed(0)}ms`,
      color:
        stats.avgLatencyMs < 500
          ? 'text-green-500'
          : stats.avgLatencyMs < 1000
            ? 'text-yellow-500'
            : 'text-red-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="p-4 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground">{card.label}</p>
          <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
