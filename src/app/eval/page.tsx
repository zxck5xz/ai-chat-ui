'use client';

import { useEffect, useState } from 'react';
import { useEvalDashboard } from '@/hooks/use-eval-dashboard';
import { MetricsCards } from '@/components/eval/metrics-cards';
import { TimeseriesChart } from '@/components/eval/timeseries-chart';
import { FailureCasesTable } from '@/components/eval/failure-cases-table';
import { SafetyGates } from '@/components/eval/safety-gates';
import { DeployApprovals } from '@/components/eval/deploy-approvals';
import { EvalFilters } from '@/components/eval/eval-filters';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function EvalDashboard() {
  const {
    metrics,
    timeseries,
    failures,
    gates,
    approvals,
    loading,
    error,
    fetchMetrics,
    fetchTimeseries,
    fetchFailures,
    fetchGates,
  } = useEvalDashboard();

  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [models, setModels] = useState<string[]>([]);
  const [gateCheckResult, setGateCheckResult] = useState(null);

  useEffect(() => {
    loadData();
  }, [selectedModel, startDate, endDate]);

  const loadData = async () => {
    const params = {
      model_version: selectedModel === 'all' ? undefined : selectedModel,
      start_date: startDate?.toISOString(),
      end_date: endDate?.toISOString(),
    };

    await Promise.all([
      fetchMetrics(params),
      fetchTimeseries({ model_version: params.model_version, days: 30 }),
      fetchFailures(params.model_version),
      fetchGates(),
    ]);

    // Fetch models list
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'}/api/eval/models`);
      if (response.ok) {
        const data = await response.json();
        setModels(data.models || []);
      }
    } catch {
      // Ignore error
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Eval Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor AI model performance, accuracy, and safety metrics
          </p>
        </div>
        <Button onClick={loadData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <EvalFilters
        models={models}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      <MetricsCards metrics={metrics} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimeseriesChart data={timeseries} loading={loading} />
        <SafetyGates gates={gates} gateCheckResult={gateCheckResult} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FailureCasesTable failures={failures} loading={loading} />
        <DeployApprovals
          approvals={approvals}
          loading={loading}
          onApprove={async (id) => {
            // TODO: Implement approve
            console.log('Approve:', id);
          }}
          onReject={async (id) => {
            // TODO: Implement reject
            console.log('Reject:', id);
          }}
        />
      </div>
    </div>
  );
}
