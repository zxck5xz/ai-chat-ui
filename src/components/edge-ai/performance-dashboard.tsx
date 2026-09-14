'use client';

import type { PerformanceMetrics, DeviceCapabilities, InferenceResult } from '@/types/edge-ai';

interface PerformanceDashboardProps {
  metrics: PerformanceMetrics | null;
  device: DeviceCapabilities | null;
  history: InferenceResult[];
}

export function PerformanceDashboard({ metrics, device, history }: PerformanceDashboardProps) {
  const formatSize = (mb: number): string => {
    if (mb >= 1000) return `${(mb / 1000).toFixed(1)}GB`;
    return `${mb}MB`;
  };

  const statCards = [
    {
      label: 'Total Inferences',
      value: metrics?.totalInferences ?? 0,
      icon: '📊',
      color: 'text-blue-500',
    },
    {
      label: 'Avg Tokens/sec',
      value: (metrics?.avgTokensPerSecond ?? 0).toFixed(1),
      icon: '⚡',
      color: 'text-green-500',
    },
    {
      label: 'Avg Latency',
      value: `${metrics?.avgLatencyMs ?? 0}ms`,
      icon: '⏱️',
      color: 'text-purple-500',
    },
    {
      label: 'Avg Memory',
      value: formatSize(metrics?.avgMemoryMB ?? 0),
      icon: '💾',
      color: 'text-orange-500',
    },
    {
      label: 'Local',
      value: metrics?.localInferences ?? 0,
      icon: '🖥️',
      color: 'text-emerald-500',
    },
    {
      label: 'Cloud',
      value: metrics?.cloudInferences ?? 0,
      icon: '☁️',
      color: 'text-sky-500',
    },
    {
      label: 'Hybrid',
      value: metrics?.hybridInferences ?? 0,
      icon: '🔀',
      color: 'text-amber-500',
    },
    {
      label: 'Models Loaded',
      value: metrics?.modelsLoaded ?? 0,
      icon: '📦',
      color: 'text-pink-500',
    },
  ];

  const recentHistory = history.slice(0, 10);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Performance Overview</h3>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {statCards.map((card) => (
          <div key={card.label} className="p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs">{card.icon}</span>
              <span className="text-[10px] text-muted-foreground">{card.label}</span>
            </div>
            <div className={`text-lg font-semibold ${card.color}`}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Device Info */}
      {device && (
        <div className="p-3 rounded-lg border bg-card">
          <h4 className="text-xs font-medium mb-2">Device Capabilities</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground">GPU</span>
              <p className="font-medium">
                {device.webgpuSupported ? 'WebGPU Available' : 'Not Available'}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">GPU Memory</span>
              <p className="font-medium">
                {device.gpuMemoryMB > 0 ? formatSize(device.gpuMemoryMB) : 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Total RAM</span>
              <p className="font-medium">{formatSize(device.totalRAMMB)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">CPU Cores</span>
              <p className="font-medium">{device.cpuCores}</p>
            </div>
          </div>
        </div>
      )}

      {/* Inference by Model */}
      {metrics?.infByModel && Object.keys(metrics.infByModel).length > 0 && (
        <div className="p-3 rounded-lg border bg-card">
          <h4 className="text-xs font-medium mb-2">Inferences by Model</h4>
          <div className="space-y-1.5">
            {Object.entries(metrics.infByModel)
              .sort(([, a], [, b]) => b - a)
              .map(([model, count]) => {
                const total = metrics.totalInferences;
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={model}>
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="truncate">{model}</span>
                      <span className="text-muted-foreground shrink-0 ml-2">
                        {count} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-1 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Recent Inferences */}
      {recentHistory.length > 0 && (
        <div className="p-3 rounded-lg border bg-card">
          <h4 className="text-xs font-medium mb-2">Recent Inferences</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b">
                  <th className="text-left py-1 font-medium">Model</th>
                  <th className="text-left py-1 font-medium">Mode</th>
                  <th className="text-right py-1 font-medium">Tokens/s</th>
                  <th className="text-right py-1 font-medium">Latency</th>
                  <th className="text-left py-1 font-medium">Input</th>
                </tr>
              </thead>
              <tbody>
                {recentHistory.map((h) => (
                  <tr key={h.id} className="border-b last:border-0">
                    <td className="py-1 max-w-[100px] truncate">{h.modelId}</td>
                    <td className="py-1">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] ${
                          h.mode === 'local'
                            ? 'bg-emerald-100 text-emerald-700'
                            : h.mode === 'cloud'
                              ? 'bg-sky-100 text-sky-700'
                              : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {h.mode}
                      </span>
                    </td>
                    <td className="py-1 text-right">{h.tokensPerSecond.toFixed(1)}</td>
                    <td className="py-1 text-right">{h.latencyMs}ms</td>
                    <td className="py-1 max-w-[150px] truncate text-muted-foreground">{h.input}</td>
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
