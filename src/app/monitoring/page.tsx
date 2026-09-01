'use client';

import { useEffect, useState } from 'react';
import { useMonitoring } from '@/hooks/use-monitoring';
import { AnomalyPanel } from '@/components/monitoring/anomaly-panel';
import { DriftPanel } from '@/components/monitoring/drift-panel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  RefreshCw,
  Activity,
  AlertTriangle,
  TrendingDown,
  Shield,
  Play,
  Plus,
  Trash2,
  Bell,
  BellOff,
} from 'lucide-react';
import type { AlertRule, AlertEvent, EvaluationResult, DriftResult } from '@/types/monitoring';

type Tab = 'overview' | 'anomalies' | 'drifts' | 'rules' | 'evaluate';

export default function MonitoringDashboard() {
  const {
    overview,
    anomalies,
    drifts,
    rules,
    events,
    evaluationResults,
    driftResults,
    loading,
    error,
    fetchOverview,
    fetchAnomalies,
    fetchDrifts,
    acknowledgeAnomaly,
    acknowledgeDrift,
    runEvaluation,
    detectDrifts,
    fetchRules,
    createRule,
    toggleRule,
    deleteRule,
    fetchEvents,
    acknowledgeEvent,
  } = useMonitoring();

  const [tab, setTab] = useState<Tab>('overview');

  const loadAll = async () => {
    await Promise.all([
      fetchOverview(),
      fetchAnomalies({ limit: 20 }),
      fetchDrifts({ limit: 20 }),
      fetchRules(),
      fetchEvents(20),
    ]);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRunEvaluation = async () => {
    await runEvaluation();
    await loadAll();
  };

  const handleDetectDrifts = async () => {
    await detectDrifts();
    await fetchDrifts({ limit: 20 });
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'anomalies', label: 'Anomalies', icon: AlertTriangle },
    { id: 'drifts', label: 'Drifts', icon: TrendingDown },
    { id: 'rules', label: 'Alert Rules', icon: Bell },
    { id: 'evaluate', label: 'Evaluate', icon: Play },
  ];

  const healthColor = (h: string) => {
    switch (h) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Production Monitoring</h1>
          <p className="text-muted-foreground">Anomaly detection, drift monitoring, and alerting</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRunEvaluation} disabled={loading}>
            <Play className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Run Evaluation
          </Button>
          <Button onClick={handleDetectDrifts} disabled={loading} variant="outline">
            <TrendingDown className="h-4 w-4 mr-2" />
            Detect Drifts
          </Button>
          <Button onClick={loadAll} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">System Health</p>
                <Badge className={healthColor(overview?.systemHealth || 'healthy')}>
                  {overview?.systemHealth || 'healthy'}
                </Badge>
              </div>
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Anomalies</p>
                <p className="text-2xl font-bold">{overview?.anomalyStats?.total || 0}</p>
                <p className="text-xs text-red-500">
                  {overview?.anomalyStats?.unacknowledged || 0} unacknowledged
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Drifts</p>
                <p className="text-2xl font-bold">{overview?.driftStats?.total || 0}</p>
                <p className="text-xs text-red-500">
                  {overview?.driftStats?.degrading || 0} degrading
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold">{events.filter((e) => !e.acknowledged).length}</p>
              </div>
              <Bell className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-t transition-colors ${
              tab === t.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            onClick={() => setTab(t.id)}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnomalyPanel anomalies={anomalies.slice(0, 5)} onAcknowledge={acknowledgeAnomaly} />
          <DriftPanel drifts={drifts.slice(0, 5)} onAcknowledge={acknowledgeDrift} />
        </div>
      )}

      {tab === 'anomalies' && (
        <AnomalyPanel anomalies={anomalies} onAcknowledge={acknowledgeAnomaly} />
      )}

      {tab === 'drifts' && <DriftPanel drifts={drifts} onAcknowledge={acknowledgeDrift} />}

      {tab === 'rules' && (
        <RulesPanel
          rules={rules}
          events={events}
          onToggle={toggleRule}
          onCreate={createRule}
          onDelete={deleteRule}
          onAcknowledgeEvent={acknowledgeEvent}
        />
      )}

      {tab === 'evaluate' && (
        <EvaluatePanel
          results={evaluationResults}
          driftResults={driftResults}
          loading={loading}
          onRunEvaluation={handleRunEvaluation}
          onDetectDrifts={handleDetectDrifts}
        />
      )}
    </div>
  );
}

