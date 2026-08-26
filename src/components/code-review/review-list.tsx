'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import type { CodeReview } from '@/types/code-review';

interface ReviewListProps {
  reviews: CodeReview[];
  onSelect: (review: CodeReview) => void;
  selectedId?: string;
}

export function ReviewList({ reviews, onSelect, selectedId }: ReviewListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityBadge = (issuesBySeverity: string | null) => {
    if (!issuesBySeverity) return null;
    try {
      const severity = JSON.parse(issuesBySeverity);
      return (
        <div className="flex gap-1">
          {severity.critical > 0 && (
            <Badge variant="destructive" className="text-xs">
              {severity.critical} critical
            </Badge>
          )}
          {severity.warning > 0 && (
            <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-500">
              {severity.warning} warning
            </Badge>
          )}
          {severity.info > 0 && (
            <Badge variant="secondary" className="text-xs">
              {severity.info} info
            </Badge>
          )}
        </div>
      );
    } catch {
      return null;
    }
  };

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No reviews yet. Configure a GitHub webhook to start automated code reviews.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {reviews.map((review) => (
        <Card
          key={review.id}
          className={`cursor-pointer transition-colors hover:bg-accent ${
            selectedId === review.id ? 'border-primary' : ''
          }`}
          onClick={() => onSelect(review)}
        >
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(review.status)}
                <div>
                  <CardTitle className="text-sm font-medium">
                    PR #{review.pr_number}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{review.repo}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getSeverityBadge(review.issues_by_severity)}
                <Badge variant="outline">{review.total_issues} issues</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{new Date(review.created_at).toLocaleString()}</span>
              {review.latency_ms && <span>{review.latency_ms}ms</span>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
