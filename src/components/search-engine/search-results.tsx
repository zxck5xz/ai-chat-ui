'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { SearchResult } from '@/types/search-engine';

interface SearchResultsProps {
  results: SearchResult[];
  onFeedback?: (resultId: string, rating: 'positive' | 'negative') => void;
}

export function SearchResults({ results, onFeedback }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-sm">No results found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((result, index) => (
        <ResultCard
          key={result.id}
          result={result}
          position={index + 1}
          onFeedback={onFeedback}
        />
      ))}
    </div>
  );
}

function ResultCard({ result, position, onFeedback }: {
  result: SearchResult;
  position: number;
  onFeedback?: (resultId: string, rating: 'positive' | 'negative') => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);

  const scoreColor = result.score > 0.8
    ? 'text-green-400'
    : result.score > 0.5
    ? 'text-yellow-400'
    : 'text-gray-400';

  const handleFeedback = (rating: 'positive' | 'negative') => {
    setFeedback(rating);
    onFeedback?.(result.id, rating);
  };

  return (
    <Card className="p-4 bg-gray-900 border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-start gap-3">
        {/* Position */}
        <div className="text-xs text-gray-500 font-mono mt-1">{position}</div>

        <div className="flex-1 min-w-0">
          {/* Title + Score */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-medium text-white truncate">
              {result.documentTitle || `Document ${result.documentId}`}
            </h3>
            <Badge variant="outline" className={`text-[10px] ${scoreColor}`}>
              {(result.score * 100).toFixed(0)}%
            </Badge>
            {result.rerankScore && (
              <Badge variant="outline" className="text-[10px] text-purple-400">
                Reranked: {(result.rerankScore * 100).toFixed(0)}%
              </Badge>
            )}
          </div>

          {/* Content Preview */}
          <div
            className="text-sm text-gray-300 cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            <p className={expanded ? '' : 'line-clamp-2'}>
              {result.highlight || result.content}
            </p>
            <button className="text-xs text-gray-500 hover:text-gray-400 mt-1 flex items-center gap-1">
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {expanded ? 'Show less' : 'Show more'}
            </button>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span>Chunk {result.chunkIndex + 1}</span>
            {result.metadata && 'page' in result.metadata && (
              <span>Page {String((result.metadata as Record<string, unknown>).page)}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {onFeedback && (
            <>
              <button
                onClick={() => handleFeedback('positive')}
                className={`p-1 rounded transition-colors ${
                  feedback === 'positive'
                    ? 'text-green-400 bg-green-400/10'
                    : 'text-gray-500 hover:text-green-400'
                }`}
              >
                <ThumbsUp size={14} />
              </button>
              <button
                onClick={() => handleFeedback('negative')}
                className={`p-1 rounded transition-colors ${
                  feedback === 'negative'
                    ? 'text-red-400 bg-red-400/10'
                    : 'text-gray-500 hover:text-red-400'
                }`}
              >
                <ThumbsDown size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
