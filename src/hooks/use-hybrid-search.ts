'use client';

import { useState, useCallback } from 'react';
import type {
  HybridSearchResult,
  HybridSearchResponse,
  ChunkingComparison,
  SearchComparison,
  EvalSummary,
  ABTest,
  ABTestSummary,
} from '@/types/hybrid-search';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ai-chat-api.ai-chat-api.workers.dev';

export function useHybridSearch() {
  const [results, setResults] = useState<HybridSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (params: {
      query: string;
      topK?: number;
      searchMethod?: 'vector' | 'bm25' | 'hybrid';
      hybridConfig?: {
        vectorWeight?: number;
        bm25Weight?: number;
        fusionMethod?: string;
      };
      rerankResults?: boolean;
      cohereApiKey?: string;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/api/hybrid/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`);
        }

        const data: HybridSearchResponse = await response.json();
        setResults(data.results);
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Search failed';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const compareChunks = useCallback(
    async (params: {
      content: string;
      strategies?: string[];
      chunkSize?: number;
      chunkOverlap?: number;
    }): Promise<ChunkingComparison> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/api/hybrid/chunk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          throw new Error(`Chunking failed: ${response.status}`);
        }

        const data = await response.json();
        return data.strategies;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Chunking failed';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const compareSearch = useCallback(
    async (params: {
      query: string;
      topK?: number;
      methods?: Array<'vector' | 'bm25' | 'hybrid'>;
    }): Promise<SearchComparison> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/api/hybrid/compare`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          throw new Error(`Comparison failed: ${response.status}`);
        }

        const data = await response.json();
        return data.comparison;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Comparison failed';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const evaluate = useCallback(
    async (params: {
      queries: Array<{
        query: string;
        expectedDocIds: string[];
      }>;
      topK?: number;
      searchMethod?: 'vector' | 'bm25' | 'hybrid';
    }): Promise<EvalSummary> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/api/hybrid/evaluate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          throw new Error(`Evaluation failed: ${response.status}`);
        }

        const data = await response.json();
        return data.summary;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Evaluation failed';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createABTest = useCallback(
    async (params: {
      name: string;
      description: string;
      variants: Array<{
        id: string;
        name: string;
        config: Record<string, unknown>;
      }>;
      trafficSplit: number[];
    }): Promise<ABTest> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/api/hybrid/ab-test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          throw new Error(`A/B test creation failed: ${response.status}`);
        }

        return await response.json();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'A/B test creation failed';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getABTestSummary = useCallback(async (testId: string): Promise<ABTestSummary> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/hybrid/ab-test/${testId}/summary`);

      if (!response.ok) {
        throw new Error(`Failed to get A/B test summary: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get summary';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    results,
    loading,
    error,
    search,
    compareChunks,
    compareSearch,
    evaluate,
    createABTest,
    getABTestSummary,
  };
}
