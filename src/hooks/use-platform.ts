'use client';

import { useCallback, useState } from 'react';
import type {
  ApiKey,
  BillingEvent,
  CreatedKey,
  GenerationRecord,
  Invoice,
  JsonSchemaLike,
  QuotaStatus,
  RateLimitStatus,
  Scope,
  SchemaRecord,
  StructuredMetrics,
  StructuredResult,
  Tenant,
  Tier,
  TierLimits,
  UsageRecord,
  UsageSummary,
  ValidationError,
} from '@/types/platform';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

/** The tenant the portal is currently viewing, remembered across reloads. */
const SELECTED_TENANT_KEY = 'platform:selected-tenant';

function readStoredTenant(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(SELECTED_TENANT_KEY);
  } catch {
    return null;
  }
}

export function usePlatform() {
  const [tiers, setTiers] = useState<TierLimits[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantId, setTenantIdState] = useState<string | null>(readStoredTenant);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKey, setNewKey] = useState<CreatedKey | null>(null);
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [records, setRecords] = useState<UsageRecord[]>([]);
  const [quota, setQuota] = useState<QuotaStatus | null>(null);
  const [rateLimits, setRateLimits] = useState<{
    minute: RateLimitStatus;
    day: RateLimitStatus;
  } | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [events, setEvents] = useState<BillingEvent[]>([]);

  const [schemas, setSchemas] = useState<SchemaRecord[]>([]);
  const [structuredResult, setStructuredResult] = useState<StructuredResult | null>(null);
  const [structuredMetrics, setStructuredMetrics] = useState<StructuredMetrics | null>(null);
  const [generations, setGenerations] = useState<GenerationRecord[]>([]);

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);
  const dismissNewKey = useCallback(() => setNewKey(null), []);

  const fail = useCallback((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    setError(message);
    return message;
  }, []);

  /** Fetch + parse JSON, surfacing the API's own error message when present. */
  const request = useCallback(async <T>(path: string, init?: RequestInit): Promise<T> => {
    const res = await fetch(`${API_URL}${path}`, init);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
    return data as T;
  }, []);

  const setTenantId = useCallback((id: string | null) => {
    setTenantIdState(id);
    try {
      if (id) window.localStorage.setItem(SELECTED_TENANT_KEY, id);
      else window.localStorage.removeItem(SELECTED_TENANT_KEY);
    } catch {
      // A blocked localStorage must not break tenant switching
    }
  }, []);

  // ---- Catalog + tenants ----

  const fetchTiers = useCallback(async () => {
    try {
      const data = await request<{ tiers: TierLimits[] }>('/api/aaas/tiers');
      setTiers(data.tiers || []);
    } catch (err) {
      fail(err);
    }
  }, [request, fail]);

  const fetchTenants = useCallback(async () => {
    try {
      const data = await request<{ tenants: Tenant[] }>('/api/aaas/tenants');
      setTenants(data.tenants || []);
      return data.tenants || [];
    } catch (err) {
      fail(err);
      return [];
    }
  }, [request, fail]);

  const createTenant = useCallback(
    async (name: string, email?: string, tier: Tier = 'free') => {
      setLoading(true);
      setError(null);
      try {
        const data = await request<{ tenant: Tenant }>('/api/aaas/tenants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, tier }),
        });
        setTenants((prev) => [data.tenant, ...prev]);
        setTenantId(data.tenant.id);
        setTenant(data.tenant);
        return data.tenant;
      } catch (err) {
        fail(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [request, fail, setTenantId]
  );

  const fetchTenant = useCallback(
    async (id: string) => {
      try {
        const data = await request<{ tenant: Tenant; quota: QuotaStatus }>(
          `/api/aaas/tenants/${id}`
        );
        setTenant(data.tenant);
        setQuota(data.quota);
        return data.tenant;
      } catch (err) {
        fail(err);
        return null;
      }
    },
    [request, fail]
  );

  const updateTenant = useCallback(
    async (
      id: string,
      updates: { tier?: Tier; webhook_url?: string | null; status?: 'active' | 'suspended' }
    ) => {
      setLoading(true);
      setError(null);
      try {
        const data = await request<{ tenant: Tenant }>(`/api/aaas/tenants/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        setTenant(data.tenant);
        setTenants((prev) => prev.map((t) => (t.id === id ? data.tenant : t)));
        return data.tenant;
      } catch (err) {
        fail(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [request, fail]
  );

  // ---- Keys ----

  const fetchKeys = useCallback(
    async (id: string) => {
      try {
        const data = await request<{ keys: ApiKey[] }>(`/api/aaas/tenants/${id}/keys`);
        setKeys(data.keys || []);
      } catch (err) {
        fail(err);
      }
    },
    [request, fail]
  );

  const createKey = useCallback(
    async (
      id: string,
      name: string,
      options: { scopes?: Scope[]; expiresInDays?: number } = {}
    ) => {
      setLoading(true);
      setError(null);
      try {
        const data = await request<CreatedKey>(`/api/aaas/tenants/${id}/keys`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, ...options }),
        });
        // Surfaced once in a dismissible panel — the plaintext is unrecoverable
        setNewKey(data);
        setKeys((prev) => [data.key, ...prev]);
        return data;
      } catch (err) {
        fail(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [request, fail]
  );

  const revokeKey = useCallback(
    async (keyId: string) => {
      setError(null);
      try {
        await request(`/api/aaas/keys/${keyId}`, { method: 'DELETE' });
        setKeys((prev) =>
          prev.map((k) =>
            k.id === keyId
              ? { ...k, status: 'revoked' as const, revoked_at: new Date().toISOString() }
              : k
          )
        );
        return true;
      } catch (err) {
        fail(err);
        return false;
      }
    },
    [request, fail]
  );

  const rotateKey = useCallback(
    async (keyId: string, id: string) => {
      setLoading(true);
      setError(null);
      try {
        const data = await request<CreatedKey>(`/api/aaas/keys/${keyId}/rotate`, {
          method: 'POST',
        });
        setNewKey(data);
        await fetchKeys(id);
        return data;
      } catch (err) {
        fail(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [request, fail, fetchKeys]
  );

  // ---- Usage, quota, billing ----

  const fetchUsage = useCallback(
    async (id: string) => {
      try {
        const data = await request<{ summary: UsageSummary }>(`/api/aaas/tenants/${id}/usage`);
        setUsage(data.summary);
      } catch (err) {
        fail(err);
      }
    },
    [request, fail]
  );

  const fetchRecords = useCallback(
    async (id: string, limit = 50) => {
      try {
        const data = await request<{ records: UsageRecord[] }>(
          `/api/aaas/tenants/${id}/usage/records?limit=${limit}`
        );
        setRecords(data.records || []);
      } catch (err) {
        fail(err);
      }
    },
    [request, fail]
  );

  const fetchQuota = useCallback(
    async (id: string) => {
      try {
        const data = await request<{
          quota: QuotaStatus;
          rate_limits: { minute: RateLimitStatus; day: RateLimitStatus };
        }>(`/api/aaas/tenants/${id}/quota`);
        setQuota(data.quota);
        setRateLimits(data.rate_limits);
      } catch (err) {
        fail(err);
      }
    },
    [request, fail]
  );

  const fetchInvoice = useCallback(
    async (id: string) => {
      try {
        const data = await request<{ invoice: Invoice }>(`/api/aaas/tenants/${id}/invoice`);
        setInvoice(data.invoice);
      } catch (err) {
        fail(err);
      }
    },
    [request, fail]
  );

  const fetchEvents = useCallback(
    async (id: string) => {
      try {
        const data = await request<{ events: BillingEvent[] }>(
          `/api/aaas/tenants/${id}/billing-events`
        );
        setEvents(data.events || []);
      } catch (err) {
        fail(err);
      }
    },
    [request, fail]
  );

  const retryEvents = useCallback(
    async (id: string) => {
      setError(null);
      try {
        const data = await request<{ delivered: number }>(
          `/api/aaas/tenants/${id}/billing-events/retry`,
          {
            method: 'POST',
          }
        );
        await fetchEvents(id);
        return data.delivered;
      } catch (err) {
        fail(err);
        return 0;
      }
    },
    [request, fail, fetchEvents]
  );

  // ---- Structured output ----

  const fetchSchemas = useCallback(async () => {
    try {
      const data = await request<{ schemas: SchemaRecord[] }>('/api/structured/schemas');
      setSchemas(data.schemas || []);
    } catch (err) {
      fail(err);
    }
  }, [request, fail]);

  const saveSchema = useCallback(
    async (name: string, schema: JsonSchemaLike, description?: string) => {
      setLoading(true);
      setError(null);
      try {
        const data = await request<{ schema: SchemaRecord }>('/api/structured/schemas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, schema, description }),
        });
        await fetchSchemas();
        return data.schema;
      } catch (err) {
        fail(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [request, fail, fetchSchemas]
  );

  const deleteSchema = useCallback(
    async (name: string) => {
      setError(null);
      try {
        await request(`/api/structured/schemas/${encodeURIComponent(name)}`, { method: 'DELETE' });
        setSchemas((prev) => prev.filter((s) => s.name !== name));
        return true;
      } catch (err) {
        fail(err);
        return false;
      }
    },
    [request, fail]
  );

  const validateValue = useCallback(
    async (value: unknown, schema?: JsonSchemaLike, schemaName?: string) => {
      setError(null);
      try {
        return await request<{ valid: boolean; errors: ValidationError[] }>(
          '/api/structured/validate',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value, schema, schemaName }),
          }
        );
      } catch (err) {
        fail(err);
        return null;
      }
    },
    [request, fail]
  );

  const generateStructured = useCallback(
    async (prompt: string, schema?: JsonSchemaLike, schemaName?: string, maxAttempts = 3) => {
      setGenerating(true);
      setError(null);
      setStructuredResult(null);
      try {
        // A schema violation returns 422 with a full result — that is a normal
        // outcome to display, not a transport failure, so read the body first
        const res = await fetch(`${API_URL}/api/structured/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, schema, schemaName, maxAttempts }),
        });
        const data = await res.json();

        if (data.result) {
          setStructuredResult(data.result);
          return data.result as StructuredResult;
        }

        throw new Error(data.error || `HTTP ${res.status}`);
      } catch (err) {
        fail(err);
        return null;
      } finally {
        setGenerating(false);
      }
    },
    [fail]
  );

  const fetchStructuredMetrics = useCallback(async () => {
    try {
      const data = await request<{ metrics: StructuredMetrics }>('/api/structured/metrics');
      setStructuredMetrics(data.metrics);
    } catch (err) {
      fail(err);
    }
  }, [request, fail]);

  const fetchGenerations = useCallback(
    async (limit = 20) => {
      try {
        const data = await request<{ generations: GenerationRecord[] }>(
          `/api/structured/generations?limit=${limit}`
        );
        setGenerations(data.generations || []);
      } catch (err) {
        fail(err);
      }
    },
    [request, fail]
  );

  return {
    // state
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
    generations,
    loading,
    generating,
    error,
    // actions
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
    validateValue,
    generateStructured,
    fetchStructuredMetrics,
    fetchGenerations,
  };
}
