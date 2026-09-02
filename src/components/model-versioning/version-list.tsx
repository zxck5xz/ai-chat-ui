'use client';

import { useState } from 'react';
import type { ModelVersion } from '@/types/model-versioning';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Trash2, Rocket } from 'lucide-react';

interface VersionListProps {
  versions: ModelVersion[];
  onDeploy: (version: ModelVersion) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export function VersionList({ versions, onDeploy, onDelete, loading }: VersionListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const statusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500';
      case 'inactive':
        return 'bg-gray-500/10 text-gray-500';
      case 'deprecated':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'archived':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const providerColor = (provider: string) => {
    switch (provider) {
      case 'gemini':
        return 'bg-blue-500/10 text-blue-500';
      case 'openai':
        return 'bg-emerald-500/10 text-emerald-500';
      case 'anthropic':
        return 'bg-orange-500/10 text-orange-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  if (versions.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>No model versions created yet</p>
        <p className="text-sm mt-2">Create a version to start tracking models</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {versions.map((version) => (
        <div
          key={version.id}
          className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{version.name}</h3>
                  <Badge className={statusColor(version.status)}>{version.status}</Badge>
                  <Badge className={providerColor(version.provider)}>{version.provider}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {version.version} • {version.modelId}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeploy(version)}
                disabled={loading || version.status === 'active'}
              >
                <Rocket className="h-4 w-4 text-green-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(version.id)}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>

          <button
            onClick={() => setExpandedId(expandedId === version.id ? null : version.id)}
            className="mt-2 text-sm text-muted-foreground hover:text-foreground"
          >
            {expandedId === version.id ? 'Hide details' : 'Show details'}
          </button>

          {expandedId === version.id && (
            <div className="mt-3 p-3 rounded bg-muted text-sm space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Config</p>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(version.config, null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="font-medium">Metrics</p>
                  <div className="text-xs space-y-1">
                    <p>Requests: {version.metrics.totalRequests}</p>
                    <p>Avg Latency: {version.metrics.avgLatencyMs.toFixed(0)}ms</p>
                    <p>Error Rate: {version.metrics.errorRate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
              {version.notes && (
                <div>
                  <p className="font-medium">Notes</p>
                  <p className="text-xs">{version.notes}</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Created: {new Date(version.createdAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
