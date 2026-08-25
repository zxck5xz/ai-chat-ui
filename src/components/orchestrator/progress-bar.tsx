'use client';

import { Progress } from '@/components/ui/progress';
import { AgentIcon } from './agent-icon';
import type { AgentType } from '@/types/agents';

interface ProgressBarProps {
  progress: number;
  currentAgent: AgentType | null;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'awaiting_approval';
}

export function ProgressBar({ progress, currentAgent, status }: ProgressBarProps) {
  if (status === 'idle') return null;

  const getStatusText = () => {
    switch (status) {
      case 'running':
        return currentAgent ? `Running ${currentAgent} agent...` : 'Starting workflow...';
      case 'completed':
        return 'Workflow completed!';
      case 'failed':
        return 'Workflow failed';
      case 'awaiting_approval':
        return 'Waiting for approval...';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {currentAgent && status === 'running' && <AgentIcon agent={currentAgent} size={16} />}
          <span className="text-sm text-muted-foreground">{getStatusText()}</span>
        </div>
        <span className="text-sm font-medium">{progress}%</span>
      </div>
      <Progress value={progress} className={`h-2 ${status === 'failed' ? 'bg-red-100' : ''}`} />
    </div>
  );
}
