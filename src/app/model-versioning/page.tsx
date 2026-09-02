'use client';

import { useEffect, useState } from 'react';
import { useModelVersioning } from '@/hooks/use-model-versioning';
import { StatsCards } from '@/components/model-versioning/stats-cards';
import { VersionList } from '@/components/model-versioning/version-list';
import { DeploymentList } from '@/components/model-versioning/deployment-list';
import { CreateVersionForm } from '@/components/model-versioning/create-version-form';
import { DeployForm } from '@/components/model-versioning/deploy-form';
import { RollbackForm } from '@/components/model-versioning/rollback-form';
import Link from 'next/link';
import { ArrowLeft, GitBranch, Rocket, RotateCcw } from 'lucide-react';
import type { ModelVersion, ModelDeployment } from '@/types/model-versioning';

export default function ModelVersioningDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'versions' | 'deployments' | 'rollbacks'>(
    'overview'
  );
  const [showCreateVersion, setShowCreateVersion] = useState(false);
  const [deployingVersion, setDeployingVersion] = useState<ModelVersion | null>(null);
  const [rollingBackDeployment, setRollingBackDeployment] = useState<ModelDeployment | null>(null);

  const {
    versions,
    deployments,
    rollbacks,
    stats,
    loading,
    error,
    fetchStats,
    fetchVersions,
    createVersion,
    deleteVersion,
    fetchDeployments,
    createDeployment,
    rollback,
    fetchRollbacks,
  } = useModelVersioning();

  useEffect(() => {
    fetchStats();
    fetchVersions();
    fetchDeployments();
    fetchRollbacks();
  }, [fetchStats, fetchVersions, fetchDeployments, fetchRollbacks]);

  const handleCreateVersion = async (data: Parameters<typeof createVersion>[0]) => {
    await createVersion(data);
    setShowCreateVersion(false);
    fetchStats();
  };

  const handleDeploy = async (data: Parameters<typeof createDeployment>[0]) => {
    await createDeployment(data);
    setDeployingVersion(null);
    fetchDeployments();
    fetchStats();
  };

  const handleRollback = async (deploymentId: string, reason: string) => {
    await rollback(deploymentId, reason, 'dashboard-user');
    setRollingBackDeployment(null);
    fetchDeployments();
    fetchRollbacks();
    fetchStats();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: GitBranch },
    { id: 'versions', label: 'Versions', icon: GitBranch },
    { id: 'deployments', label: 'Deployments', icon: Rocket },
    { id: 'rollbacks', label: 'Rollbacks', icon: RotateCcw },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/chat" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Model Versioning</h1>
                <p className="text-sm text-muted-foreground">
                  Manage model versions, deployments, and rollbacks
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-3 rounded bg-destructive/10 text-destructive text-sm">{error}</div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <StatsCards stats={stats} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Recent Deployments</h2>
                <DeploymentList
                  deployments={stats?.recentDeployments || []}
                  onRollback={setRollingBackDeployment}
                  loading={loading}
                />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-4">Recent Rollbacks</h2>
                {stats?.recentRollbacks && stats.recentRollbacks.length > 0 ? (
                  <div className="space-y-2">
                    {stats.recentRollbacks.map((rb) => (
                      <div key={rb.id} className="p-3 rounded-lg border bg-card">
                        <div className="flex items-center gap-2">
                          <RotateCcw className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-medium">{rb.reason}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(rb.createdAt).toLocaleString()} • by {rb.triggeredBy}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No rollbacks yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'versions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Model Versions</h2>
              <button
                onClick={() => setShowCreateVersion(true)}
                className="px-4 py-2 rounded border bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
              >
                + Create Version
              </button>
            </div>
            {showCreateVersion && (
              <CreateVersionForm onCreate={handleCreateVersion} loading={loading} />
            )}
            {deployingVersion && (
              <DeployForm
                version={deployingVersion}
                onDeploy={handleDeploy}
                onCancel={() => setDeployingVersion(null)}
                loading={loading}
              />
            )}
            <VersionList
              versions={versions}
              onDeploy={setDeployingVersion}
              onDelete={async (id) => {
                await deleteVersion(id);
                fetchStats();
              }}
              loading={loading}
            />
          </div>
        )}

        {activeTab === 'deployments' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Deployments</h2>
            {rollingBackDeployment && (
              <RollbackForm
                deployment={rollingBackDeployment}
                onRollback={handleRollback}
                onCancel={() => setRollingBackDeployment(null)}
                loading={loading}
              />
            )}
            <DeploymentList
              deployments={deployments}
              onRollback={setRollingBackDeployment}
              loading={loading}
            />
          </div>
        )}

        {activeTab === 'rollbacks' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Rollback History</h2>
            {rollbacks.length === 0 ? (
              <p className="text-muted-foreground">No rollbacks recorded</p>
            ) : (
              <div className="space-y-3">
                {rollbacks.map((rb) => (
                  <div key={rb.id} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <RotateCcw className="h-5 w-5 text-orange-500" />
                        <div>
                          <p className="font-medium">{rb.reason}</p>
                          <p className="text-sm text-muted-foreground">
                            From {rb.fromVersionId.slice(0, 8)}... → To {rb.toVersionId.slice(0, 8)}
                            ...
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium capitalize">{rb.status}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(rb.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Triggered by: {rb.triggeredBy}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
