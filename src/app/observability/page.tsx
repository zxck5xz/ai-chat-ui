'use client';

import { useEffect, useState } from 'react';
import { useObservability } from '@/hooks/use-observability';
import { MetricsCards } from '@/components/observability/metrics-cards';
import { TraceList } from '@/components/observability/trace-list';
import { TraceDetail } from '@/components/observability/trace-detail';
import { CostBreakdown } from '@/components/observability/cost-breakdown';
import { LatencyTable } from '@/components/observability/latency-table';
import { AlertPanel } from '@/components/observability/alert-panel';
import { SlowTraces } from '@/components/observability/slow-traces';
import { Button } from '@/components/ui/button';
import { RefreshCw, Eye, DollarSign, Gauge, Bell } from 'lucide-react';

type Tab = 'overview' | 'traces' | 'cost' | 'latency' | 'alerts';

export default function ObservabilityDashboard() {
  const {
    metrics,
    traces,
    selectedTrace,
    traceSpans,
    costByModel,
    latencyPercentiles,
    slowTraces,
    alertRules,
    alertEvents,
    loading,
    error,
    fetchMetrics,
    fetchTraces,
    selectTrace,
    fetchTraceDetail,
    fetchCostByModel,
    fetchLatencyPercentiles,
    fetchSlowTraces,
    fetchAlertRules,
    createAlertRule,
    toggleAlertRule,
    fetchAlertEvents,
    acknowledgeAlert,
  } = useObservability();

  const [tab, setTab] = useState<Tab>('overview');

  const loadAll = async () => {
    await Promise.all([
      fetchMetrics(),
      fetchTraces({ limit: 50 }),
      fetchCostByModel(),
      fetchLatencyPercentiles(),
      fetchSlowTraces(),
      fetchAlertRules(),
      fetchAlertEvents(),
    ]);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSelectTrace = async (trace: typeof selectedTrace) => {
    if (!trace) return;
    selectTrace(trace);
    await fetchTraceDetail(trace.id);
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'traces', label: 'Traces', icon: Eye },
    { id: 'cost', label: 'Cost', icon: DollarSign },
    { id: 'latency', label: 'Latency', icon: Gauge },
    { id: 'alerts', label: 'Alerts', icon: Bell },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Observability Platform</h1>
          <p className="text-muted-foreground">
            Monitor traces, costs, latency, and alerts across all AI services
          </p>
        </div>
        <Button onClick={loadAll} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <MetricsCards metrics={metrics} loading={loading} />

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

      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TraceList
            traces={traces.slice(0, 10)}
            loading={loading}
            onSelect={handleSelectTrace}
            selectedId={selectedTrace?.id}
          />
          <div className="space-y-6">
            <CostBreakdown models={costByModel} loading={loading} />
            <LatencyTable percentiles={latencyPercentiles} loading={loading} />
          </div>
        </div>
      )}

      {tab === 'traces' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TraceList
            traces={traces}
            loading={loading}
            onSelect={handleSelectTrace}
            selectedId={selectedTrace?.id}
          />
          <TraceDetail trace={selectedTrace} spans={traceSpans} loading={loading} />
        </div>
      )}

      {tab === 'cost' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CostBreakdown models={costByModel} loading={loading} />
          <SlowTraces traces={slowTraces} loading={loading} />
        </div>
      )}

      {tab === 'latency' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LatencyTable percentiles={latencyPercentiles} loading={loading} />
          <SlowTraces traces={slowTraces} loading={loading} />
        </div>
      )}

      {tab === 'alerts' && (
        <AlertPanel
          rules={alertRules}
          events={alertEvents}
          onToggle={toggleAlertRule}
          onCreate={createAlertRule}
          onAcknowledge={acknowledgeAlert}
        />
      )}
    </div>
  );
}
