'use client';

import { useState } from 'react';
import type { ModelVersion } from '@/types/model-versioning';
import { Button } from '@/components/ui/button';
import { Rocket, Loader2 } from 'lucide-react';

interface DeployFormProps {
  version: ModelVersion;
  onDeploy: (data: {
    versionId: string;
    environment: string;
    strategy: string;
    trafficPercent?: number;
  }) => Promise<unknown>;
  onCancel: () => void;
  loading?: boolean;
}

export function DeployForm({ version, onDeploy, onCancel, loading }: DeployFormProps) {
  const [environment, setEnvironment] = useState<'production' | 'staging' | 'canary'>('production');
  const [strategy, setStrategy] = useState<'rolling' | 'canary' | 'blue_green' | 'instant'>(
    'rolling'
  );
  const [trafficPercent, setTrafficPercent] = useState(100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onDeploy({
      versionId: version.id,
      environment,
      strategy,
      trafficPercent,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-lg border bg-card space-y-3">
      <h3 className="font-medium">Deploy {version.name}</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Environment</label>
          <select
            className="w-full mt-1 p-2 rounded border bg-background text-sm"
            value={environment}
            onChange={(e) => setEnvironment(e.target.value as typeof environment)}
          >
            <option value="production">Production</option>
            <option value="staging">Staging</option>
            <option value="canary">Canary</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Strategy</label>
          <select
            className="w-full mt-1 p-2 rounded border bg-background text-sm"
            value={strategy}
            onChange={(e) => setStrategy(e.target.value as typeof strategy)}
          >
            <option value="rolling">Rolling</option>
            <option value="canary">Canary</option>
            <option value="blue_green">Blue-Green</option>
            <option value="instant">Instant</option>
          </select>
        </div>
      </div>
      {strategy === 'canary' && (
        <div>
          <label className="text-sm font-medium">Traffic Percent</label>
          <input
            type="number"
            min="1"
            max="100"
            className="w-full mt-1 p-2 rounded border bg-background text-sm"
            value={trafficPercent}
            onChange={(e) => setTrafficPercent(Number(e.target.value))}
          />
        </div>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Rocket className="h-4 w-4 mr-2" />
          )}
          Deploy
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
