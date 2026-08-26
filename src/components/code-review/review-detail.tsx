'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { CodeReview, CodeReviewIssue } from '@/types/code-review';

interface ReviewDetailProps {
  review: CodeReview;
  issues: CodeReviewIssue[];
  onBack: () => void;
}

export function ReviewDetail({ review, issues, onBack }: ReviewDetailProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'warning':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Warning</Badge>;
      case 'info':
        return <Badge variant="secondary">Info</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const issuesBySeverity = {
    critical: issues.filter((i) => i.severity === 'critical'),
    warning: issues.filter((i) => i.severity === 'warning'),
    info: issues.filter((i) => i.severity === 'info'),
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Reviews
        </Button>
        <div className="flex items-center gap-2">
          {review.latency_ms && (
            <Badge variant="outline">{review.latency_ms}ms</Badge>
          )}
          <Badge variant={review.status === 'completed' ? 'default' : 'destructive'}>
            {review.status}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>PR #{review.pr_number}</CardTitle>
              <p className="text-sm text-muted-foreground">{review.repo}</p>
            </div>
            <div className="flex gap-2">
              {issuesBySeverity.critical.length > 0 && (
                <Badge variant="destructive">
                  {issuesBySeverity.critical.length} critical
                </Badge>
              )}
              {issuesBySeverity.warning.length > 0 && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                  {issuesBySeverity.warning.length} warning
                </Badge>
              )}
              {issuesBySeverity.info.length > 0 && (
                <Badge variant="secondary">
                  {issuesBySeverity.info.length} info
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Reviewed on {new Date(review.created_at).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      {issues.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Check className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <p className="text-lg font-medium">No issues found!</p>
            <p className="text-sm">This PR looks clean.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {['critical', 'warning', 'info'].map((severity) => {
            const severityIssues = issuesBySeverity[severity as keyof typeof issuesBySeverity];
            if (severityIssues.length === 0) return null;

            return (
              <div key={severity} className="space-y-2">
                <h3 className="text-lg font-semibold capitalize flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getSeverityColor(severity)}`} />
                  {severity} ({severityIssues.length})
                </h3>
                {severityIssues.map((issue) => (
                  <Card key={issue.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {issue.file_path}:{issue.line_number}
                            </code>
                            {getSeverityBadge(issue.severity)}
                          </div>
                          <p className="text-sm">{issue.message}</p>
                          {issue.suggestion && (
                            <div className="mt-2 p-2 bg-muted rounded text-sm">
                              <span className="font-medium">Suggestion:</span>{' '}
                              {issue.suggestion}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            copyToClipboard(
                              `${issue.file_path}:${issue.line_number} - ${issue.message}`,
                              issue.id
                            )
                          }
                        >
                          {copiedId === issue.id ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
