'use client';

import { useState, useCallback } from 'react';
import type {
  MultiModalDocument,
  CrossModalSearchResult,
  MultiModalRAGMetrics,
} from '@/types/multi-modal-rag';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export function useMultiModalRAG() {
  const [documents, setDocuments] = useState<MultiModalDocument[]>([]);
  const [searchResults, setSearchResults] = useState<CrossModalSearchResult[]>([]);
  const [metrics, setMetrics] = useState<MultiModalRAGMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const indexDocument = useCallback(
    async (params: {
      title: string;
      type: 'image' | 'text' | 'mixed';
      content: string;
      imageBase64?: string;
      mimeType?: string;
      metadata?: Record<string, unknown>;
    }) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/multi-modal-rag/index`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });
        if (!res.ok) throw new Error('Failed to index document');
        const data = await res.json();
        setDocuments((prev) => [
          {
            ...params,
            id: data.document.id,
            created_at: new Date().toISOString(),
            metadata: JSON.stringify(params.metadata || {}),
          } as MultiModalDocument,
          ...prev,
        ]);
        return data.document;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        setError(msg);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const search = useCallback(
    async (params: {
      query: string;
      queryImageBase64?: string;
      queryMimeType?: string;
      searchType: 'text-to-image' | 'image-to-text' | 'text-to-text' | 'image-to-image' | 'cross';
      topK?: number;
    }) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/multi-modal-rag/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });
        if (!res.ok) throw new Error('Failed to search');
        const data = await res.json();
        setSearchResults(data.results);
        return data.results;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        setError(msg);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/multi-modal-rag/documents`);
      if (!res.ok) throw new Error('Failed to fetch documents');
      const data = await res.json();
      setDocuments(data.documents);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(msg);
    }
  }, []);

  const deleteDocument = useCallback(async (id: string) => {
    try {
      await fetch(`${API_BASE}/api/multi-modal-rag/documents/${id}`, { method: 'DELETE' });
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(msg);
    }
  }, []);

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/multi-modal-rag/metrics`);
      if (!res.ok) throw new Error('Failed to fetch metrics');
      const data = await res.json();
      setMetrics(data.metrics);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(msg);
    }
  }, []);

  return {
    documents,
    searchResults,
    metrics,
    isLoading,
    error,
    indexDocument,
    search,
    fetchDocuments,
    deleteDocument,
    fetchMetrics,
  };
}
