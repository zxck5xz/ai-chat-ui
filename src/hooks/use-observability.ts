'use client';

import { useCallback, useState } from 'react';
import type {
  ObservabilityMetrics,
  Trace,
  TraceSpan,
  CostSummary,
  CostByModel,
  LatencyPercentile,
  LatencyTimeSeries,
  AlertRule,
  AlertEvent,
} from '@/types/observability';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

interface UseObservabilityReturn {
  metrics: ObservabilityMetrics | null;
  traces: Trace[];
  selectedTrace: Trace | null;
  traceSpans: TraceSpan[];
  costSummary: CostSummary[];
  costByModel: CostByModel[];
  latencyPercentiles: LatencyPercentile[];
  latencyTimeseries: LatencyTimeSeries[];
  slowTraces: TraceSpan[];
  alertRules: AlertRule[];
  alertEvents: AlertEvent[];
  loading: boolean;
  error: string | null;
  fetchMetrics: (days?: number) => Promise<void>;
  fetchTraces: (params?: {
    limit?: number;
    offset?: number;
    user_id?: string;
    operation?: string;
  }) => Promise<void>;
  selectTrace: (trace: Trace | null) => void;
  fetchTraceDetail: (traceId: string) => Promise<void>;
  fetchCostSummary: (days?: number, model?: string) => Promise<void>;
  fetchCostByModel: (days?: number) => Promise<void>;
  fetchLatencyPercentiles: (days?: number, model?: string) => Promise<void>;
  fetchLatencyTimeseries: (days?: number, model?: string) => Promise<void>;
  fetchSlowTraces: (threshold?: number, model?: string) => Promise<void>;
  fetchAlertRules: () => Promise<void>;
  createAlertRule: (rule: {
    name: string;
    metric: string;
    condition: 'gt' | 'lt' | 'eq';
    threshold: number;
  }) => Promise<void>;
  toggleAlertRule: (id: string) => Promise<void>;
  fetchAlertEvents: () => Promise<void>;
  acknowledgeAlert: (id: string) => Promise<void>;
}

export function useObservability(): UseObservabilityReturn {
  const [metrics, setMetrics] = useState<ObservabilityMetrics | null>(null);
  const [traces, setTraces] = useState<Trace[]>([]);
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);
  const [traceSpans, setTraceSpans] = useState<TraceSpan[]>([]);
  const [costSummary, setCostSummary] = useState<CostSummary[]>([]);
  const [costByModel, setCostByModel] = useState<CostByModel[]>([]);
  const [latencyPercentiles, setLatencyPercentiles] = useState<LatencyPercentile[]>([]);
  const [latencyTimeseries, setLatencyTimeseries] = useState<LatencyTimeSeries[]>([]);
  const [slowTraces, setSlowTraces] = useState<TraceSpan[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [alertEvents, setAlertEvents] = useState<AlertEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async (days = 30) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/observability/metrics?days=${days}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setMetrics(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTraces = useCallback(
    async (params?: { limit?: number; offset?: number; user_id?: string; operation?: string }) => {
      setLoading(true);
      setError(null);
      try {
        const query = new URLSearchParams();
        if (params?.limit) query.set('limit', String(params.limit));
        if (params?.offset) query.set('offset', String(params.offset));
        if (params?.user_id) query.set('user_id', params.user_id);
        if (params?.operation) query.set('operation', params.operation);
        const res = await fetch(`${API_URL}/api/observability/traces?${query.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setTraces(data.traces || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const selectTrace = useCallback((trace: Trace | null) => {
    setSelectedTrace(trace);
  }, []);

  const fetchTraceDetail = useCallback(async (traceId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/observability/traces/${traceId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSelectedTrace(data.trace);
      setTraceSpans(data.spans || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCostSummary = useCallback(async (days = 30, model?: string) => {
    try {
      const query = new URLSearchParams({ days: String(days) });
      if (model) query.set('model', model);
      const res = await fetch(`${API_URL}/api/observability/cost/summary?${query.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCostSummary(data.summary || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const fetchCostByModel = useCallback(async (days = 30) => {
    try {
      const res = await fetch(`${API_URL}/api/observability/cost/by-model?days=${days}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCostByModel(data.models || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const fetchLatencyPercentiles = useCallback(async (days = 7, model?: string) => {
    try {
      const query = new URLSearchParams({ days: String(days) });
      if (model) query.set('model', model);
      const res = await fetch(
        `${API_URL}/api/observability/latency/percentiles?${query.toString()}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setLatencyPercentiles(data.percentiles || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const fetchLatencyTimeseries = useCallback(async (days = 30, model?: string) => {
    try {
      const query = new URLSearchParams({ days: String(days) });
      if (model) query.set('model', model);
      const res = await fetch(
        `${API_URL}/api/observability/latency/timeseries?${query.toString()}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setLatencyTimeseries(data.timeseries || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const fetchSlowTraces = useCallback(async (threshold = 5000, model?: string) => {
    try {
      const query = new URLSearchParams({ threshold_ms: String(threshold) });
      if (model) query.set('model', model);
      const res = await fetch(`${API_URL}/api/observability/latency/slow?${query.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSlowTraces(data.traces || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const fetchAlertRules = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/observability/alerts/rules`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAlertRules(data.rules || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const createAlertRule = useCallback(
    async (rule: {
      name: string;
      metric: string;
      condition: 'gt' | 'lt' | 'eq';
      threshold: number;
    }) => {
      try {
        const res = await fetch(`${API_URL}/api/observability/alerts/rules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rule),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        await fetchAlertRules();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    [fetchAlertRules]
  );

  const toggleAlertRule = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`${API_URL}/api/observability/alerts/rules/${id}/toggle`, {
          method: 'PUT',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        await fetchAlertRules();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    [fetchAlertRules]
  );

  const fetchAlertEvents = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/observability/alerts/events`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAlertEvents(data.events || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const acknowledgeAlert = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`${API_URL}/api/observability/alerts/events/${id}/acknowledge`, {
          method: 'PUT',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        await fetchAlertEvents();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    [fetchAlertEvents]
  );

  return {
    metrics,
    traces,
    selectedTrace,
    traceSpans,
    costSummary,
    costByModel,
    latencyPercentiles,
    latencyTimeseries,
    slowTraces,
    alertRules,
    alertEvents,
    loading,
    error,
    fetchMetrics,
    fetchTraces,
    selectTrace,
    fetchTraceDetail,
    fetchCostSummary,
    fetchCostByModel,
    fetchLatencyPercentiles,
    fetchLatencyTimeseries,
    fetchSlowTraces,
    fetchAlertRules,
    createAlertRule,
    toggleAlertRule,
    fetchAlertEvents,
    acknowledgeAlert,
  };
}
