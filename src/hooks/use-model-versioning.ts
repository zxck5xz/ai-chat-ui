'use client';

import { useState, useCallback } from 'react';
import type {
  ModelVersion,
  ModelDeployment,
  RollbackRecord,
  ModelComparison,
  ModelVersioningStats,
} from '@/types/model-versioning';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export function useModelVersioning() {
  const [versions, setVersions] = useState<ModelVersion[]>([]);
  const [deployments, setDeployments] = useState<ModelDeployment[]>([]);
  const [rollbacks, setRollbacks] = useState<RollbackRecord[]>([]);
  const [stats, setStats] = useState<ModelVersioningStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/model-versioning/stats`);
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVersions = useCallback(async (filters?: { provider?: string; status?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters?.provider) params.set('provider', filters.provider);
      if (filters?.status) params.set('status', filters.status);
      const res = await fetch(`${API_BASE}/api/model-versioning/versions?${params}`);
      if (!res.ok) throw new Error('Failed to fetch versions');
      const data = await res.json();
      setVersions(data.versions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const createVersion = useCallback(
    async (data: {
      name: string;
      version: string;
      provider: string;
      modelId: string;
      config?: Record<string, unknown>;
      notes?: string;
    }): Promise<ModelVersion | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/model-versioning/versions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to create version');
        const result = await res.json();
        setVersions((prev) => [result.version, ...prev]);
        return result.version;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateVersion = useCallback(
    async (
      id: string,
      data: Partial<Pick<ModelVersion, 'name' | 'status' | 'config' | 'notes'>>
    ): Promise<ModelVersion | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/model-versioning/versions/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update version');
        const result = await res.json();
        setVersions((prev) => prev.map((v) => (v.id === id ? result.version : v)));
        return result.version;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteVersion = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/model-versioning/versions/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete version');
      setVersions((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDeployments = useCallback(
    async (filters?: { environment?: string; versionId?: string; status?: string }) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters?.environment) params.set('environment', filters.environment);
        if (filters?.versionId) params.set('versionId', filters.versionId);
        if (filters?.status) params.set('status', filters.status);
        const res = await fetch(`${API_BASE}/api/model-versioning/deployments?${params}`);
        if (!res.ok) throw new Error('Failed to fetch deployments');
        const data = await res.json();
        setDeployments(data.deployments);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createDeployment = useCallback(
    async (data: {
      versionId: string;
      environment: string;
      strategy: string;
      trafficPercent?: number;
      deployedBy?: string;
    }): Promise<ModelDeployment | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/model-versioning/deployments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to create deployment');
        const result = await res.json();
        setDeployments((prev) => [result.deployment, ...prev]);
        return result.deployment;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const rollback = useCallback(
    async (
      deploymentId: string,
      reason: string,
      triggeredBy?: string
    ): Promise<RollbackRecord | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/model-versioning/rollback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deploymentId, reason, triggeredBy }),
        });
        if (!res.ok) throw new Error('Rollback failed');
        const result = await res.json();
        setRollbacks((prev) => [result.rollback, ...prev]);
        return result.rollback;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchRollbacks = useCallback(async (deploymentId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (deploymentId) params.set('deploymentId', deploymentId);
      const res = await fetch(`${API_BASE}/api/model-versioning/rollbacks?${params}`);
      if (!res.ok) throw new Error('Failed to fetch rollbacks');
      const data = await res.json();
      setRollbacks(data.rollbacks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const compareVersions = useCallback(
    async (versionA: string, versionB: string): Promise<ModelComparison | null> => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ versionA, versionB });
        const res = await fetch(`${API_BASE}/api/model-versioning/compare?${params}`);
        if (!res.ok) throw new Error('Failed to compare versions');
        const data = await res.json();
        return data.comparison;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    versions,
    deployments,
    rollbacks,
    stats,
    loading,
    error,
    fetchStats,
    fetchVersions,
    createVersion,
    updateVersion,
    deleteVersion,
    fetchDeployments,
    createDeployment,
    rollback,
    fetchRollbacks,
    compareVersions,
  };
}
