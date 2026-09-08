'use client';

import type { AgenticRAGRun } from '@/types/agentic-rag';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Trash2, ChevronRight, Brain, Zap } from 'lucide-react';

interface RunHistoryProps {
  runs: AgenticRAGRun[];
  total: number;
  onSelect: (run: AgenticRAGRun) => void;
  onDelete: (id: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
}

export function RunHistory({ runs, total, onSelect, onDelete, onLoadMore, hasMore }: RunHistoryProps) {
  if (runs.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          No runs yet. Run a query to see history.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock size={16} className="text-blue-500" />
          Run History
          <Badge variant="outline" className="ml-auto text-xs">{total} total</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {runs.map((run) => (
          <div
            key={run.id}
            className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
            onClick={() => onSelect(run)}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{run.query}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span>{run.totalRounds} rounds</span>
                <span>{run.totalLatencyMs}ms</span>
                <span>{new Date(run.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant={run.confidence.score >= 0.7 ? 'default' : 'destructive'}
                className="text-xs"
              >
                {(run.confidence.score * 100).toFixed(0)}%
              </Badge>

              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(run.id);
                }}
              >
                <Trash2 size={12} />
              </Button>

              <ChevronRight size={14} className="text-muted-foreground" />
            </div>
          </div>
        ))}

        {hasMore && (
          <Button variant="outline" size="sm" className="w-full" onClick={onLoadMore}>
            Load more
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
