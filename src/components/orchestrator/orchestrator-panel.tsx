'use client';

import { useState } from 'react';
import { Send, RotateCcw, Sparkles, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrchestrator } from '@/hooks/use-orchestrator';
import { ProgressBar } from './progress-bar';
import { Timeline } from './timeline';
import { DesignSpecViewer } from './design-spec-viewer';
import { CodeViewer } from './code-viewer';
import { ReviewResults } from './review-results';
import type { DesignSpec, CodeResult, ReviewResult, AgentType } from '@/types/agents';

export function OrchestratorPanel() {
  const [input, setInput] = useState('');
  const [requireApproval, setRequireApproval] = useState(false);
  const {
    tasks,
    status,
    currentAgent,
    error,
    progress,
    pendingApproval,
    runWorkflow,
    reset,
    approveTask,
    rejectTask,
  } = useOrchestrator();

  const handleSubmit = () => {
    if (!input.trim() || status === 'running') return;
    runWorkflow(input.trim(), requireApproval);
  };

  const getAgentOutput = <T,>(agent: AgentType): T | null => {
    const task = tasks.find((t) => t.agent === agent && t.status === 'completed');
    if (!task?.output) return null;
    try {
      return JSON.parse(task.output) as T;
    } catch {
      return null;
    }
  };

  const designSpec = getAgentOutput<DesignSpec>('designer');
  const codeResult = getAgentOutput<CodeResult>('coder');
  const reviewResult = getAgentOutput<ReviewResult>('reviewer');

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles size={20} className="text-violet-500" />
          Multi-Agent Orchestrator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input */}
        <div className="space-y-3">
          <Textarea
            placeholder="Describe what you want to build... (e.g., 'Create a pricing page with 3 tiers')"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSubmit();
              }
            }}
            rows={3}
            disabled={status === 'running'}
          />
          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || status === 'running'}
              className="flex items-center gap-2"
            >
              <Send size={16} />
              {status === 'running' ? 'Running...' : 'Run Workflow'}
            </Button>
            {status !== 'idle' && (
              <Button variant="outline" onClick={reset} className="flex items-center gap-2">
                <RotateCcw size={16} />
                Reset
              </Button>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={requireApproval}
              onChange={(e) => setRequireApproval(e.target.checked)}
              className="rounded"
            />
            Require approval before each agent
          </label>
        </div>

        {/* Progress */}
        <ProgressBar progress={progress} currentAgent={currentAgent} status={status} />

        {/* Error */}
        {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}

        {/* Approval Panel */}
        {pendingApproval && (
          <div className="border border-yellow-300 bg-yellow-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-yellow-800 font-medium">
              <Sparkles size={16} />
              Approval Required — {pendingApproval.agent}
            </div>
            <p className="text-sm text-yellow-700">{pendingApproval.input}</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={approveTask}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
              >
                <Check size={14} /> Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={rejectTask}
                className="flex items-center gap-1"
              >
                <X size={14} /> Reject
              </Button>
            </div>
          </div>
        )}

        {/* Timeline */}
        {tasks.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">Workflow Progress</h3>
            <Timeline tasks={tasks} />
          </div>
        )}

        {/* Results */}
        {(designSpec || codeResult || reviewResult) && (
          <div className="space-y-4">
            <h3 className="font-medium">Results</h3>
            {designSpec && <DesignSpecViewer result={designSpec} />}
            {codeResult && <CodeViewer result={codeResult} />}
            {reviewResult && <ReviewResults result={reviewResult} />}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
