'use client';

import { useState } from 'react';
import type { ModelDeployment } from '@/types/model-versioning';
import { Button } from '@/components/ui/button';
import { RotateCcw, Loader2 } from 'lucide-react';

interface RollbackFormProps {
  deployment: ModelDeployment;
  onRollback: (deploymentId: string, reason: string) => Promise<unknown>;
  onCancel: () => void;
  loading?: boolean;
}

export function RollbackForm({ deployment, onRollback, onCancel, loading }: RollbackFormProps) {
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    await onRollback(deployment.id, reason);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-lg border bg-card space-y-3">
      <h3 className="font-medium text-orange-500">Rollback Deployment</h3>
      <div className="p-3 rounded bg-muted text-sm">
        <p>
          <span className="font-medium">Environment:</span> {deployment.environment}
        </p>
        <p>
          <span className="font-medium">Version:</span> {deployment.versionId.slice(0, 8)}...
        </p>
        <p>
          <span className="font-medium">Strategy:</span> {deployment.strategy}
        </p>
      </div>
      <div>
        <label className="text-sm font-medium">Reason for rollback *</label>
        <textarea
          className="w-full mt-1 p-2 rounded border bg-background text-sm"
          placeholder="High error rate detected, latency degradation..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          required
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" variant="destructive" disabled={loading || !reason.trim()}>
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RotateCcw className="h-4 w-4 mr-2" />
          )}
          Confirm Rollback
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
