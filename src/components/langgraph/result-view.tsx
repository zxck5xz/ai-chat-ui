'use client';

import type { LangGraphRun } from '@/types/langgraph';
import { CheckCircle, XCircle, DollarSign, Clock, Cpu } from 'lucide-react';

interface Props {
  run: LangGraphRun;
}

export function ResultView({ run }: Props) {
  const isSuccess = run.status === 'completed';

  return (
    <div className="space-y-4">
      {/* Status */}
      <div
        className={`flex items-center gap-2 p-3 rounded-lg ${
          isSuccess ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
        }`}
      >
        {isSuccess ? <CheckCircle size={18} /> : <XCircle size={18} />}
        <span className="font-medium text-sm">
          {isSuccess ? 'Workflow Completed' : 'Workflow Failed'}
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <MetricCard
          icon={<Clock size={16} />}
          label="Duration"
          value={`${run.trace?.totalDuration ?? 0}ms`}
        />
        <MetricCard
          icon={<Cpu size={16} />}
          label="Nodes"
          value={`${run.trace?.nodes?.length ?? 0}`}
        />
        <MetricCard
          icon={<DollarSign size={16} />}
          label="Cost"
          value={run.cost ? `$${run.cost.totalUsd.toFixed(4)}` : 'N/A'}
        />
      </div>

      {/* Result */}
      <div>
        <h4 className="text-sm font-medium mb-2">Result</h4>
        <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-48">
          {JSON.stringify(run.result, null, 2)}
        </pre>
      </div>

      {/* Cost Breakdown */}
      {run.cost && Object.keys(run.cost.byNode).length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Cost by Node</h4>
          <div className="space-y-1">
            {Object.entries(run.cost.byNode).map(([node, cost]) => (
              <div key={node} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{node}</span>
                <span>${(cost as number).toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="p-3 rounded-lg border bg-card">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  );
}
