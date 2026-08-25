'use client';

import { useState } from 'react';
import { Send, RotateCcw, Sparkles } from 'lucide-react';
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
  const { tasks, status, currentAgent, error, progress, runWorkflow, reset } = useOrchestrator();

  const handleSubmit = () => {
    if (!input.trim() || status === 'running') return;
    runWorkflow(input.trim());
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
        </div>

        {/* Progress */}
        <ProgressBar progress={progress} currentAgent={currentAgent} status={status} />

        {/* Error */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>
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
