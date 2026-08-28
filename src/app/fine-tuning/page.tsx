'use client';

import { useEffect, useState } from 'react';
import { useFineTuning } from '@/hooks/use-fine-tuning';
import { MetricsCards } from '@/components/fine-tuning/metrics-cards';
import { DatasetList } from '@/components/fine-tuning/dataset-list';
import { TrainingJobs } from '@/components/fine-tuning/training-jobs';
import { EvalComparison } from '@/components/fine-tuning/eval-comparison';
import { ABTestPanel } from '@/components/fine-tuning/ab-test-panel';
import { LossChart } from '@/components/fine-tuning/loss-chart';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, Play, TrendingUp, FlaskConical } from 'lucide-react';

type Tab = 'datasets' | 'training' | 'eval' | 'ab-test';

export default function FineTuningDashboard() {
  const {
    metrics,
    datasets,
    selectedDataset,
    datasetEntries,
    jobs,
    selectedJob,
    latestEval,
    abTests,
    loading,
    error,
    fetchMetrics,
    fetchDatasets,
    selectDataset,
    fetchDatasetEntries,
    createDataset,
    validateDataset,
    deleteDataset,
    fetchJobs,
    selectJob,
    createJob,
    startJob,
    deleteJob,
    fetchLatestEval,
    fetchABTests,
    createABTest,
    stopABTest,
    deleteABTest,
  } = useFineTuning();

  const [tab, setTab] = useState<Tab>('datasets');

  const loadAll = async () => {
    await Promise.all([
      fetchMetrics(),
      fetchDatasets(),
      fetchJobs(),
      fetchLatestEval(),
      fetchABTests(),
    ]);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSelectDataset = async (ds: typeof selectedDataset) => {
    if (!ds) return;
    selectDataset(ds);
    await fetchDatasetEntries(ds.id);
  };

  const handleSelectJob = (job: typeof selectedJob) => {
    if (!job) return;
    selectJob(job);
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'datasets', label: 'Datasets', icon: Database },
    { id: 'training', label: 'Training', icon: Play },
    { id: 'eval', label: 'Evaluation', icon: TrendingUp },
    { id: 'ab-test', label: 'A/B Testing', icon: FlaskConical },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fine-tuning Pipeline</h1>
          <p className="text-muted-foreground">
            Dataset curation, LoRA/QLoRA training, model evaluation, and A/B testing
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

      {tab === 'datasets' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DatasetList
            datasets={datasets}
            loading={loading}
            onSelect={handleSelectDataset}
            onValidate={validateDataset}
            onDelete={deleteDataset}
            onCreate={createDataset}
            selectedId={selectedDataset?.id}
          />
          {selectedDataset && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">{selectedDataset.name}</h3>
                <div className="text-sm text-muted-foreground mb-2">
                  {selectedDataset.description || 'No description'}
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>{selectedDataset.total_entries} total</span>
                  <span>{selectedDataset.valid_entries} valid</span>
                  <span>{selectedDataset.duplicate_entries} duplicates</span>
                </div>
              </div>
              <div className="max-h-[300px] overflow-y-auto space-y-1">
                {datasetEntries.map((entry) => (
                  <div key={entry.id} className="p-2 border rounded text-xs">
                    <div className="font-medium truncate">{entry.prompt}</div>
                    <div className="text-muted-foreground truncate mt-1">{entry.completion}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'training' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrainingJobs
            jobs={jobs}
            datasets={datasets.map((d) => ({ id: d.id, name: d.name }))}
            loading={loading}
            onStart={startJob}
            onDelete={deleteJob}
            onCreate={createJob}
            onSelect={handleSelectJob}
            selectedId={selectedJob?.id}
          />
          {selectedJob && selectedJob.training_loss_history && (
            <LossChart history={JSON.parse(selectedJob.training_loss_history)} loading={loading} />
          )}
        </div>
      )}

      {tab === 'eval' && <EvalComparison latestEval={latestEval} loading={loading} />}

      {tab === 'ab-test' && (
        <ABTestPanel
          tests={abTests}
          loading={loading}
          onCreate={createABTest}
          onStop={stopABTest}
          onDelete={deleteABTest}
        />
      )}
    </div>
  );
}
