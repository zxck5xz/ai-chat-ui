'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useHybridSearch } from '@/hooks/use-hybrid-search';
import type { EvalSummary } from '@/types/hybrid-search';

interface EvalQuery {
  query: string;
  expectedDocIds: string;
}

export function EvalMetrics() {
  const [queries, setQueries] = useState<EvalQuery[]>([{ query: '', expectedDocIds: '' }]);
  const [topK, setTopK] = useState(5);
  const [searchMethod, setSearchMethod] = useState<'vector' | 'bm25' | 'hybrid'>('hybrid');
  const [results, setResults] = useState<EvalSummary | null>(null);
  const { evaluate, loading, error } = useHybridSearch();

  const addQuery = () => {
    setQueries([...queries, { query: '', expectedDocIds: '' }]);
  };

  const removeQuery = (index: number) => {
    if (queries.length > 1) {
      setQueries(queries.filter((_, i) => i !== index));
    }
  };

  const updateQuery = (index: number, field: keyof EvalQuery, value: string) => {
    const updated = [...queries];
    updated[index][field] = value;
    setQueries(updated);
  };

  const handleEvaluate = async () => {
    const validQueries = queries.filter((q) => q.query.trim() && q.expectedDocIds.trim());

    if (validQueries.length === 0) return;

    try {
      const summary = await evaluate({
        queries: validQueries.map((q) => ({
          query: q.query,
          expectedDocIds: q.expectedDocIds.split(',').map((id) => id.trim()),
        })),
        topK,
        searchMethod,
      });
      setResults(summary);
    } catch (err) {
      console.error('Evaluation failed:', err);
    }
  };

  const formatMetric = (value: number) => {
    return (value * 100).toFixed(1) + '%';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evaluation Metrics</CardTitle>
        <CardDescription>Evaluate search quality with Recall@k, MRR, and more</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Test Queries</label>
          <p className="text-xs text-muted-foreground">
            Add queries with expected document IDs (comma-separated)
          </p>
        </div>

        <div className="space-y-3">
          {queries.map((q, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Enter query..."
                value={q.query}
                onChange={(e) => updateQuery(index, 'query', e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Expected doc IDs (comma-sep)"
                value={q.expectedDocIds}
                onChange={(e) => updateQuery(index, 'expectedDocIds', e.target.value)}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeQuery(index)}
                disabled={queries.length === 1}
              >
                ×
              </Button>
            </div>
          ))}
        </div>

        <Button variant="outline" onClick={addQuery}>
          + Add Query
        </Button>

        <div className="flex gap-4 items-end">
          <div className="w-24">
            <label className="text-sm font-medium">Top K</label>
            <Input
              type="number"
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              min={1}
              max={20}
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium">Search Method</label>
            <select
              value={searchMethod}
              onChange={(e) => setSearchMethod(e.target.value as typeof searchMethod)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="vector">Vector Only</option>
              <option value="bm25">BM25 Only</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <Button onClick={handleEvaluate} disabled={loading}>
            {loading ? 'Evaluating...' : 'Run Evaluation'}
          </Button>
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        {results && (
          <div className="space-y-4 mt-4">
            <h3 className="text-lg font-semibold">Results ({results.totalQueries} queries)</h3>

            {/* Average Metrics */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Average Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatMetric(results.avgMetrics.recallAtK)}
                    </div>
                    <div className="text-xs text-muted-foreground">Recall@k</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatMetric(results.avgMetrics.mrr)}
                    </div>
                    <div className="text-xs text-muted-foreground">MRR</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatMetric(results.avgMetrics.precisionAtK)}
                    </div>
                    <div className="text-xs text-muted-foreground">Precision@k</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {formatMetric(results.avgMetrics.ndcg)}
                    </div>
                    <div className="text-xs text-muted-foreground">NDCG</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-600">
                      {formatMetric(results.avgMetrics.contextRelevance)}
                    </div>
                    <div className="text-xs text-muted-foreground">Context Relevance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600">
                      {formatMetric(results.avgMetrics.answerRelevance)}
                    </div>
                    <div className="text-xs text-muted-foreground">Answer Relevance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">
                      {formatMetric(results.avgMetrics.faithfulness)}
                    </div>
                    <div className="text-xs text-muted-foreground">Faithfulness</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Min/Max/Std */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Min Values</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Recall@k:</span>
                      <span>{formatMetric(results.minMetrics.recallAtK)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>MRR:</span>
                      <span>{formatMetric(results.minMetrics.mrr)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Precision@k:</span>
                      <span>{formatMetric(results.minMetrics.precisionAtK)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Max Values</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Recall@k:</span>
                      <span>{formatMetric(results.maxMetrics.recallAtK)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>MRR:</span>
                      <span>{formatMetric(results.maxMetrics.mrr)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Precision@k:</span>
                      <span>{formatMetric(results.maxMetrics.precisionAtK)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Std Deviation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Recall@k:</span>
                      <span>{formatMetric(results.stdMetrics.recallAtK)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>MRR:</span>
                      <span>{formatMetric(results.stdMetrics.mrr)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Precision@k:</span>
                      <span>{formatMetric(results.stdMetrics.precisionAtK)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
