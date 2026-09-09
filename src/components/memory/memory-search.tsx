'use client';

import { useState } from 'react';
import type { MemorySearchResult } from '../../types/memory';

interface MemorySearchProps {
  onSearch: (query: string) => Promise<MemorySearchResult[]>;
  results: MemorySearchResult[];
  loading?: boolean;
}

export function MemorySearch({ onSearch, results, loading }: MemorySearchProps) {
  const [query, setQuery] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    await onSearch(query.trim());
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'episodic':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'semantic':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'knowledge_graph':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search memories..."
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-gray-500">{results.length} results found</div>
          {results.map((result) => (
            <div
              key={result.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <div className="flex items-start justify-between mb-1">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeBadge(result.type)}`}
                >
                  {result.type.replace('_', ' ')}
                </span>
                <span className="text-xs text-gray-400">score: {result.score.toFixed(3)}</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{result.content}</p>
              {result.metadata && Object.keys(result.metadata).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {Object.entries(result.metadata)
                    .slice(0, 5)
                    .map(([key, val]) => (
                      <span
                        key={key}
                        className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded"
                      >
                        {key}: {String(val).slice(0, 30)}
                      </span>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
