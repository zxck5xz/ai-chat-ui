'use client';

import type { MemoryMetrics, ForgettingStats } from '../../types/memory';

interface MemoryMetricsProps {
  metrics: MemoryMetrics | null;
  forgettingStats: ForgettingStats | null;
}

export function MemoryMetricsDashboard({ metrics, forgettingStats }: MemoryMetricsProps) {
  if (!metrics) return <div className="text-center py-8 text-gray-500">Loading metrics...</div>;

  const cards = [
    {
      label: 'Episodic',
      value: metrics.total_episodic,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Semantic',
      value: metrics.total_semantic,
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      label: 'Graph Nodes',
      value: metrics.total_nodes,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      label: 'Graph Edges',
      value: metrics.total_edges,
      color: 'text-red-600',
      bg: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      label: 'Avg Strength',
      value: metrics.avg_episodic_strength,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      suffix: '',
    },
    {
      label: 'Total Accesses',
      value: metrics.total_accesses,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50 dark:bg-cyan-900/20',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((card) => (
          <div key={card.label} className={`${card.bg} rounded-lg p-3 text-center`}>
            <div className={`text-2xl font-bold ${card.color}`}>
              {typeof card.value === 'number'
                ? card.value.toFixed
                  ? card.value.toFixed(2)
                  : card.value
                : card.value}
              {card.suffix !== undefined ? card.suffix : ''}
            </div>
            <div className="text-xs text-gray-500 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Memory Types Breakdown */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-3">Memory Types</h3>
          <div className="space-y-2">
            {metrics.memory_types_breakdown.map((item) => {
              const total = metrics.memory_types_breakdown.reduce((s, x) => s + x.count, 0);
              const pct = total > 0 ? (item.count / total) * 100 : 0;
              const color =
                item.type === 'episodic'
                  ? 'bg-blue-500'
                  : item.type === 'semantic'
                    ? 'bg-purple-500'
                    : 'bg-amber-500';
              return (
                <div key={item.type}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="capitalize">{item.type.replace('_', ' ')}</span>
                    <span className="text-gray-500">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className={`${color} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Forgetting Curve Stats */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-3">Forgetting Curve</h3>
          {forgettingStats ? (
            <div className="space-y-3">
              {forgettingStats.episodic && (
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-1">Episodic</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Avg:</span>{' '}
                      {(forgettingStats.episodic.avg_strength ?? 0).toFixed(3)}
                    </div>
                    <div>
                      <span className="text-gray-500">Min:</span>{' '}
                      {(forgettingStats.episodic.min_strength ?? 0).toFixed(3)}
                    </div>
                    <div>
                      <span className="text-gray-500">Weak:</span>{' '}
                      {forgettingStats.episodic.weak_count ?? 0}
                    </div>
                  </div>
                </div>
              )}
              {forgettingStats.semantic && (
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-1">Semantic</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Avg:</span>{' '}
                      {(forgettingStats.semantic.avg_strength ?? 0).toFixed(3)}
                    </div>
                    <div>
                      <span className="text-gray-500">Min:</span>{' '}
                      {(forgettingStats.semantic.min_strength ?? 0).toFixed(3)}
                    </div>
                    <div>
                      <span className="text-gray-500">Weak:</span>{' '}
                      {forgettingStats.semantic.weak_count ?? 0}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-gray-500">No forgetting stats available</div>
          )}
        </div>
      </div>

      {/* Recent Accesses */}
      {metrics.recent_accesses && metrics.recent_accesses.length > 0 && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-3">Recent Memory Accesses</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-1 font-medium text-gray-500">Type</th>
                  <th className="text-left py-1 font-medium text-gray-500">Query</th>
                  <th className="text-left py-1 font-medium text-gray-500">Score</th>
                  <th className="text-left py-1 font-medium text-gray-500">Time</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recent_accesses.map((access, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-1.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          access.memory_type === 'episodic'
                            ? 'bg-blue-100 text-blue-700'
                            : access.memory_type === 'semantic'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {access.memory_type}
                      </span>
                    </td>
                    <td className="py-1.5 max-w-[200px] truncate">{access.query}</td>
                    <td className="py-1.5">{access.relevance_score.toFixed(3)}</td>
                    <td className="py-1.5 text-gray-500">
                      {new Date(access.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
