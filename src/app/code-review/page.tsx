'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Code } from 'lucide-react';
import { useCodeReview } from '@/hooks/use-code-review';
import { MetricsCards } from '@/components/code-review/metrics-cards';
import { ReviewList } from '@/components/code-review/review-list';
import { ReviewDetail } from '@/components/code-review/review-detail';
import { SeverityChart } from '@/components/code-review/severity-chart';
import { TopRepos } from '@/components/code-review/top-repos';
import type { CodeReview } from '@/types/code-review';

export default function CodeReviewPage() {
  const {
    reviews,
    selectedReview,
    metrics,
    loading,
    error,
    fetchReviews,
    fetchReview,
    fetchMetrics,
    setSelectedReview,
  } = useCodeReview();

  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
    fetchMetrics();
  }, [fetchReviews, fetchMetrics]);

  const handleSelectReview = async (review: CodeReview) => {
    setSelectedReviewId(review.id);
    await fetchReview(review.id);
  };

  const handleBack = () => {
    setSelectedReviewId(null);
    setSelectedReview(null);
  };

  const handleRefresh = () => {
    fetchReviews();
    fetchMetrics();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/chat">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Code className="h-6 w-6 text-purple-500" />
              <h1 className="text-2xl font-bold">AI Code Review</h1>
            </div>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}

        {selectedReview ? (
          <ReviewDetail
            review={selectedReview.review}
            issues={selectedReview.issues}
            onBack={handleBack}
          />
        ) : (
          <div className="space-y-6">
            <MetricsCards metrics={metrics?.stats || null} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h2 className="text-lg font-semibold mb-4">Recent Reviews</h2>
                <ReviewList
                  reviews={reviews}
                  onSelect={handleSelectReview}
                  selectedId={selectedReviewId || undefined}
                />
              </div>

              <div className="space-y-6">
                <SeverityChart data={metrics?.severityBreakdown || []} />
                <TopRepos repos={metrics?.topRepos || []} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
