'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { SearchBar } from '@/components/search-engine/search-bar';
import { SearchResults } from '@/components/search-engine/search-results';
import { QueryInfo } from '@/components/search-engine/query-info';
import { useSearchEngine } from '@/hooks/use-search-engine';

export default function SearchPage() {
  const {
    query,
    queryInfo,
    results,
    isSearching,
    isProcessing,
    error,
    searchHistory,
    search,
    trackClick,
    submitFeedback,
  } = useSearchEngine();

  const [showQueryInfo, setShowQueryInfo] = useState(false);

  const handleSearch = useCallback(async (q: string) => {
    await search(q);
  }, [search]);

  const handleResultClick = useCallback((resultId: string, position: number) => {
    trackClick(queryInfo?.classified.originalQuery || '', resultId, position);
  }, [trackClick, queryInfo]);

  const handleFeedback = useCallback((resultId: string, rating: 'positive' | 'negative') => {
    submitFeedback(queryInfo?.classified.originalQuery || '', rating);
  }, [submitFeedback, queryInfo]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/chat" className="text-gray-400 hover:text-white">
            <ArrowLeft size={20} />
          </Link>
          <Sparkles size={20} className="text-blue-400" />
          <h1 className="text-lg font-semibold">AI Search Engine</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            onSearch={handleSearch}
            isLoading={isSearching || isProcessing}
            placeholder="Search with AI-powered understanding..."
            history={searchHistory}
          />
        </div>

        {/* Loading States */}
        {isProcessing && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-blue-400">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              Processing query...
            </div>
          </div>
        )}

        {isSearching && !isProcessing && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-purple-400">
              <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              Searching...
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-300 text-sm mb-4">
            {error}
          </div>
        )}

        {/* Query Info Toggle */}
        {queryInfo && !isSearching && (
          <div className="mb-4">
            <button
              onClick={() => setShowQueryInfo(!showQueryInfo)}
              className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
            >
              <Sparkles size={14} />
              {showQueryInfo ? 'Hide' : 'Show'} query analysis
            </button>
            {showQueryInfo && (
              <div className="mt-2">
                <QueryInfo info={queryInfo} />
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {!isSearching && !isProcessing && results.length > 0 && (
          <div>
            <div className="text-sm text-gray-400 mb-3">
              {results.length} results found
              {queryInfo && (
                <span className="ml-2">
                  via <span className="text-white">{queryInfo.expanded.strategy}</span> strategy
                </span>
              )}
            </div>
            <SearchResults
              results={results}
              onFeedback={handleFeedback}
            />
          </div>
        )}

        {/* Empty State */}
        {!isSearching && !isProcessing && results.length === 0 && !error && (
          <div className="text-center py-16">
            <Sparkles size={48} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 text-sm">
              AI-powered search with query understanding, expansion, and intelligent routing
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 max-w-md mx-auto text-left">
              <div className="bg-gray-900 rounded-lg p-3 text-xs">
                <div className="text-blue-400 font-medium mb-1">Query Classification</div>
                <div className="text-gray-400">Automatically routes simple, moderate, and complex queries</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-3 text-xs">
                <div className="text-purple-400 font-medium mb-1">Multi-Query Expansion</div>
                <div className="text-gray-400">Generates semantic variants for better recall</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-3 text-xs">
                <div className="text-green-400 font-medium mb-1">HyDE</div>
                <div className="text-gray-400">Hypothetical Document Embeddings for sparse queries</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-3 text-xs">
                <div className="text-yellow-400 font-medium mb-1">Decomposition</div>
                <div className="text-gray-400">Breaks complex questions into atomic sub-queries</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
