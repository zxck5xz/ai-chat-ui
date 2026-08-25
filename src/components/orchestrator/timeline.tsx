'use client';

import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { AgentIcon } from './agent-icon';
import type { AgentTask } from '@/types/agents';

interface TimelineProps {
  tasks: AgentTask[];
}

const statusConfig = {
  pending: { icon: Clock, color: 'text-gray-400', bgColor: 'bg-gray-100' },
  running: { icon: Loader2, color: 'text-blue-500', bgColor: 'bg-blue-50', animate: true },
  completed: { icon: CheckCircle2, color: 'text-green-500', bgColor: 'bg-green-50' },
  failed: { icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-50' },
  awaiting_approval: { icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-50' },
};

export function Timeline({ tasks }: TimelineProps) {
  if (tasks.length === 0) return null;

  return (
    <div className="space-y-1">
      {tasks.map((task, index) => {
        const config = statusConfig[task.status];
        const StatusIcon = config.icon;

        return (
          <div key={task.id} className="flex items-start gap-3 group">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${config.bgColor}`}
              >
                <StatusIcon
                  size={16}
                  className={`${config.color} ${'animate' in config && config.animate ? 'animate-spin' : ''}`}
                />
              </div>
              {index < tasks.length - 1 && (
                <div className="w-0.5 h-6 bg-gray-200 mt-1" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2">
                <AgentIcon agent={task.agent} size={14} />
                <span className="text-sm font-medium capitalize">{task.status}</span>
                {task.completedAt && (
                  <span className="text-xs text-muted-foreground">
                    {new Date(task.completedAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
              {task.output && task.status === 'completed' && (
                <div className="mt-2 text-sm text-muted-foreground bg-muted rounded-md p-3 max-h-40 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-mono text-xs">
                    {task.output.slice(0, 500)}
                    {task.output.length > 500 && '...'}
                  </pre>
                </div>
              )}
              {task.error && (
                <div className="mt-2 text-sm text-red-600 bg-red-50 rounded-md p-3">
                  {task.error}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
