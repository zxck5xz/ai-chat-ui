'use client';

import { useCallback, useState } from 'react';
import type { AgentTask, WorkflowRun, WorkflowEvent, AgentType } from '@/types/agents';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

export function useOrchestrator() {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [status, setStatus] = useState<
    'idle' | 'running' | 'completed' | 'failed' | 'awaiting_approval'
  >('idle');
  const [currentAgent, setCurrentAgent] = useState<AgentType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowRun | null>(null);
  const [pendingApproval, setPendingApproval] = useState<{
    approvalId: string;
    taskId: string;
    agent: string;
    input: string;
  } | null>(null);

  const runWorkflow = useCallback(async (input: string, requireApproval = false) => {
    setError(null);
    setTasks([]);
    setStatus('running');
    setCurrentAgent(null);
    setPendingApproval(null);

    try {
      const response = await fetch(`${API_URL}/api/orchestrator/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, requireApproval }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.message || `HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (!reader) {
        throw new Error('No readable stream');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith('data: ')) {
            const data = trimmed.slice(6);
            if (data === '[DONE]') continue;

            try {
              const event: WorkflowEvent = JSON.parse(data);

              switch (event.type) {
                case 'task_start':
                  setCurrentAgent(event.agent || null);
                  setTasks((prev) => {
                    const existing = prev.find((t) => t.id === event.taskId);
                    if (existing) {
                      return prev.map((t) =>
                        t.id === event.taskId ? { ...t, status: 'running' as const } : t
                      );
                    }
                    return [
                      ...prev,
                      {
                        id: event.taskId || crypto.randomUUID(),
                        agent: event.agent || 'planner',
                        status: 'running' as const,
                        input: '',
                        output: '',
                        startedAt: new Date().toISOString(),
                      },
                    ];
                  });
                  break;

                case 'task_complete':
                  setTasks((prev) =>
                    prev.map((t) =>
                      t.id === event.taskId
                        ? {
                            ...t,
                            status: 'completed' as const,
                            output: event.content || '',
                            completedAt: new Date().toISOString(),
                          }
                        : t
                    )
                  );
                  break;

                case 'task_error':
                  setTasks((prev) =>
                    prev.map((t) =>
                      t.id === event.taskId
                        ? {
                            ...t,
                            status: 'failed' as const,
                            error: event.error || 'Unknown error',
                            completedAt: new Date().toISOString(),
                          }
                        : t
                    )
                  );
                  break;

                case 'workflow_result':
                  if (event.workflow) {
                    setWorkflow(event.workflow);
                    setTasks(event.workflow.tasks);
                    setStatus(event.workflow.status === 'completed' ? 'completed' : 'failed');
                  }
                  break;

                case 'workflow_complete':
                  setStatus('completed');
                  setCurrentAgent(null);
                  break;

                case 'approval_needed':
                  setStatus('awaiting_approval');
                  setPendingApproval({
                    approvalId: event.approvalId || '',
                    taskId: event.taskId || '',
                    agent: event.agent || '',
                    input: event.content || '',
                  });
                  break;
              }
            } catch {
              // Skip malformed JSON
            }
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
    setTasks([]);
    setStatus('idle');
    setCurrentAgent(null);
    setError(null);
    setWorkflow(null);
    setPendingApproval(null);
  }, []);

  const approveTask = useCallback(async () => {
    if (!pendingApproval) return;

    try {
      await fetch(`${API_URL}/api/orchestrator/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalId: pendingApproval.approvalId }),
      });
      setStatus('running');
      setPendingApproval(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  }, [pendingApproval]);

  const rejectTask = useCallback(async () => {
    if (!pendingApproval) return;

    try {
      await fetch(`${API_URL}/api/orchestrator/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalId: pendingApproval.approvalId }),
      });
      setStatus('running');
      setPendingApproval(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  }, [pendingApproval]);

  const progress =
    tasks.length > 0
      ? Math.round(
          (tasks.filter((t) => t.status === 'completed' || t.status === 'failed').length /
            tasks.length) *
            100
        )
      : 0;

  return {
    tasks,
    status,
    currentAgent,
    error,
    workflow,
    progress,
    pendingApproval,
    runWorkflow,
    reset,
    approveTask,
    rejectTask,
  };
}
