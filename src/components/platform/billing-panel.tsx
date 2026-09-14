'use client';

import { useState } from 'react';
import type {
  BillingEvent,
  Invoice,
  StructuredMetrics,
  Tenant,
  Tier,
  TierLimits,
} from '@/types/platform';
import { CheckCircle2, FileText, Link2, RefreshCw, XCircle } from 'lucide-react';

const EVENT_STYLES: Record<string, string> = {
  quota_warning: 'bg-amber-100 text-amber-700',
  quota_exceeded: 'bg-red-100 text-red-700',
  tier_changed: 'bg-blue-100 text-blue-700',
  key_created: 'bg-green-100 text-green-700',
  key_revoked: 'bg-gray-100 text-gray-600',
  invoice_generated: 'bg-purple-100 text-purple-700',
};

interface BillingPanelProps {
  tenant: Tenant | null;
  tiers: TierLimits[];
  invoice: Invoice | null;
  events: BillingEvent[];
  structuredMetrics: StructuredMetrics | null;
  loading: boolean;
  onChangeTier: (tier: Tier) => void;
  onSetWebhook: (url: string | null) => void;
  onRetryEvents: () => void;
}

function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(Math.round(value));
}

export function BillingPanel({
  tenant,
  tiers,
  invoice,
  events,
  structuredMetrics,
  loading,
  onChangeTier,
  onSetWebhook,
  onRetryEvents,
}: BillingPanelProps) {
  const [webhookUrl, setWebhookUrl] = useState(tenant?.webhook_url ?? '');
  const undelivered = events.filter((e) => !e.delivered).length;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4">
        <h3 className="mb-3 text-sm font-medium">Plan</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier) => {
            const current = tenant?.tier === tier.tier;

            return (
              <button
                key={tier.tier}
                onClick={() => !current && onChangeTier(tier.tier)}
                disabled={loading || current}
                className={`rounded-lg border p-3 text-left transition-colors ${
                  current ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{tier.tier}</span>
                  {current && (
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] text-white">
                      current
                    </span>
                  )}
                </div>
                <p className="mt-1 text-lg font-semibold">
                  ${tier.monthly_base_usd}
                  <span className="text-xs font-normal text-gray-500">/mo</span>
                </p>
                <ul className="mt-2 space-y-0.5 text-xs text-gray-600">
                  <li>{formatNumber(tier.tokens_per_month)} tokens</li>
                  <li>
                    {tier.requests_per_minute}/min · {formatNumber(tier.requests_per_day)}/day
                  </li>
                  <li>{tier.max_keys} keys</li>
                  <li className={tier.overage_allowed ? '' : 'text-amber-600'}>
                    {tier.overage_allowed
                      ? `$${tier.overage_per_1k_tokens_usd}/1k overage`
                      : 'Hard quota stop'}
                  </li>
                </ul>
              </button>
            );
          })}
        </div>
      </div>

      {invoice && (
        <div className="rounded-lg border">
          <div className="flex items-center gap-2 border-b px-4 py-2.5">
            <FileText size={14} />
            <h3 className="text-sm font-medium">Current invoice</h3>
            <span className="ml-auto text-xs text-gray-500">
              {new Date(invoice.period_start).toLocaleDateString()} —{' '}
              {new Date(invoice.period_end).toLocaleDateString()}
            </span>
          </div>
          <div className="divide-y">
            {invoice.line_items.map((item, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-gray-700">{item.description}</span>
                <span className="font-medium">${item.amount_usd.toFixed(2)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between bg-gray-50 px-4 py-3">
              <span className="text-sm font-medium">Total</span>
              <span className="text-lg font-semibold">${invoice.total_usd.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border p-4">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
          <Link2 size={14} />
          Billing webhook
        </h3>
        <p className="mb-2 text-xs text-gray-500">
          Quota warnings, tier changes and key events POST here. Undelivered events are kept and can
          be retried.
        </p>
        <div className="flex items-center gap-2">
          <input
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://your-app.com/webhooks/billing"
            className="flex-1 rounded border px-3 py-2 text-sm"
          />
          <button
            onClick={() => onSetWebhook(webhookUrl.trim() || null)}
            disabled={loading}
            className="rounded border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="flex items-center gap-2 border-b px-4 py-2.5">
          <h3 className="text-sm font-medium">Billing events ({events.length})</h3>
          {undelivered > 0 && (
            <>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-700">
                {undelivered} undelivered
              </span>
              <button
                onClick={onRetryEvents}
                className="ml-auto flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-gray-50"
              >
                <RefreshCw size={11} />
                Retry
              </button>
            </>
          )}
        </div>

        {events.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-gray-500">No billing events yet.</p>
        ) : (
          <div className="max-h-72 divide-y overflow-y-auto">
            {events.map((event) => (
              <div key={event.id} className="flex items-start gap-2 px-4 py-2.5">
                {event.delivered ? (
                  <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-green-600" />
                ) : (
                  <XCircle size={13} className="mt-0.5 shrink-0 text-gray-400" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] ${
                        EVENT_STYLES[event.type] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {event.type}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(event.created_at).toLocaleString()}
                    </span>
                  </div>
                  <pre className="mt-1 overflow-x-auto font-mono text-[11px] text-gray-600">
                    {JSON.stringify(event.payload)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {structuredMetrics && structuredMetrics.total_generations > 0 && (
        <div className="rounded-lg border p-4">
          <h3 className="mb-3 text-sm font-medium">Structured output reliability</h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div>
              <p className="text-xs text-gray-500">Success rate</p>
              <p className="text-xl font-semibold">
                {(structuredMetrics.success_rate * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">First-attempt</p>
              <p className="text-xl font-semibold">
                {(structuredMetrics.first_attempt_success_rate * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Avg attempts</p>
              <p className="text-xl font-semibold">{structuredMetrics.avg_attempts.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Generations</p>
              <p className="text-xl font-semibold">{structuredMetrics.total_generations}</p>
            </div>
          </div>

          {structuredMetrics.top_error_keywords.length > 0 && (
            <div className="mt-3">
              <p className="mb-1.5 text-xs text-gray-500">Most common schema failures</p>
              <div className="flex flex-wrap gap-1.5">
                {structuredMetrics.top_error_keywords.map((item) => (
                  <span
                    key={item.keyword}
                    className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-700"
                  >
                    {item.keyword} · {item.count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
