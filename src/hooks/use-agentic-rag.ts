'use client';

import { useCallback, useState, useRef } from 'react';
import type { AgenticRAGRun, AgenticRAGEvent, QueryAnalysis } from '@/types/agentic-rag';

export interface AgenticRAGMetrics {
  totalRuns: number;
  avgConfidence: number;
  avgRounds: number;
  avgLatencyMs: number;
  hallucinationRate: number;
  correctionRate: number;
  runsByIntent: Record<string, number>;
  runsByStrategy: Record<string, number>;
  confidenceDistribution: Array<{ range: string; count: number }>;
  recentRuns: AgenticRAGRun[];
}

export interface HallucinationCheckClaim {
  text: string;
  verdict: 'SUPPORTED' | 'UNSUPPORTED' | 'CONTRADICTED';
  sourceIndex: number[];
  sourceQuote: string;
  confidence: number;
}

export interface HallucinationCheckResult {
  claims: HallucinationCheckClaim[];
  overallScore: number;
  unsupportedCount: number;
  contradictedCount: number;
  citationAccuracy: number;
  hallucinationDetected: boolean;
  summary: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

export function useAgenticRAG() {
  const [run, setRun] = useState<AgenticRAGRun | null>(null);
  const [events, setEvents] = useState<AgenticRAGEvent[]>([]);
  const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<QueryAnalysis | null>(null);
  const [runs, setRuns] = useState<AgenticRAGRun[]>([]);
  const [runsTotal, setRunsTotal] = useState(0);
  const [metrics, setMetrics] = useState<AgenticRAGMetrics | null>(null);
  const [hallucinationResult, setHallucinationResult] = useState<HallucinationCheckResult | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const analyzeQuery = useCallback(async (query: string) => {
    try {
      const res = await fetch(`${API_URL}/api/agentic-rag/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setAnalysis(data.analysis);
      return data.analysis;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return null;
    }
  }, []);

  const runPipeline = useCallback(async (
    query: string,
    options?: { maxRounds?: number; confidenceThreshold?: number; topK?: number }
  ) => {
    setError(null);
    setStatus('running');
    setRun(null);
    setEvents([]);
    setHallucinationResult(null);
    abortRef.current = new AbortController();

    try {
      const res = await fetch(`${API_URL}/api/agentic-rag/run-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, ...options }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No readable stream');

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('event: ')) continue;

          const eventType = trimmed.slice(7).trim();
          const dataLine = lines[lines.indexOf(line) + 1];

          if (!dataLine || !dataLine.startsWith('data: ')) continue;

          const raw = dataLine.slice(6).trim();
          if (!raw) continue;

          try {
            const parsed = JSON.parse(raw);

            if (eventType === 'complete') {
              setRun(parsed.run);
              setStatus('completed');
            } else if (eventType === 'error') {
              setError(parsed.message);
              setStatus('error');
            } else {
              setEvents((prev) => [...prev, {
                type: eventType as AgenticRAGEvent['type'],
                data: parsed,
                timestamp: new Date().toISOString(),
              }]);
            }
          } catch {
            // skip malformed
          }
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setStatus('idle');
      } else {
        setError(err instanceof Error ? err.message : String(err));
        setStatus('error');
      }
    }
  }, []);

  const runSimple = useCallback(async (
    query: string,
    options?: { maxRounds?: number; confidenceThreshold?: number; topK?: number }
  ) => {
    setError(null);
    setStatus('running');
    setRun(null);
    setEvents([]);
    setHallucinationResult(null);

    try {
      const res = await fetch(`${API_URL}/api/agentic-rag/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, ...options }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      setRun(data.result);
      setEvents(data.result.events || []);
      setStatus('completed');
      return data.result;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStatus('error');
      return null;
    }
  }, []);

  const checkHallucination = useCallback(async (
    query: string,
    answer: string,
    sources: Array<{ content: string; documentTitle: string; score: number }>
  ) => {
    try {
      const res = await fetch(`${API_URL}/api/agentic-rag/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, answer, sources }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      setHallucinationResult(data.result);
      return data.result;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return null;
    }
  }, []);

  const fetchRuns = useCallback(async (limit = 20, offset = 0) => {
    try {
      const res = await fetch(`${API_URL}/api/agentic-rag/runs?limit=${limit}&offset=${offset}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      setRuns(data.runs || []);
      setRunsTotal(data.total || 0);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return null;
    }
  }, []);

  const fetchRun = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/agentic-rag/runs/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      setRun(data.run);
      return data.run;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return null;
    }
  }, []);

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/agentic-rag/metrics`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      setMetrics(data.metrics);
      return data.metrics;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return null;
    }
  }, []);

  const deleteRun = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/agentic-rag/runs/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      setRuns((prev) => prev.filter((r) => r.id !== id));
      setRunsTotal((prev) => prev - 1);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return false;
    }
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setStatus('idle');
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setRun(null);
    setEvents([]);
    setAnalysis(null);
    setError(null);
    setHallucinationResult(null);
  }, []);

  return {
    run,
    events,
    status,
    error,
    analysis,
    runs,
    runsTotal,
    metrics,
    hallucinationResult,
    analyzeQuery,
    runPipeline,
    runSimple,
    checkHallucination,
    fetchRuns,
    fetchRun,
    fetchMetrics,
    deleteRun,
    stop,
    reset,
  };
}
