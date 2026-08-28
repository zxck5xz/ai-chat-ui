'use client';

import type { ToolCall } from '@/types/tool-agent';
import { Loader2, CheckCircle2, XCircle, Wrench } from 'lucide-react';

interface ToolCallCardProps {
  toolCall: ToolCall;
}

export function ToolCallCard({ toolCall }: ToolCallCardProps) {
  const statusIcon = {
    pending: <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />,
    running: <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />,
    completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    failed: <XCircle className="h-4 w-4 text-red-500" />,
  }[toolCall.status];

  const toolColor =
    {
      search_web: 'text-orange-500 bg-orange-500/10',
      http_request: 'text-blue-500 bg-blue-500/10',
      calculate: 'text-green-500 bg-green-500/10',
      get_current_time: 'text-purple-500 bg-purple-500/10',
    }[toolCall.name] || 'text-gray-500 bg-gray-500/10';

  return (
    <div className="border rounded-lg p-3 bg-card">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-md ${toolColor}`}>
          <Wrench className="h-3.5 w-3.5" />
        </div>
        <span className="font-mono text-sm font-medium">{toolCall.name}</span>
        <div className="ml-auto flex items-center gap-1.5">
          {statusIcon}
          <span className="text-xs text-muted-foreground capitalize">{toolCall.status}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <span className="text-xs font-medium text-muted-foreground">Input:</span>
          <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
            {JSON.stringify(toolCall.input, null, 2)}
          </pre>
        </div>

        {toolCall.output && (
          <div>
            <span className="text-xs font-medium text-muted-foreground">Output:</span>
            <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto max-h-48 overflow-y-auto">
              {toolCall.output}
            </pre>
          </div>
        )}

        {toolCall.error && (
          <div>
            <span className="text-xs font-medium text-red-500">Error:</span>
            <pre className="text-xs bg-red-500/10 text-red-400 p-2 rounded mt-1 overflow-x-auto">
              {toolCall.error}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
