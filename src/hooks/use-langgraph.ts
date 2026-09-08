'use client';

import { useCallback, useState } from 'react';
import type { LangGraphPattern, LangGraphRun } from '@/types/langgraph';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

export function useLangGraph() {
  const [patterns, setPatterns] = useState<LangGraphPattern[]>([]);
  const [runs, setRuns] = useState<LangGraphRun[]>([]);
  const [currentRun, setCurrentRun] = useState<LangGraphRun | null>(null);
  const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const fetchPatterns = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/langgraph/patterns`);
      const data = await res.json();
      setPatterns(data.patterns || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const fetchRuns = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/langgraph/runs`);
      const data = await res.json();
      setRuns(data.runs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const runWorkflow = useCallback(async (pattern: string, task: string) => {
    setError(null);
    setStatus('running');
    setCurrentRun(null);

    try {
      const res = await fetch(`${API_URL}/api/langgraph/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern, task }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      setCurrentRun(data);
      setStatus(data.status === 'completed' ? 'completed' : 'error');
      setRuns((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setStatus('error');
      return null;
    }
  }, []);

  const fetchThread = useCallback(async (threadId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/langgraph/thread/${threadId}`);
      const data = await res.json();
      setCurrentRun(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setCurrentRun(null);
    setError(null);
  }, []);

  return {
    patterns,
    runs,
    currentRun,
    status,
    error,
    fetchPatterns,
    fetchRuns,
    runWorkflow,
    fetchThread,
    reset,
  };
}
