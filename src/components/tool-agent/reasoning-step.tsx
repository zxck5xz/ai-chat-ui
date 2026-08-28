'use client';

import type { ToolAgentStep } from '@/types/tool-agent';
import { ToolCallCard } from './tool-call-card';
import { Brain, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface ReasoningStepProps {
  step: ToolAgentStep;
  stepIndex: number;
  isActive: boolean;
}

export function ReasoningStep({ step, stepIndex, isActive }: ReasoningStepProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      className={`border rounded-lg overflow-hidden ${isActive ? 'border-blue-500 ring-1 ring-blue-500/20' : ''}`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 p-3 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <Brain className="h-4 w-4 text-blue-500" />
          <span className="font-medium text-sm">Step {stepIndex + 1}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {step.toolCalls.length > 0 && (
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
              {step.toolCalls.length} tool{step.toolCalls.length > 1 ? 's' : ''}
            </span>
          )}
          {isActive && <span className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />}
        </div>
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-3">
          {step.thought && (
            <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md whitespace-pre-wrap">
              {step.thought}
            </div>
          )}

          {step.toolCalls.length > 0 && (
            <div className="space-y-2">
              {step.toolCalls.map((tc) => (
                <ToolCallCard key={tc.id} toolCall={tc} />
              ))}
            </div>
          )}

          {step.result && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Result:</span>
              <pre className="bg-muted p-2 rounded mt-1 overflow-x-auto max-h-32 overflow-y-auto">
                {step.result}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
