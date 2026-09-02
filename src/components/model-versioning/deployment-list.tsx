'use client';

import { useState } from 'react';
import type { ModelDeployment } from '@/types/model-versioning';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

interface DeploymentListProps {
  deployments: ModelDeployment[];
  onRollback: (deployment: ModelDeployment) => void;
  loading?: boolean;
}

export function DeploymentList({ deployments, onRollback, loading }: DeploymentListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const statusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'rolled_back':
        return 'bg-orange-500/10 text-orange-500';
      case 'failed':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const envColor = (env: string) => {
    switch (env) {
      case 'production':
        return 'bg-red-500/10 text-red-500';
      case 'staging':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'canary':
        return 'bg-purple-500/10 text-purple-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  if (deployments.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>No deployments yet</p>
        <p className="text-sm mt-2">Deploy a version to start serving traffic</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {deployments.map((deployment) => (
        <div
          key={deployment.id}
          className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Badge className={envColor(deployment.environment)}>
                    {deployment.environment}
                  </Badge>
                  <Badge className={statusColor(deployment.status)}>{deployment.status}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {deployment.strategy} • {deployment.trafficPercent}% traffic
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Version: {deployment.versionId.slice(0, 8)}...
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {deployment.status === 'active' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRollback(deployment)}
                  disabled={loading}
                  title="Rollback"
                >
                  <RotateCcw className="h-4 w-4 text-orange-500" />
                </Button>
              )}
            </div>
          </div>

          <button
            onClick={() => setExpandedId(expandedId === deployment.id ? null : deployment.id)}
            className="mt-2 text-sm text-muted-foreground hover:text-foreground"
          >
            {expandedId === deployment.id ? 'Hide details' : 'Show details'}
          </button>

          {expandedId === deployment.id && (
            <div className="mt-3 p-3 rounded bg-muted text-sm space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Deployment Info</p>
                  <div className="text-xs space-y-1">
                    <p>ID: {deployment.id.slice(0, 8)}...</p>
                    <p>Strategy: {deployment.strategy}</p>
                    <p>Traffic: {deployment.trafficPercent}%</p>
                    {deployment.deployedBy && <p>Deployed by: {deployment.deployedBy}</p>}
                  </div>
                </div>
                <div>
                  <p className="font-medium">Timestamps</p>
                  <div className="text-xs space-y-1">
                    <p>Created: {new Date(deployment.createdAt).toLocaleString()}</p>
                    {deployment.deployedAt && (
                      <p>Deployed: {new Date(deployment.deployedAt).toLocaleString()}</p>
                    )}
                    {deployment.rolledBackAt && (
                      <p>Rolled back: {new Date(deployment.rolledBackAt).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </div>
              {deployment.rollbackReason && (
                <div className="p-2 rounded bg-orange-500/10 text-orange-500">
                  <p className="font-medium text-xs">Rollback Reason</p>
                  <p className="text-xs">{deployment.rollbackReason}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
