'use client';

import type { Source } from '@/types/chat';
import { ExternalLink, Eye, EyeOff } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface SourcesPanelProps {
  sources: Source[];
}

export function SourcesPanel({ sources }: SourcesPanelProps) {
  const [showReasoning, setShowReasoning] = useState(false);

  if (sources.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <span>{sources.length} source{sources.length > 1 ? 's' : ''}</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-2">
            {sources.map((source) => (
              <div
                key={source.id}
                className="p-3 rounded-lg border bg-card text-card-foreground hover:bg-accent transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{source.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {source.snippet}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {Math.round(source.score * 100)}%
                    </span>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
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
          <p className="font-medium text-muted-foreground">Retrieved chunks:</p>
          {sources.map((source, i) => (
            <div key={source.id} className="flex gap-2">
              <span className="text-muted-foreground shrink-0">[{i + 1}]</span>
              <div>
                <p className="font-medium">{source.title}</p>
                <p className="text-muted-foreground mt-0.5">{source.snippet}</p>
                <p className="text-muted-foreground mt-0.5">
                  Relevance: {Math.round(source.score * 100)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
