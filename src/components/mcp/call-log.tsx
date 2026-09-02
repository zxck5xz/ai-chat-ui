'use client';

import type { MCPCallLog } from '@/types/mcp';
import { CheckCircle, XCircle } from 'lucide-react';

interface CallLogProps {
  log: MCPCallLog[];
}

export function CallLog({ log }: CallLogProps) {
  if (log.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>No calls logged yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {log.map((entry) => (
        <div
          key={entry.id}
          className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {entry.status === 'ok' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="font-mono text-sm font-medium">{entry.toolName}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{entry.latencyMs.toFixed(0)}ms</span>
              <span>{new Date(entry.createdAt).toLocaleString()}</span>
            </div>
          </div>

          {entry.errorMessage && <p className="mt-2 text-xs text-red-500">{entry.errorMessage}</p>}

          {entry.resultSummary && (
            <pre className="mt-2 text-xs overflow-auto max-h-[100px] p-2 rounded bg-muted">
              {(() => {
                try {
                  return JSON.stringify(JSON.parse(entry.resultSummary), null, 2);
                } catch {
                  return entry.resultSummary;
                }
              })()}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}
