'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, AlertTriangle, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import type { FailureCase } from '@/types/eval';

interface FailureCasesTableProps {
  failures: FailureCase[];
  loading: boolean;
}

export function FailureCasesTable({ failures, loading }: FailureCasesTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Failure Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (failures.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Failure Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No failure cases found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Failure Cases</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {failures.map((failure) => (
            <div key={failure.id} className="border rounded-lg">
              <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
                onClick={() => setExpandedId(expandedId === failure.id ? null : failure.id)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {failure.feedback_rating === 'negative' && (
                    <ThumbsDown className="h-4 w-4 text-red-500 shrink-0" />
                  )}
                  {failure.hallucination_flag === 1 && (
                    <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
                  )}
                  <span className="text-sm truncate">{failure.query}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={failure.passed ? 'default' : 'destructive'}>
                    {failure.score.toFixed(2)}
                  </Badge>
                  {expandedId === failure.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </div>

              {expandedId === failure.id && (
                <div className="p-3 border-t bg-muted/30 space-y-3">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">Query</div>
                    <div className="text-sm">{failure.query}</div>
                  </div>

                  {failure.expected_output && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">Expected</div>
                      <div className="text-sm bg-green-50 p-2 rounded">{failure.expected_output}</div>
                    </div>
                  )}

                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">Actual Output</div>
                    <div className="text-sm bg-red-50 p-2 rounded">{failure.actual_output}</div>
                  </div>

                  {failure.feedback_comment && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">Feedback</div>
                      <div className="text-sm">{failure.feedback_comment}</div>
                    </div>
                  )}

                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>Model: {failure.model_version}</span>
                    {failure.prompt_variant && <span>Variant: {failure.prompt_variant}</span>}
                    <span>{new Date(failure.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
