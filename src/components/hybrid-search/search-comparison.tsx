'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHybridSearch } from '@/hooks/use-hybrid-search';
import type { SearchComparison } from '@/types/hybrid-search';

export function SearchComparison() {
  const [query, setQuery] = useState('');
  const [topK, setTopK] = useState(5);
  const [results, setResults] = useState<SearchComparison | null>(null);
  const [overlap, setOverlap] = useState<Record<string, number> | null>(null);
  const { loading, error } = useHybridSearch();

  const handleCompare = async () => {
    if (!query.trim()) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://ai-chat-api.ai-chat-api.workers.dev'}/api/hybrid/compare`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            topK,
            methods: ['vector', 'bm25', 'hybrid'],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Comparison failed: ${response.status}`);
      }

      const data = await response.json();
      setResults(data.comparison);
      setOverlap(data.overlap);
    } catch (err) {
      console.error('Search comparison failed:', err);
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'vector':
        return 'bg-blue-100 text-blue-800';
      case 'bm25':
        return 'bg-green-100 text-green-800';
      case 'hybrid':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Method Comparison</CardTitle>
        <CardDescription>Compare Vector, BM25, and Hybrid search results</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Input
            placeholder="Enter your search query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <div className="w-24">
            <Input
              type="number"
              placeholder="Top K"
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              min={1}
              max={20}
            />
          </div>
          <Button onClick={handleCompare} disabled={loading || !query.trim()}>
            {loading ? 'Comparing...' : 'Compare'}
          </Button>
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        {results && (
          <div className="space-y-4 mt-4">
            {/* Overlap Analysis */}
            {overlap && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Overlap Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    {Object.entries(overlap).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <Badge variant="outline">{key}</Badge>
                        <span className="text-sm font-medium">{(value * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results by Method */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(results).map(([method, methodResults]) => (
                <Card key={method}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span className={`px-2 py-1 rounded ${getMethodColor(method)}`}>
                        {method.charAt(0).toUpperCase() + method.slice(1)}
                      </span>
                      <Badge variant="outline">{methodResults.length} results</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {methodResults.map((result, index) => (
                        <div key={result.id} className="p-2 bg-muted rounded text-sm">
                          <div className="flex justify-between mb-1">
                            <Badge variant="secondary" className="text-xs">
                              #{index + 1}
                            </Badge>
                            <span className="text-muted-foreground text-xs">
                              Score: {result.score.toFixed(3)}
                            </span>
                          </div>
                          {result.documentTitle && (
                            <div className="text-xs font-medium mb-1">{result.documentTitle}</div>
                          )}
                          <p className="line-clamp-2 text-xs">{result.content}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
