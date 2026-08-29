'use client';

import { useState, useCallback } from 'react';
import type {
  QueryUnderstandingResult,
  SearchResponse,
  SearchResult,
  SearchAnalytics,
} from '@/types/search-engine';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-chat-api.ai-chat-api.workers.dev';

export function useSearchEngine() {
  const [query, setQuery] = useState('');
  const [queryInfo, setQueryInfo] = useState<QueryUnderstandingResult | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<SearchAnalytics | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const processQuery = useCallback(async (searchQuery: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/query/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) throw new Error(`Query processing failed: ${response.status}`);

      const data = await response.json();
      setQueryInfo(data.result);
      return data.result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Query processing failed';
      setError(message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const search = useCallback(async (searchQuery: string) => {
    setIsSearching(true);
    setError(null);
    setQuery(searchQuery);

    try {
      // Process query first
      const queryResult = await processQuery(searchQuery);

      // Then search with expanded queries
      const response = await fetch(`${API_URL}/api/hybrid/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          expandedQueries: queryResult?.expanded?.expandedQueries || [searchQuery],
          topK: 10,
        }),
      });

      if (!response.ok) throw new Error(`Search failed: ${response.status}`);

      const data = await response.json();
      setResults(data.results || []);

      // Add to search history
      setSearchHistory((prev) => [searchQuery, ...prev.slice(0, 19)]);

      return data.results;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Search failed';
      setError(message);
      throw err;
    } finally {
      setIsSearching(false);
    }
  }, [processQuery]);

  const searchWithStreaming = useCallback(async function* (searchQuery: string) {
    setIsSearching(true);
    setError(null);
    setQuery(searchQuery);

    try {
      // Process query
      const queryResult = await processQuery(searchQuery);

      // Streaming RAG query
      const response = await fetch(`${API_URL}/api/hybrid/rag-query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          expandedQueries: queryResult?.expanded?.expandedQueries || [searchQuery],
          topK: 5,
          stream: true,
        }),
      });

      if (!response.ok) throw new Error(`Search failed: ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') continue;

            try {
              const event = JSON.parse(jsonStr);
              yield event;
            } catch {
              // Skip malformed
            }
          }
        }
      }

      setSearchHistory((prev) => [searchQuery, ...prev.slice(0, 19)]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Search failed';
      setError(message);
    } finally {
      setIsSearching(false);
    }
  }, [processQuery]);

  const trackClick = useCallback(async (queryId: string, resultId: string, position: number) => {
    try {
      await fetch(`${API_URL}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queryId, resultId, position }),
      });
    } catch {
      // Silent fail for analytics
    }
  }, []);

  const submitFeedback = useCallback(async (queryId: string, rating: 'positive' | 'negative', comment?: string) => {
    try {
      await fetch(`${API_URL}/api/analytics/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queryId, rating, comment }),
      });
    } catch {
      // Silent fail for feedback
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/analytics/metrics`);
      const data = await response.json();
      setAnalytics(data.metrics);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setQueryInfo(null);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    queryInfo,
    results,
    isSearching,
    isProcessing,
    error,
    analytics,
    searchHistory,
    processQuery,
    search,
    searchWithStreaming,
    trackClick,
    submitFeedback,
    loadAnalytics,
    clearResults,
  };
}
