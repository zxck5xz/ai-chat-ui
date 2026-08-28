'use client';

import { useCallback, useState } from 'react';
import type {
  FineTuningMetrics,
  Dataset,
  DatasetEntry,
  TrainingJob,
  ModelEval,
  ABTest,
} from '@/types/fine-tuning';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

interface UseFineTuningReturn {
  metrics: FineTuningMetrics | null;
  datasets: Dataset[];
  selectedDataset: Dataset | null;
  datasetEntries: DatasetEntry[];
  jobs: TrainingJob[];
  selectedJob: TrainingJob | null;
  evals: ModelEval[];
  latestEval: ModelEval | null;
  abTests: ABTest[];
  loading: boolean;
  error: string | null;
  fetchMetrics: () => Promise<void>;
  fetchDatasets: () => Promise<void>;
  selectDataset: (ds: Dataset | null) => void;
  fetchDatasetDetail: (id: string) => Promise<void>;
  fetchDatasetEntries: (id: string) => Promise<void>;
  createDataset: (input: {
    name: string;
    description?: string;
    source: string;
    format: string;
  }) => Promise<string | null>;
  addEntries: (
    datasetId: string,
    entries: { prompt: string; completion: string }[]
  ) => Promise<number>;
  validateDataset: (
    id: string
  ) => Promise<{ total: number; valid: number; invalid: number; duplicates: number } | null>;
  deleteDataset: (id: string) => Promise<void>;
  fetchJobs: () => Promise<void>;
  selectJob: (job: TrainingJob | null) => void;
  createJob: (input: {
    name: string;
    dataset_id: string;
    base_model: string;
    method: string;
  }) => Promise<string | null>;
  startJob: (id: string) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  fetchEvals: (jobId?: string) => Promise<void>;
  fetchLatestEval: () => Promise<void>;
  createEval: (input: {
    job_id: string;
    base_model: string;
    fine_tuned_model: string;
    eval_set: string;
  }) => Promise<string | null>;
  fetchABTests: () => Promise<void>;
  createABTest: (input: {
    name: string;
    base_model: string;
    variant_model: string;
    traffic_split: number;
  }) => Promise<string | null>;
  stopABTest: (id: string) => Promise<void>;
  deleteABTest: (id: string) => Promise<void>;
}

export function useFineTuning(): UseFineTuningReturn {
  const [metrics, setMetrics] = useState<FineTuningMetrics | null>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [datasetEntries, setDatasetEntries] = useState<DatasetEntry[]>([]);
  const [jobs, setJobs] = useState<TrainingJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<TrainingJob | null>(null);
  const [evals, setEvals] = useState<ModelEval[]>([]);
  const [latestEval, setLatestEval] = useState<ModelEval | null>(null);
  const [abTests, setABTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/fine-tuning/metrics`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setMetrics(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDatasets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/fine-tuning/datasets`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setDatasets(data.datasets || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const selectDataset = useCallback((ds: Dataset | null) => setSelectedDataset(ds), []);

  const fetchDatasetDetail = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/fine-tuning/datasets/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSelectedDataset(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDatasetEntries = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/fine-tuning/datasets/${id}/entries`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setDatasetEntries(data.entries || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const createDataset = useCallback(
    async (input: { name: string; description?: string; source: string; format: string }) => {
      try {
        const res = await fetch(`${API_URL}/api/fine-tuning/datasets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        await fetchDatasets();
        return data.id;
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        return null;
      }
    },
    [fetchDatasets]
  );

  const addEntries = useCallback(
    async (datasetId: string, entries: { prompt: string; completion: string }[]) => {
      try {
        const res = await fetch(`${API_URL}/api/fine-tuning/datasets/${datasetId}/entries`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entries }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        await fetchDatasetEntries(datasetId);
        return data.added;
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        return 0;
      }
    },
    [fetchDatasetEntries]
  );

  const validateDataset = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`${API_URL}/api/fine-tuning/datasets/${id}/validate`, {
          method: 'POST',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        await fetchDatasets();
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        return null;
      }
    },
    [fetchDatasets]
  );

  const deleteDataset = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`${API_URL}/api/fine-tuning/datasets/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        await fetchDatasets();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    [fetchDatasets]
  );

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/fine-tuning/jobs`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const selectJob = useCallback((job: TrainingJob | null) => setSelectedJob(job), []);

  const createJob = useCallback(
    async (input: { name: string; dataset_id: string; base_model: string; method: string }) => {
      try {
        const res = await fetch(`${API_URL}/api/fine-tuning/jobs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        await fetchJobs();
        return data.id;
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        return null;
      }
    },
    [fetchJobs]
  );

  const startJob = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`${API_URL}/api/fine-tuning/jobs/${id}/start`, { method: 'POST' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        await fetchJobs();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    [fetchJobs]
  );

  const deleteJob = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`${API_URL}/api/fine-tuning/jobs/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        await fetchJobs();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    [fetchJobs]
  );

  const fetchEvals = useCallback(async (jobId?: string) => {
    try {
      const query = jobId ? `?job_id=${jobId}` : '';
      const res = await fetch(`${API_URL}/api/fine-tuning/evals${query}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setEvals(data.evals || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const fetchLatestEval = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/fine-tuning/evals/latest`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setLatestEval(data.eval || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const createEval = useCallback(
    async (input: {
      job_id: string;
      base_model: string;
      fine_tuned_model: string;
      eval_set: string;
    }) => {
      try {
        const res = await fetch(`${API_URL}/api/fine-tuning/evals`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        await fetchEvals();
        return data.id;
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        return null;
      }
    },
    [fetchEvals]
  );

  const fetchABTests = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/fine-tuning/ab-tests`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setABTests(data.tests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const createABTest = useCallback(
    async (input: {
      name: string;
      base_model: string;
      variant_model: string;
      traffic_split: number;
    }) => {
      try {
        const res = await fetch(`${API_URL}/api/fine-tuning/ab-tests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        await fetchABTests();
        return data.id;
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        return null;
      }
    },
    [fetchABTests]
  );

  const stopABTest = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`${API_URL}/api/fine-tuning/ab-tests/${id}/stop`, {
          method: 'POST',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        await fetchABTests();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    [fetchABTests]
  );

  const deleteABTest = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`${API_URL}/api/fine-tuning/ab-tests/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        await fetchABTests();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    [fetchABTests]
  );

  return {
    metrics,
    datasets,
    selectedDataset,
    datasetEntries,
    jobs,
    selectedJob,
    evals,
    latestEval,
    abTests,
    loading,
    error,
    fetchMetrics,
    fetchDatasets,
    selectDataset,
    fetchDatasetDetail,
    fetchDatasetEntries,
    createDataset,
    addEntries,
    validateDataset,
    deleteDataset,
    fetchJobs,
    selectJob,
    createJob,
    startJob,
    deleteJob,
    fetchEvals,
    fetchLatestEval,
    createEval,
    fetchABTests,
    createABTest,
    stopABTest,
    deleteABTest,
  };
}
