'use client';

import type { AgenticRAGStep, StepType } from '@/types/agentic-rag';
import { cn } from '@/lib/utils';
import { Brain, Search, MessageSquare, Shield, RefreshCw, Layers, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const STEP_CONFIG: Record<StepType, { icon: typeof Brain; color: string; label: string }> = {
  classify: { icon: Brain, color: 'text-violet-500', label: 'Classify' },
  retrieve: { icon: Search, color: 'text-blue-500', label: 'Retrieve' },
  generate: { icon: MessageSquare, color: 'text-green-500', label: 'Generate' },
  evaluate: { icon: Shield, color: 'text-orange-500', label: 'Evaluate' },
  correct: { icon: RefreshCw, color: 'text-yellow-500', label: 'Correct' },
  synthesize: { icon: Layers, color: 'text-cyan-500', label: 'Synthesize' },
};

function StepCard({ step }: { step: AgenticRAGStep }) {
  const [expanded, setExpanded] = useState(false);
  const config = STEP_CONFIG[step.type];
  const Icon = config.icon;

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
      >
        <div className={cn('p-1.5 rounded-md bg-muted', config.color)}>
          <Icon size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{config.label}</span>
            <span className="text-xs text-muted-foreground">Step {step.stepNumber}</span>
          </div>
          <p className="text-xs text-muted-foreground truncate">{step.query}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{step.latencyMs}ms</span>
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
      </button>

      {expanded && (
        <div className="p-3 pt-0 border-t bg-muted/30 space-y-2 text-xs">
          <div>
            <span className="font-medium text-muted-foreground">Input:</span>
            <pre className="mt-1 p-2 bg-background rounded overflow-x-auto whitespace-pre-wrap">
              {step.input.length > 300 ? step.input.slice(0, 300) + '...' : step.input}
            </pre>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Output:</span>
            <pre className="mt-1 p-2 bg-background rounded overflow-x-auto whitespace-pre-wrap">
              {step.output.length > 500 ? step.output.slice(0, 500) + '...' : step.output}
            </pre>
          </div>
          {Object.keys(step.metadata).length > 0 && (
            <div>
              <span className="font-medium text-muted-foreground">Metadata:</span>
              <pre className="mt-1 p-2 bg-background rounded overflow-x-auto">
                {JSON.stringify(step.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function StepTimeline({ steps }: { steps: AgenticRAGStep[] }) {
  if (steps.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Pipeline Steps</h3>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />

        <div className="space-y-1 relative">
          {steps.map((step) => (
            <div key={step.stepNumber} className="relative pl-10">
              <div className="absolute left-2.5 top-3 w-3 h-3 rounded-full bg-background border-2 border-border" />
              <StepCard step={step} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
