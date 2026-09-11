'use client';

import { useState, useCallback, useRef } from 'react';
import type { DebateRun, DebateFormat, DebateMetrics, DebateEvent } from '@/types/debate';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

export function useDebate() {
  const [currentRun, setCurrentRun] = useState<DebateRun | null>(null);
  const [runs, setRuns] = useState<DebateRun[]>([]);
  const [runsTotal, setRunsTotal] = useState(0);
  const [metrics, setMetrics] = useState<DebateMetrics | null>(null);
  const [status, setStatus] = useState<
    'idle' | 'debating' | 'judging' | 'fact_checking' | 'consensus' | 'completed' | 'failed'
  >('idle');
  const [events, setEvents] = useState<DebateEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const runDebate = useCallback(async (question: string, format: DebateFormat = 'free_form') => {
    setStatus('debating');
    setEvents([]);
    setError(null);
    setCurrentRun(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(`${API_URL}/api/debate/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, format }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to run debate');
      }

      const data = await response.json();
      setCurrentRun(data.run);
      setEvents(data.events || []);
      setStatus('completed');
      return data.run;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setStatus('idle');
        return null;
      }
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('failed');
      return null;
    }
  }, []);

  const runDebateStream = useCallback(
    async (question: string, format: DebateFormat = 'free_form') => {
      setStatus('debating');
      setEvents([]);
      setError(null);
      setCurrentRun(null);

      const params = new URLSearchParams({ question, format });
      const eventSource = new EventSource(`${API_URL}/api/debate/run-stream?${params}`);

      const newEvents: DebateEvent[] = [];

      eventSource.addEventListener('debater_start', (e) => {
        const data = JSON.parse(e.data);
        newEvents.push({ type: 'debater_start', data, timestamp: new Date().toISOString() });
        setEvents([...newEvents]);
      });

      eventSource.addEventListener('argument', (e) => {
        const data = JSON.parse(e.data);
        newEvents.push({ type: 'argument', data, timestamp: new Date().toISOString() });
        setEvents([...newEvents]);
      });

      eventSource.addEventListener('judge_start', () => {
        setStatus('judging');
        newEvents.push({ type: 'judge_start', data: {}, timestamp: new Date().toISOString() });
        setEvents([...newEvents]);
      });

      eventSource.addEventListener('verdict', (e) => {
        const data = JSON.parse(e.data);
        newEvents.push({ type: 'verdict', data, timestamp: new Date().toISOString() });
        setEvents([...newEvents]);
      });

      eventSource.addEventListener('fact_check_start', () => {
        setStatus('fact_checking');
        newEvents.push({ type: 'fact_check_start', data: {}, timestamp: new Date().toISOString() });
        setEvents([...newEvents]);
      });

      eventSource.addEventListener('fact_check', (e) => {
        const data = JSON.parse(e.data);
        newEvents.push({ type: 'fact_check', data, timestamp: new Date().toISOString() });
        setEvents([...newEvents]);
      });

      eventSource.addEventListener('consensus_start', () => {
        setStatus('consensus');
        newEvents.push({ type: 'consensus_start', data: {}, timestamp: new Date().toISOString() });
        setEvents([...newEvents]);
      });

      eventSource.addEventListener('consensus', (e) => {
        const data = JSON.parse(e.data);
        newEvents.push({ type: 'consensus', data, timestamp: new Date().toISOString() });
        setEvents([...newEvents]);
      });

      eventSource.addEventListener('complete', (e) => {
        const data = JSON.parse(e.data);
        newEvents.push({ type: 'complete', data, timestamp: new Date().toISOString() });
        setEvents([...newEvents]);
        setStatus('completed');
        eventSource.close();
      });

      eventSource.addEventListener('error', (e) => {
        if (e instanceof MessageEvent) {
          const data = JSON.parse(e.data);
          setError(data.message);
        }
        setStatus('failed');
        eventSource.close();
      });

      return () => eventSource.close();
    },
    []
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const fetchRuns = useCallback(async (limit = 20, offset = 0) => {
    try {
      const response = await fetch(`${API_URL}/api/debate/runs?limit=${limit}&offset=${offset}`);
      if (!response.ok) throw new Error('Failed to fetch runs');
      const data = await response.json();
      setRuns(data.runs);
      setRunsTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch runs');
    }
  }, []);

  const fetchRun = useCallback(async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/debate/runs/${id}`);
      if (!response.ok) throw new Error('Failed to fetch run');
      const data = await response.json();
      setCurrentRun(data.run);
      return data.run;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch run');
      return null;
    }
  }, []);

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/debate/metrics`);
      if (!response.ok) throw new Error('Failed to fetch metrics');
      const data = await response.json();
      setMetrics(data.metrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    }
  }, []);

  const reset = useCallback(() => {
    setCurrentRun(null);
    setEvents([]);
    setStatus('idle');
    setError(null);
  }, []);

  return {
    currentRun,
    runs,
    runsTotal,
    metrics,
    status,
    events,
    error,
    runDebate,
    runDebateStream,
    stop,
    fetchRuns,
    fetchRun,
    fetchMetrics,
    reset,
  };
}
