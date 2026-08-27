'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHybridSearch } from '@/hooks/use-hybrid-search';
import type { ChunkingComparison, ChunkingStrategy } from '@/types/hybrid-search';

const STRATEGIES: ChunkingStrategy[] = [
  {
    name: 'fixed',
    label: 'Fixed Size',
    description: 'Split text into fixed-size chunks with overlap',
  },
  {
    name: 'recursive',
    label: 'Recursive',
    description: 'Recursively split by separators (\\n\\n, \\n, ., space)',
  },
  {
    name: 'semantic',
    label: 'Semantic',
    description: 'Split by sentences, keeping related content together',
  },
  {
    name: 'document-aware',
    label: 'Document-Aware',
    description: 'Respects document structure (headers, code blocks)',
  },
];

export function ChunkingComparison() {
  const [content, setContent] = useState('');
  const [chunkSize, setChunkSize] = useState(500);
  const [chunkOverlap, setChunkOverlap] = useState(50);
  const [results, setResults] = useState<ChunkingComparison | null>(null);
  const { compareChunks, loading, error } = useHybridSearch();

  const handleCompare = async () => {
    if (!content.trim()) return;

    try {
      const comparison = await compareChunks({
        content,
        strategies: STRATEGIES.map((s) => s.name),
        chunkSize,
        chunkOverlap,
      });
      setResults(comparison);
    } catch (err) {
      console.error('Chunking comparison failed:', err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chunking Strategy Comparison</CardTitle>
        <CardDescription>Compare different chunking strategies on your document</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Document Content</label>
          <Textarea
            placeholder="Paste your document content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Chunk Size</label>
            <input
              type="number"
              value={chunkSize}
              onChange={(e) => setChunkSize(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-md"
              min={100}
              max={2000}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Overlap</label>
            <input
              type="number"
              value={chunkOverlap}
              onChange={(e) => setChunkOverlap(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-md"
              min={0}
              max={200}
            />
          </div>
        </div>

        <Button onClick={handleCompare} disabled={loading || !content.trim()}>
          {loading ? 'Comparing...' : 'Compare Strategies'}
        </Button>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        {results && (
          <div className="space-y-4 mt-4">
            <h3 className="text-lg font-semibold">Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(results).map(([strategy, data]) => (
                <Card key={strategy}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between">
                      {STRATEGIES.find((s) => s.name === strategy)?.label || strategy}
                      <Badge variant="outline">{data.stats.totalChunks} chunks</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <span className="text-muted-foreground">Avg Size:</span>{' '}
                        {data.stats.avgChunkSize.toFixed(0)} chars
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Tokens:</span>{' '}
                        {data.stats.totalTokens}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Min:</span>{' '}
                        {data.stats.minChunkSize} chars
                      </div>
                      <div>
                        <span className="text-muted-foreground">Max:</span>{' '}
                        {data.stats.maxChunkSize} chars
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Preview (first 3 chunks)</h4>
                      {data.chunks.slice(0, 3).map((chunk) => (
                        <div key={chunk.index} className="p-2 bg-muted rounded text-xs">
                          <div className="flex justify-between mb-1">
                            <Badge variant="secondary" className="text-xs">
                              Chunk {chunk.index}
                            </Badge>
                            <span className="text-muted-foreground">{chunk.tokenCount} tokens</span>
                          </div>
                          <p className="line-clamp-2">{chunk.content}</p>
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
