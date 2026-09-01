'use client';

import { useCallback, useState } from 'react';
import type {
  MonitoringOverview,
  AnomalyEvent,
  DriftEvent,
  AlertRule,
  AlertEvent,
  EvaluationResult,
  MetricSnapshot,
  DriftResult,
} from '@/types/monitoring';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

export function useMonitoring() {
  const [overview, setOverview] = useState<MonitoringOverview | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>([]);
  const [drifts, setDrifts] = useState<DriftEvent[]>([]);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [events, setEvents] = useState<AlertEvent[]>([]);
  const [snapshots, setSnapshots] = useState<MetricSnapshot[]>([]);
  const [evaluationResults, setEvaluationResults] = useState<EvaluationResult[]>([]);
  const [driftResults, setDriftResults] = useState<DriftResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async (days = 7) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/monitoring/overview?days=${days}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setOverview(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnomalies = useCallback(
    async (params?: { limit?: number; metric?: string; acknowledged?: number }) => {
      setError(null);
      try {
        const query = new URLSearchParams();
        if (params?.limit) query.set('limit', String(params.limit));
        if (params?.metric) query.set('metric', params.metric);
        if (params?.acknowledged !== undefined)
          query.set('acknowledged', String(params.acknowledged));
        const res = await fetch(`${API_URL}/api/monitoring/anomalies?${query.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setAnomalies(data.events || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    []
  );

  const fetchDrifts = useCallback(
    async (params?: {
      limit?: number;
      metric?: string;
      drift_type?: string;
      acknowledged?: number;
    }) => {
      setError(null);
      try {
        const query = new URLSearchParams();
        if (params?.limit) query.set('limit', String(params.limit));
        if (params?.metric) query.set('metric', params.metric);
        if (params?.drift_type) query.set('drift_type', params.drift_type);
        if (params?.acknowledged !== undefined)
          query.set('acknowledged', String(params.acknowledged));
        const res = await fetch(`${API_URL}/api/monitoring/drifts?${query.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setDrifts(data.events || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    []
  );

  const acknowledgeAnomaly = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/monitoring/anomalies/${id}/acknowledge`, {
        method: 'PUT',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setAnomalies((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: 1 } : a)));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const acknowledgeDrift = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/monitoring/drifts/${id}/acknowledge`, {
        method: 'PUT',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDrifts((prev) => prev.map((d) => (d.id === id ? { ...d, acknowledged: 1 } : d)));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const runEvaluation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/monitoring/evaluate`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setEvaluationResults(data.alertResults || []);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const detectAnomalies = useCallback(async (metric?: string, model?: string) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/monitoring/anomalies/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metric: metric || 'latency_ms', model, hours: 24 }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return null;
    }
  }, []);

  const detectDrifts = useCallback(async (model?: string, windowDays?: number) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/monitoring/drifts/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, window_days: windowDays || 7 }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setDriftResults(data.drifts || []);
      return data.drifts;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return null;
    }
  }, []);

  const fetchRules = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/monitoring/rules`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRules(data.rules || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const createRule = useCallback(
    async (rule: {
      name: string;
      metric: string;
      condition: 'gt' | 'lt' | 'eq';
      threshold: number;
      severity?: string;
      evaluation_window_minutes?: number;
      cooldown_minutes?: number;
    }) => {
      try {
        const res = await fetch(`${API_URL}/api/monitoring/rules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rule),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        await fetchRules();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    [fetchRules]
  );

  const toggleRule = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`${API_URL}/api/monitoring/rules/${id}/toggle`, { method: 'PUT' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        await fetchRules();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    [fetchRules]
  );

  const deleteRule = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`${API_URL}/api/monitoring/rules/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        await fetchRules();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    [fetchRules]
  );

  const fetchEvents = useCallback(async (limit = 50) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/monitoring/events?limit=${limit}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const acknowledgeEvent = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/monitoring/events/${id}/acknowledge`, {
        method: 'PUT',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, acknowledged: 1 } : e)));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const fetchSnapshots = useCallback(async (metric = 'latency_ms', hours = 24) => {
    setError(null);
    try {
      const res = await fetch(
        `${API_URL}/api/monitoring/snapshots?metric=${metric}&hours=${hours}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSnapshots(data.snapshots || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  return {
    overview,
    anomalies,
    drifts,
    rules,
    events,
    snapshots,
    evaluationResults,
    driftResults,
    loading,
    error,
    fetchOverview,
    fetchAnomalies,
    fetchDrifts,
    acknowledgeAnomaly,
    acknowledgeDrift,
    runEvaluation,
    detectAnomalies,
    detectDrifts,
    fetchRules,
    createRule,
    toggleRule,
    deleteRule,
    fetchEvents,
    acknowledgeEvent,
    fetchSnapshots,
  };
}
