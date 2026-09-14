'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePlatform } from '@/hooks/use-platform';
import { ApiKeysPanel } from '@/components/platform/api-keys-panel';
import { UsageDashboard } from '@/components/platform/usage-dashboard';
import { SchemaPlayground } from '@/components/platform/schema-playground';
import { BillingPanel } from '@/components/platform/billing-panel';
import type { Tier } from '@/types/platform';
import { ArrowLeft, BarChart3, Braces, CreditCard, KeyRound, Plus, X } from 'lucide-react';

type Tab = 'keys' | 'usage' | 'schemas' | 'billing';

export default function PlatformPage() {
  const [activeTab, setActiveTab] = useState<Tab>('keys');
  const [newTenantName, setNewTenantName] = useState('');
  const [showCreateTenant, setShowCreateTenant] = useState(false);

  const {
    tiers,
    tenants,
    tenantId,
    tenant,
    keys,
    newKey,
    usage,
    records,
    quota,
    rateLimits,
    invoice,
    events,
    schemas,
    structuredResult,
    structuredMetrics,
    loading,
    generating,
    error,
    setTenantId,
    clearError,
    dismissNewKey,
    fetchTiers,
    fetchTenants,
    createTenant,
    fetchTenant,
    updateTenant,
    fetchKeys,
    createKey,
    revokeKey,
    rotateKey,
    fetchUsage,
    fetchRecords,
    fetchQuota,
    fetchInvoice,
    fetchEvents,
    retryEvents,
    fetchSchemas,
    saveSchema,
    deleteSchema,
    generateStructured,
    fetchStructuredMetrics,
  } = usePlatform();

  // Load the catalog once, then pick up any tenant remembered from last visit
  useEffect(() => {
    fetchTiers();
    fetchSchemas();
    fetchTenants().then((list) => {
      if (!tenantId && list.length > 0) setTenantId(list[0].id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!tenantId) return;
    fetchTenant(tenantId);
    fetchKeys(tenantId);
  }, [tenantId, fetchTenant, fetchKeys]);

  // Each tab pulls only what it shows, refreshed on entry
  useEffect(() => {
    if (!tenantId) return;

    if (activeTab === 'usage') {
      fetchUsage(tenantId);
      fetchRecords(tenantId);
      fetchQuota(tenantId);
    }
    if (activeTab === 'billing') {
      fetchInvoice(tenantId);
      fetchEvents(tenantId);
      fetchStructuredMetrics();
    }
    if (activeTab === 'schemas') {
      fetchSchemas();
    }
  }, [
    activeTab,
    tenantId,
    fetchUsage,
    fetchRecords,
    fetchQuota,
    fetchInvoice,
    fetchEvents,
    fetchStructuredMetrics,
    fetchSchemas,
  ]);

  const currentLimits = tiers.find((t) => t.tier === tenant?.tier) ?? null;

  const handleCreateTenant = async () => {
    if (!newTenantName.trim()) return;
    await createTenant(newTenantName.trim());
    setNewTenantName('');
    setShowCreateTenant(false);
  };

  const tabs: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
    { id: 'keys', label: 'API Keys', icon: <KeyRound size={14} /> },
    { id: 'usage', label: 'Usage', icon: <BarChart3 size={14} /> },
    { id: 'schemas', label: 'Schemas', icon: <Braces size={14} /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard size={14} /> },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-5 flex items-center gap-3">
        <Link href="/chat" className="rounded border p-1.5 text-gray-600 hover:bg-gray-50">
          <ArrowLeft size={15} />
        </Link>
        <div>
          <h1 className="text-lg font-semibold">Agent Platform</h1>
          <p className="text-xs text-gray-500">
            Multi-tenant API keys, rate limiting, usage metering and schema-enforced output
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3">
          <p className="flex-1 text-sm text-red-700">{error}</p>
          <button onClick={clearError} className="text-red-500 hover:text-red-700">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border p-3">
        <span className="text-xs font-medium text-gray-600">Tenant</span>

        {tenants.length > 0 ? (
          <select
            value={tenantId ?? ''}
            onChange={(e) => setTenantId(e.target.value || null)}
            className="rounded border px-2 py-1.5 text-sm"
          >
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.tier})
              </option>
            ))}
          </select>
        ) : (
          <span className="text-sm text-gray-500">No tenants yet</span>
        )}

        {tenant && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${
              tenant.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {tenant.status}
          </span>
        )}

        {showCreateTenant ? (
          <div className="ml-auto flex items-center gap-2">
            <input
              value={newTenantName}
              onChange={(e) => setNewTenantName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateTenant()}
              placeholder="Tenant name"
              autoFocus
              className="rounded border px-2 py-1.5 text-sm"
            />
            <button
              onClick={handleCreateTenant}
              disabled={loading || !newTenantName.trim()}
              className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Create
            </button>
            <button
              onClick={() => setShowCreateTenant(false)}
              className="rounded border p-1.5 text-gray-500 hover:bg-gray-50"
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowCreateTenant(true)}
            className="ml-auto flex items-center gap-1.5 rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            <Plus size={13} />
            New tenant
          </button>
        )}
      </div>

      <div className="mb-4 flex gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {!tenantId && activeTab !== 'schemas' ? (
        <div className="rounded-lg border border-dashed py-12 text-center">
          <p className="text-sm text-gray-500">
            Create a tenant to issue API keys and see metered usage.
          </p>
        </div>
      ) : (
        <>
          {activeTab === 'keys' && (
            <ApiKeysPanel
              keys={keys}
              newKey={newKey}
              limits={currentLimits}
              loading={loading}
              onCreate={(name, options) => tenantId && createKey(tenantId, name, options)}
              onRevoke={revokeKey}
              onRotate={(keyId) => tenantId && rotateKey(keyId, tenantId)}
              onDismissNewKey={dismissNewKey}
            />
          )}

          {activeTab === 'usage' && (
            <UsageDashboard usage={usage} quota={quota} rateLimits={rateLimits} records={records} />
          )}

          {activeTab === 'schemas' && (
            <SchemaPlayground
              schemas={schemas}
              result={structuredResult}
              generating={generating}
              loading={loading}
              onGenerate={generateStructured}
              onSaveSchema={saveSchema}
              onDeleteSchema={deleteSchema}
            />
          )}

          {activeTab === 'billing' && (
            <BillingPanel
              tenant={tenant}
              tiers={tiers}
              invoice={invoice}
              events={events}
              structuredMetrics={structuredMetrics}
              loading={loading}
              onChangeTier={(tier: Tier) => tenantId && updateTenant(tenantId, { tier })}
              onSetWebhook={(url) => tenantId && updateTenant(tenantId, { webhook_url: url })}
              onRetryEvents={() => tenantId && retryEvents(tenantId)}
            />
          )}
        </>
      )}
    </div>
  );
}
