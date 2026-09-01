'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SearchAnalytics } from '@/types/search-engine';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-chat-api.ai-chat-api.workers.dev';

export default function SearchAnalyticsPage() {
  const [metrics, setMetrics] = useState<SearchAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/search/analytics/metrics`);
      const data = await res.json();
      setMetrics(data.metrics);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch on mount is the correct pattern for one-shot data loading;
    // suppress the react-hooks/set-state-in-effect rule for this case.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/search" className="text-gray-400 hover:text-white">
            <ArrowLeft size={20} />
          </Link>
          <BarChart3 size={20} className="text-purple-400" />
          <h1 className="text-lg font-semibold">Search Analytics</h1>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-white disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </header>

      <div className="max-w-5xl mx-auto p-4 space-y-4">
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        {metrics && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Metric label="Total queries" value={metrics.totalQueries} />
              <Metric label="Avg latency" value={`${Math.round(metrics.avgLatencyMs)}ms`} />
              <Metric label="CTR" value={`${(metrics.ctr * 100).toFixed(1)}%`} tone="green" />
              <Metric label="MRR" value={metrics.mrr.toFixed(2)} tone="blue" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card className="p-4 bg-gray-900 border-gray-700">
                <h3 className="text-sm font-medium mb-3">Queries by complexity</h3>
                <div className="space-y-2">
                  {(Object.entries(metrics.queriesByComplexity) as [string, number][]).map(
                    ([k, v]) => (
                      <Bar key={k} label={k} value={v} total={metrics.totalQueries} />
                    )
                  )}
                </div>
              </Card>

              <Card className="p-4 bg-gray-900 border-gray-700">
                <h3 className="text-sm font-medium mb-3">Clicks by position</h3>
                {metrics.clicksByPosition.length === 0 ? (
                  <p className="text-xs text-gray-500">No clicks yet</p>
                ) : (
                  <div className="space-y-2">
                    {metrics.clicksByPosition.map((c) => {
                      const max = Math.max(...metrics.clicksByPosition.map((x) => x.count));
                      const pct = max > 0 ? (c.count / max) * 100 : 0;
                      return (
                        <div key={c.position} className="flex items-center gap-2 text-xs">
                          <span className="w-12 text-gray-400">#{c.position}</span>
                          <div className="flex-1 bg-gray-800 rounded h-2 overflow-hidden">
                            <div className="bg-blue-500 h-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-8 text-right text-gray-400">{c.count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>

            <Card className="p-4 bg-gray-900 border-gray-700">
              <h3 className="text-sm font-medium mb-3">Top queries</h3>
              {metrics.topQueries.length === 0 ? (
                <p className="text-xs text-gray-500">
                  No queries yet. Run a search on /search to populate.
                </p>
              ) : (
                <table className="w-full text-xs">
                  <thead className="text-gray-500">
                    <tr>
                      <th className="text-left py-1">Query</th>
                      <th className="text-right">Count</th>
                      <th className="text-right">CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.topQueries.map((q) => (
                      <tr key={q.query} className="border-t border-gray-800">
                        <td className="py-1 truncate max-w-xs">{q.query}</td>
                        <td className="text-right">{q.count}</td>
                        <td className="text-right text-green-400">{(q.ctr * 100).toFixed(0)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>

            <Card className="p-4 bg-gray-900 border-gray-700">
              <h3 className="text-sm font-medium mb-3">Worst-performing queries</h3>
              {metrics.worstQueries.length === 0 ? (
                <p className="text-xs text-gray-500">Not enough click data yet.</p>
              ) : (
                <table className="w-full text-xs">
                  <thead className="text-gray-500">
                    <tr>
                      <th className="text-left py-1">Query</th>
                      <th className="text-right">Count</th>
                      <th className="text-right">CTR</th>
                      <th className="text-right">Avg pos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.worstQueries.map((q) => (
                      <tr key={q.query} className="border-t border-gray-800">
                        <td className="py-1 truncate max-w-xs">{q.query}</td>
                        <td className="text-right">{q.count}</td>
                        <td className="text-right text-red-400">{(q.ctr * 100).toFixed(0)}%</td>
                        <td className="text-right text-gray-400">{q.avgPosition.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>

            <div className="text-xs text-gray-500 text-center pt-2">
              Zero-click rate:{' '}
              <Badge variant="outline" className="text-xs">
                {(metrics.zeroClickRate * 100).toFixed(0)}%
              </Badge>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone?: 'green' | 'blue';
}) {
  const color =
    tone === 'green' ? 'text-green-400' : tone === 'blue' ? 'text-blue-400' : 'text-white';
  return (
    <Card className="p-4 bg-gray-900 border-gray-700">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-2xl font-semibold ${color}`}>{value}</div>
    </Card>
  );
}

function Bar({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 text-gray-400 capitalize">{label}</span>
      <div className="flex-1 bg-gray-800 rounded h-2 overflow-hidden">
        <div className="bg-purple-500 h-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-gray-400">{value}</span>
    </div>
  );
}
