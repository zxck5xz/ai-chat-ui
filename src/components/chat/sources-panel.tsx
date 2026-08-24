'use client';

import type { Source } from '@/types/chat';
import { ExternalLink, Eye, EyeOff, FileText } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface SourcesPanelProps {
  sources: Source[];
}

export function SourcesPanel({ sources }: SourcesPanelProps) {
  const [showReasoning, setShowReasoning] = useState(false);
  const [expandedSource, setExpandedSource] = useState<string | null>(null);

  if (sources.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <FileText className="h-4 w-4" />
            <span>
              {sources.length} source{sources.length > 1 ? 's' : ''}
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-2">
            {sources.map((source, i) => (
              <div
                key={source.id}
                className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                  expandedSource === source.id
                    ? 'bg-accent border-primary/50'
                    : 'bg-card hover:bg-accent'
                }`}
                onClick={() => setExpandedSource(expandedSource === source.id ? null : source.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">[{i + 1}]</span>
                      <p className="font-medium text-sm truncate">{source.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {source.snippet}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono text-muted-foreground">
                      {Math.round(source.score * 100)}%
                    </span>
                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
                {expandedSource === source.id && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Full chunk:</p>
                    <p className="text-xs bg-background rounded p-2 whitespace-pre-wrap">
                      {source.snippet}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs"
          onClick={() => setShowReasoning(!showReasoning)}
        >
          {showReasoning ? (
            <>
              <EyeOff className="h-3 w-3 mr-1" />
              Hide reasoning
            </>
          ) : (
            <>
              <Eye className="h-3 w-3 mr-1" />
              See reasoning
            </>
          )}
        </Button>
      </div>
      {showReasoning && (
        <div className="p-3 rounded-lg bg-muted/50 border text-xs space-y-2">
          <p className="font-medium text-muted-foreground">
            Retrieved chunks (sorted by relevance):
          </p>
          {sources.map((source, i) => (
            <div key={source.id} className="flex gap-2 p-2 rounded bg-background/50">
              <span className="text-muted-foreground shrink-0 font-mono">[{i + 1}]</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{source.title}</p>
                  <span className="text-muted-foreground font-mono">
                    {Math.round(source.score * 100)}% match
                  </span>
                </div>
                <p className="text-muted-foreground mt-1 whitespace-pre-wrap">{source.snippet}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