// ============ Rules Panel ============

function RulesPanel({
  rules,
  events,
  onToggle,
  onCreate,
  onDelete,
  onAcknowledgeEvent,
}: {
  rules: AlertRule[];
  events: AlertEvent[];
  onToggle: (id: string) => void;
  onCreate: (rule: {
    name: string;
    metric: string;
    condition: 'gt' | 'lt' | 'eq';
    threshold: number;
    severity?: string;
    evaluation_window_minutes?: number;
    cooldown_minutes?: number;
  }) => Promise<void>;
  onDelete: (id: string) => void;
  onAcknowledgeEvent: (id: string) => void;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    metric: 'latency_ms',
    condition: 'gt' as 'gt' | 'lt' | 'eq',
    threshold: 5000,
    severity: 'warning',
    evaluation_window_minutes: 5,
    cooldown_minutes: 15,
  });

  const handleCreate = async () => {
    if (!newRule.name) return;
    await onCreate(newRule);
    setNewRule({
      name: '',
      metric: 'latency_ms',
      condition: 'gt',
      threshold: 5000,
      severity: 'warning',
      evaluation_window_minutes: 5,
      cooldown_minutes: 15,
    });
    setShowCreate(false);
  };

  const unacked = events.filter((e) => !e.acknowledged);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Alert Rules ({rules.length})
          </CardTitle>
          <Button size="sm" variant="outline" onClick={() => setShowCreate(!showCreate)}>
            <Plus className="h-3 w-3 mr-1" />
            Add Rule
          </Button>
        </CardHeader>
        <CardContent>
          {showCreate && (
            <div className="p-3 border rounded-lg mb-3 space-y-2">
              <input
                className="w-full px-2 py-1 text-sm border rounded"
                placeholder="Rule name"
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
              />
              <div className="flex gap-2">
                <select
                  className="px-2 py-1 text-sm border rounded"
                  value={newRule.metric}
                  onChange={(e) => setNewRule({ ...newRule, metric: e.target.value })}
                >
                  <option value="latency_ms">Latency (ms)</option>
                  <option value="cost_usd">Cost ($)</option>
                  <option value="error_rate">Error Rate (%)</option>
                  <option value="tokens">Tokens</option>
                  <option value="request_count">Request Count</option>
                </select>
                <select
                  className="px-2 py-1 text-sm border rounded"
                  value={newRule.condition}
                  onChange={(e) =>
                    setNewRule({ ...newRule, condition: e.target.value as 'gt' | 'lt' | 'eq' })
                  }
                >
                  <option value="gt">Greater than</option>
                  <option value="lt">Less than</option>
                  <option value="eq">Equals</option>
                </select>
                <input
                  type="number"
                  className="w-24 px-2 py-1 text-sm border rounded"
                  value={newRule.threshold}
                  onChange={(e) => setNewRule({ ...newRule, threshold: Number(e.target.value) })}
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="px-2 py-1 text-sm border rounded"
                  value={newRule.severity}
                  onChange={(e) => setNewRule({ ...newRule, severity: e.target.value })}
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                </select>
                <input
                  type="number"
                  className="w-24 px-2 py-1 text-sm border rounded"
                  placeholder="Window (min)"
                  value={newRule.evaluation_window_minutes}
                  onChange={(e) =>
                    setNewRule({ ...newRule, evaluation_window_minutes: Number(e.target.value) })
                  }
                />
                <input
                  type="number"
                  className="w-24 px-2 py-1 text-sm border rounded"
                  placeholder="Cooldown (min)"
                  value={newRule.cooldown_minutes}
                  onChange={(e) =>
                    setNewRule({ ...newRule, cooldown_minutes: Number(e.target.value) })
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreate}>
                  Create
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {rules.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No alert rules configured.
            </p>
          ) : (
            <div className="space-y-2">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-2 border rounded-lg"
                >
                  <div className="text-sm">
                    <span className="font-medium">{rule.name}</span>
                    <span className="text-muted-foreground ml-2">
                      {rule.metric}{' '}
                      {rule.condition === 'gt' ? '>' : rule.condition === 'lt' ? '<' : '='}{' '}
                      {rule.threshold}
                    </span>
                    <Badge variant="outline" className="ml-2">
                      {rule.severity}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-2">
                      window: {rule.evaluation_window_minutes}m, cooldown: {rule.cooldown_minutes}m
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={rule.enabled ? 'default' : 'ghost'}
                      onClick={() => onToggle(rule.id)}
                    >
                      {rule.enabled ? (
                        <Bell className="h-3 w-3" />
                      ) : (
                        <BellOff className="h-3 w-3" />
                      )}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onDelete(rule.id)}>
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Alert Events ({unacked.length} active)</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No alert events.</p>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {events.map((event) => (
                <div
                  key={event.id}
                  className={`flex items-center justify-between p-2 border rounded-lg ${event.acknowledged ? 'opacity-50' : ''}`}
                >
                  <div className="text-sm">
                    <Badge
                      variant={event.acknowledged ? 'secondary' : 'destructive'}
                      className="mr-2"
                    >
                      {event.acknowledged ? 'acked' : 'active'}
                    </Badge>
                    <span className="font-medium">{event.rule_name}</span>
                    <span className="text-muted-foreground ml-2">
                      actual: {event.actual_value} (threshold: {event.threshold})
                    </span>
                  </div>
                  {!event.acknowledged && (
                    <Button size="sm" variant="ghost" onClick={() => onAcknowledgeEvent(event.id)}>
                      <CheckCircle className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============ Evaluate Panel ============

function CheckCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function EvaluatePanel({
  results,
  driftResults,
  loading,
  onRunEvaluation,
  onDetectDrifts,
}: {
  results: EvaluationResult[];
  driftResults: DriftResult[];
  loading: boolean;
  onRunEvaluation: () => void;
  onDetectDrifts: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button onClick={onRunEvaluation} disabled={loading}>
          <Play className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Run Alert Evaluation
        </Button>
        <Button onClick={onDetectDrifts} disabled={loading} variant="outline">
          <TrendingDown className="h-4 w-4 mr-2" />
          Run Drift Detection
        </Button>
      </div>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Alert Evaluation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((r, i) => (
                <div
                  key={i}
                  className={`p-3 border rounded-lg ${
                    r.triggered ? 'border-red-300 bg-red-50' : 'border-green-200 bg-green-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Badge variant={r.triggered ? 'destructive' : 'secondary'}>
                      {r.triggered ? 'TRIGGERED' : 'OK'}
                    </Badge>
                    <span className="font-medium text-sm">{r.rule_name}</span>
                    <Badge variant="outline">{r.severity}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{r.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {driftResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Drift Detection Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {driftResults.map((d, i) => (
                <div
                  key={i}
                  className={`p-3 border rounded-lg ${
                    d.has_drift ? 'border-orange-300 bg-orange-50' : 'border-green-200 bg-green-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Badge variant={d.has_drift ? 'destructive' : 'secondary'}>
                      {d.direction.toUpperCase()}
                    </Badge>
                    <span className="text-sm">{d.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {results.length === 0 && driftResults.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Click &quot;Run Alert Evaluation&quot; or &quot;Run Drift Detection&quot; to start
            monitoring.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
