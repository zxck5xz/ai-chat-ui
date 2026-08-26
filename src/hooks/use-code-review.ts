'use client';

import { useState, useCallback } from 'react';
import type { CodeReview, CodeReviewIssue, ReviewMetrics, SeverityBreakdown, TopRepo } from '@/types/code-review';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

interface ReviewDetail {
  review: CodeReview;
  issues: CodeReviewIssue[];
}

interface MetricsData {
  stats: ReviewMetrics;
  severityBreakdown: SeverityBreakdown[];
  topRepos: TopRepo[];
}

export function useCodeReview() {
  const [reviews, setReviews] = useState<CodeReview[]>([]);
  const [selectedReview, setSelectedReview] = useState<ReviewDetail | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async (repo?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (repo) params.set('repo', repo);

      const response = await fetch(`${API_URL}/api/code-review/reviews?${params}`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data = await response.json();
      setReviews(data.reviews);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReview = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/code-review/reviews/${id}`);
      if (!response.ok) throw new Error('Failed to fetch review');
      const data = await response.json();
      setSelectedReview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/code-review/metrics`);
      if (!response.ok) throw new Error('Failed to fetch metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeDiff = useCallback(async (diff: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/code-review/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diff }),
      });
      if (!response.ok) throw new Error('Failed to analyze diff');
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    reviews,
    selectedReview,
    metrics,
    loading,
    error,
    fetchReviews,
    fetchReview,
    fetchMetrics,
    analyzeDiff,
    setSelectedReview,
  };
}
