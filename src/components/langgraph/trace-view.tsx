'use client';

import type { LangGraphTrace, LangGraphNode } from '@/types/langgraph';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface Props {
  trace?: LangGraphTrace;
}

export function TraceView({ trace }: Props) {
  if (!trace) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Execution Trace</h3>
        <span className="text-xs text-muted-foreground">{trace.totalDuration}ms total</span>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

        <div className="space-y-1">
          {(trace.nodes || []).map((node, i) => (
            <TraceNode key={i} node={node} index={i} total={trace.nodes.length} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TraceNode({ node, index, total }: { node: LangGraphNode; index: number; total: number }) {
  const isError = !!node.error;
  const isLast = index === total - 1;

  return (
    <div className="relative flex items-start gap-3 pl-1">
      {/* Node dot */}
      <div
        className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-full border-2 ${
          isError ? 'border-red-500 bg-red-500/10' : 'border-green-500 bg-green-500/10'
        }`}
      >
        {isError ? (
          <XCircle size={14} className="text-red-500" />
        ) : (
          <CheckCircle size={14} className="text-green-500" />
        )}
      </div>

      {/* Node content */}
      <div className={`flex-1 pb-4 ${isLast ? 'pb-0' : ''}`}>
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{node.nodeId}</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock size={12} />
            {node.duration}ms
          </span>
        </div>
        {node.error && <p className="text-xs text-red-500 mt-1">{node.error}</p>}
        {node.stateUpdate && Object.keys(node.stateUpdate).length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {Object.keys(node.stateUpdate).map((key) => (
              <span
                key={key}
                className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary"
              >
                {key}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
