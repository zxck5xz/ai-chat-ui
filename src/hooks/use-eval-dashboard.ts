'use client';

import { useCallback, useState } from 'react';
import type { EvalMetrics, TimeSeriesPoint, EvalRun, EvalResult, FailureCase, SafetyGate, GateCheckResult, DeployApproval } from '@/types/eval';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

interface UseEvalDashboardReturn {
  metrics: EvalMetrics | null;
  timeseries: TimeSeriesPoint[];
  runs: EvalRun[];
  selectedRun: EvalRun | null;
  runResults: EvalResult[];
  failures: FailureCase[];
  gates: SafetyGate[];
  approvals: DeployApproval[];
  loading: boolean;
  error: string | null;
  fetchMetrics: (params?: { model_version?: string; start_date?: string; end_date?: string }) => Promise<void>;
  fetchTimeseries: (params?: { model_version?: string; days?: number }) => Promise<void>;
  fetchRuns: (params?: { model_version?: string; status?: string }) => Promise<void>;
  selectRun: (run: EvalRun | null) => void;
  fetchRunResults: (runId: string, passed?: boolean) => Promise<void>;
  fetchFailures: (model_version?: string) => Promise<void>;
  fetchGates: () => Promise<void>;
  checkGates: (runId: string) => Promise<GateCheckResult | null>;
  createApproval: (evalRunId: string) => Promise<void>;
  resolveApproval: (approvalId: string, status: 'approved' | 'rejected', comment?: string) => Promise<void>;
}

export function useEvalDashboard(): UseEvalDashboardReturn {
  const [metrics, setMetrics] = useState<EvalMetrics | null>(null);
  const [timeseries, setTimeseries] = useState<TimeSeriesPoint[]>([]);
  const [runs, setRuns] = useState<EvalRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<EvalRun | null>(null);
  const [runResults, setRunResults] = useState<EvalResult[]>([]);
  const [failures, setFailures] = useState<FailureCase[]>([]);
  const [gates, setGates] = useState<SafetyGate[]>([]);
  const [approvals, setApprovals] = useState<DeployApproval[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async (params?: { model_version?: string; start_date?: string; end_date?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (params?.model_version) query.set('model_version', params.model_version);
      if (params?.start_date) query.set('start_date', params.start_date);
      if (params?.end_date) query.set('end_date', params.end_date);

      const response = await fetch(`${API_URL}/api/eval/metrics?${query.toString()}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTimeseries = useCallback(async (params?: { model_version?: string; days?: number }) => {
    try {
      const query = new URLSearchParams();
      if (params?.model_version) query.set('model_version', params.model_version);
      if (params?.days) query.set('days', String(params.days));

      const response = await fetch(`${API_URL}/api/eval/metrics/timeseries?${query.toString()}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setTimeseries(data.timeseries || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const fetchRuns = useCallback(async (params?: { model_version?: string; status?: string }) => {
    try {
      const query = new URLSearchParams();
      if (params?.model_version) query.set('model_version', params.model_version);
      if (params?.status) query.set('status', params.status);

      const response = await fetch(`${API_URL}/api/eval/runs?${query.toString()}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setRuns(data.runs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const selectRun = useCallback((run: EvalRun | null) => {
    setSelectedRun(run);
  }, []);

  const fetchRunResults = useCallback(async (runId: string, passed?: boolean) => {
    try {
      const query = new URLSearchParams();
      if (passed !== undefined) query.set('passed', String(passed));

      const response = await fetch(`${API_URL}/api/eval/runs/${runId}/results?${query.toString()}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setRunResults(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const fetchFailures = useCallback(async (model_version?: string) => {
    try {
      const query = new URLSearchParams();
      if (model_version) query.set('model_version', model_version);

      const response = await fetch(`${API_URL}/api/eval/failures?${query.toString()}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setFailures(data.failures || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const fetchGates = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/safety/gates`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setGates(data.gates || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const checkGates = useCallback(async (runId: string): Promise<GateCheckResult | null> => {
    try {
      const response = await fetch(`${API_URL}/api/safety/check/${runId}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return null;
    }
  }, []);

  const createApproval = useCallback(async (evalRunId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/safety/approvals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eval_run_id: evalRunId }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const resolveApproval = useCallback(async (approvalId: string, status: 'approved' | 'rejected', comment?: string) => {
    try {
      const response = await fetch(`${API_URL}/api/safety/approvals/${approvalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, comment }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  return {
    metrics,
    timeseries,
    runs,
    selectedRun,
    runResults,
    failures,
    gates,
    approvals,
    loading,
    error,
    fetchMetrics,
    fetchTimeseries,
    fetchRuns,
    selectRun,
    fetchRunResults,
    fetchFailures,
    fetchGates,
    checkGates,
    createApproval,
    resolveApproval,
  };
}
