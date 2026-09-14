'use client';

import type { QuotaStatus, RateLimitStatus, UsageRecord, UsageSummary } from '@/types/platform';
import { Activity, Clock, Coins, Gauge, TriangleAlert, Zap } from 'lucide-react';

interface UsageDashboardProps {
  usage: UsageSummary | null;
  quota: QuotaStatus | null;
  rateLimits: { minute: RateLimitStatus; day: RateLimitStatus } | null;
  records: UsageRecord[];
}

function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(Math.round(value));
}

function formatUsd(value: number): string {
  return value < 0.01 && value > 0 ? '<$0.01' : `$${value.toFixed(2)}`;
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-xl font-semibold">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

export function UsageDashboard({ usage, quota, rateLimits, records }: UsageDashboardProps) {
  const maxDayTokens = Math.max(1, ...(usage?.by_day ?? []).map((d) => d.tokens));

  return (
    <div className="space-y-4">
      {quota && (
        <div
          className={`rounded-lg border p-4 ${
            quota.exceeded
              ? 'border-red-300 bg-red-50'
              : quota.warning
                ? 'border-amber-300 bg-amber-50'
                : 'border-gray-200'
          }`}
        >
          <div className="mb-2 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-medium">
              <Gauge size={14} />
              Monthly token quota
              {(quota.warning || quota.exceeded) && (
                <TriangleAlert
                  size={13}
                  className={quota.exceeded ? 'text-red-600' : 'text-amber-600'}
                />
              )}
            </h3>
            <span className="text-xs text-gray-500">
              {new Date(quota.period_start).toLocaleDateString()} —{' '}
              {new Date(quota.period_end).toLocaleDateString()}
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full transition-all ${
                quota.exceeded ? 'bg-red-500' : quota.warning ? 'bg-amber-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(100, quota.percent_used * 100)}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-gray-600">
              {formatNumber(quota.tokens_used)} / {formatNumber(quota.tokens_included)} tokens (
              {(quota.percent_used * 100).toFixed(1)}%)
            </span>
            {quota.overage_tokens > 0 ? (
              <span className="font-medium text-red-600">
                Overage: {formatNumber(quota.overage_tokens)} tokens ·{' '}
                {formatUsd(quota.overage_cost_usd)}
              </span>
            ) : (
              <span className="text-gray-500">
                {formatNumber(quota.tokens_remaining)} remaining
              </span>
            )}
          </div>
        </div>
      )}

      {rateLimits && (
        <div className="grid grid-cols-2 gap-3">
          {(['minute', 'day'] as const).map((window) => {
            const limit = rateLimits[window];
            const used = limit.limit - limit.remaining;
            const pct = limit.limit > 0 ? (used / limit.limit) * 100 : 0;

            return (
              <div key={window} className="rounded-lg border p-3">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Zap size={12} />
                    Per {window}
                  </span>
                  <span>
                    {used} / {limit.limit}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-full ${pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Resets {new Date(limit.reset_at).toLocaleTimeString()}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {usage && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard
              icon={<Activity size={12} />}
              label="Requests"
              value={formatNumber(usage.total_requests)}
              sub={`${usage.failed_requests} failed`}
            />
            <StatCard
              icon={<Zap size={12} />}
              label="Tokens"
              value={formatNumber(usage.total_tokens)}
              sub={`${formatNumber(usage.input_tokens)} in / ${formatNumber(usage.output_tokens)} out`}
            />
            <StatCard
              icon={<Coins size={12} />}
              label="Cost"
              value={formatUsd(usage.total_cost_usd)}
              sub="this period"
            />
            <StatCard
              icon={<Clock size={12} />}
              label="Avg latency"
              value={`${Math.round(usage.avg_duration_ms)}ms`}
            />
          </div>

          {usage.by_day.length > 0 && (
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 text-sm font-medium">Tokens per day</h3>
              <div className="flex h-32 items-end gap-1">
                {usage.by_day.map((day) => (
                  <div key={day.day} className="group flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-blue-500 transition-all group-hover:bg-blue-600"
                      style={{ height: `${Math.max(2, (day.tokens / maxDayTokens) * 100)}%` }}
                      title={`${day.day}: ${formatNumber(day.tokens)} tokens, ${day.requests} requests`}
                    />
                    <span className="text-[10px] text-gray-400">{day.day.slice(8)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {usage.by_endpoint.length > 0 && (
            <div className="rounded-lg border">
              <div className="border-b px-4 py-2.5">
                <h3 className="text-sm font-medium">By endpoint</h3>
              </div>
              <div className="divide-y">
                {usage.by_endpoint.map((row) => (
                  <div key={row.endpoint} className="flex items-center justify-between px-4 py-2">
                    <code className="truncate font-mono text-xs">{row.endpoint}</code>
                    <div className="flex shrink-0 gap-4 text-xs text-gray-500">
                      <span>{row.requests} req</span>
                      <span>{formatNumber(row.tokens)} tok</span>
                      <span>{formatUsd(row.cost_usd)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {records.length > 0 && (
        <div className="rounded-lg border">
          <div className="border-b px-4 py-2.5">
            <h3 className="text-sm font-medium">Recent requests</h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Time</th>
                  <th className="px-3 py-2 text-left font-medium">Endpoint</th>
                  <th className="px-3 py-2 text-right font-medium">Status</th>
                  <th className="px-3 py-2 text-right font-medium">Tokens</th>
                  <th className="px-3 py-2 text-right font-medium">Cost</th>
                  <th className="px-3 py-2 text-right font-medium">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {records.map((record) => (
                  <tr key={record.id}>
                    <td className="px-3 py-1.5 text-gray-500">
                      {new Date(record.created_at).toLocaleTimeString()}
                    </td>
                    <td className="px-3 py-1.5">
                      <code className="font-mono">{record.endpoint}</code>
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      <span
                        className={
                          record.status_code < 400
                            ? 'text-green-600'
                            : record.status_code < 500
                              ? 'text-amber-600'
                              : 'text-red-600'
                        }
                      >
                        {record.status_code}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-right">{record.total_tokens}</td>
                    <td className="px-3 py-1.5 text-right">{formatUsd(record.cost_usd)}</td>
                    <td className="px-3 py-1.5 text-right text-gray-500">{record.duration_ms}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!usage && !quota && (
        <p className="py-8 text-center text-sm text-gray-500">
          No usage yet. Call the metered API with one of your keys to see data here.
        </p>
      )}
    </div>
  );
}
