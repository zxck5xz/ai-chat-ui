'use client';

import { useCallback, useState } from 'react';
import type { ToolAgentRun, ToolAgentStep, ToolAgentEvent } from '@/types/tool-agent';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

export function useToolAgent() {
  const [steps, setSteps] = useState<ToolAgentStep[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [finalAnswer, setFinalAnswer] = useState('');
  const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [currentThought, setCurrentThought] = useState('');
  const [totalToolCalls, setTotalToolCalls] = useState(0);
  const [runs, setRuns] = useState<ToolAgentRun[]>([]);

  const runQuery = useCallback(async (query: string) => {
    setError(null);
    setSteps([]);
    setCurrentStep(0);
    setFinalAnswer('');
    setStatus('running');
    setCurrentThought('');
    setTotalToolCalls(0);

    try {
      const response = await fetch(`${API_URL}/api/tool-agent/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.message || `HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (!reader) throw new Error('No readable stream');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const data = trimmed.slice(6);
          if (data === '[DONE]') continue;

          try {
            const event: ToolAgentEvent & { run?: ToolAgentRun } = JSON.parse(data);

            switch (event.type) {
              case 'step_start':
                setCurrentStep(event.stepIndex ?? 0);
                setSteps((prev) => [...prev, { thought: '', toolCalls: [] }]);
                break;

              case 'thinking':
                setCurrentThought(event.thought || '');
                setSteps((prev) =>
                  prev.map((s, i) =>
                    i === (event.stepIndex ?? 0) ? { ...s, thought: event.thought || '' } : s
                  )
                );
                break;

              case 'tool_call':
                setTotalToolCalls((p) => p + 1);
                setSteps((prev) =>
                  prev.map((s, i) =>
                    i === (event.stepIndex ?? 0)
                      ? {
                          ...s,
                          toolCalls: [...s.toolCalls, event.toolCall!],
                        }
                      : s
                  )
                );
                break;

              case 'tool_result':
                setSteps((prev) =>
                  prev.map((s, i) =>
                    i === (event.stepIndex ?? 0)
                      ? {
                          ...s,
                          toolCalls: s.toolCalls.map((tc) =>
                            tc.name === event.toolName && tc.status === 'running'
                              ? {
                                  ...tc,
                                  output: event.toolOutput || '',
                                  status: 'completed' as const,
                                }
                              : tc
                          ),
                        }
                      : s
                  )
                );
                break;

              case 'step_complete':
                setSteps((prev) =>
                  prev.map((s, i) =>
                    i === (event.stepIndex ?? 0) ? { ...s, result: event.content || '' } : s
                  )
                );
                break;

              case 'final_answer':
                setFinalAnswer(event.content || '');
                break;

              case 'run_complete':
                setStatus('completed');
                setCurrentThought('');
                if (event.run) {
                  setRuns((prev) => [event.run!, ...prev].slice(0, 20));
                }
                break;

              case 'error':
                setError(event.error || 'Unknown error');
                setStatus('failed');
                break;
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setStatus('failed');
    }
  }, []);

  const reset = useCallback(() => {
    setSteps([]);
    setCurrentStep(0);
    setFinalAnswer('');
    setStatus('idle');
    setError(null);
    setCurrentThought('');
    setTotalToolCalls(0);
  }, []);

  const progress =
    steps.length > 0
      ? Math.min(
          100,
          Math.round(
            (steps.filter((s) => s.result !== undefined).length / Math.max(steps.length, 1)) * 100
          )
        )
      : 0;

  return {
    steps,
    currentStep,
    finalAnswer,
    status,
    error,
    currentThought,
    totalToolCalls,
    progress,
    runs,
    runQuery,
    reset,
  };
}
