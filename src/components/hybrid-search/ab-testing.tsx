'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHybridSearch } from '@/hooks/use-hybrid-search';
import type { ABTest, ABTestSummary, ABVariant } from '@/types/hybrid-search';

export function ABTesting() {
  const [testName, setTestName] = useState('');
  const [testDescription, setTestDescription] = useState('');
  const [variants, setVariants] = useState<ABVariant[]>([
    {
      id: 'variant-a',
      name: 'Control',
      config: {
        searchMethod: 'vector',
        chunkingStrategy: 'recursive',
        chunkSize: 500,
      },
    },
    {
      id: 'variant-b',
      name: 'Treatment',
      config: {
        searchMethod: 'hybrid',
        chunkingStrategy: 'semantic',
        chunkSize: 300,
      },
    },
  ]);
  const [trafficSplit, setTrafficSplit] = useState([50, 50]);
  const [createdTest, setCreatedTest] = useState<ABTest | null>(null);
  const [summary, setSummary] = useState<ABTestSummary | null>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'results'>('create');

  const { createABTest, getABTestSummary, loading, error } = useHybridSearch();

  const addVariant = () => {
    const id = `variant-${String.fromCharCode(97 + variants.length)}`;
    setVariants([
      ...variants,
      {
        id,
        name: `Variant ${id.split('-')[1].toUpperCase()}`,
        config: {
          searchMethod: 'hybrid',
          chunkingStrategy: 'recursive',
          chunkSize: 500,
        },
      },
    ]);
    setTrafficSplit([...trafficSplit, 100 / (variants.length + 1)]);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 2) {
      setVariants(variants.filter((_, i) => i !== index));
      setTrafficSplit(trafficSplit.filter((_, i) => i !== index));
    }
  };

  const updateVariant = (index: number, field: keyof ABVariant, value: string) => {
    const updated = [...variants];
    if (field === 'config') {
      updated[index].config = { ...updated[index].config, ...JSON.parse(value) };
    } else if (field === 'id') {
      updated[index].id = value;
    } else if (field === 'name') {
      updated[index].name = value;
    }
    setVariants(updated);
  };

  const updateTrafficSplit = (index: number, value: number) => {
    const updated = [...trafficSplit];
    updated[index] = value;
    setTrafficSplit(updated);
  };

  const handleCreate = async () => {
    if (!testName.trim() || variants.length < 2) return;

    try {
      const test = await createABTest({
        name: testName,
        description: testDescription,
        variants,
        trafficSplit,
      });
      setCreatedTest(test);
      setActiveTab('results');
    } catch (err) {
      console.error('A/B test creation failed:', err);
    }
  };

  const handleLoadSummary = async (testId: string) => {
    try {
      const summary = await getABTestSummary(testId);
      setSummary(summary);
    } catch (err) {
      console.error('Failed to load summary:', err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>A/B Testing</CardTitle>
        <CardDescription>Test different RAG configurations with traffic splitting</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 border-b pb-2">
          <Button
            variant={activeTab === 'create' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('create')}
          >
            Create Test
          </Button>
          <Button
            variant={activeTab === 'results' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('results')}
          >
            Results
          </Button>
        </div>

        {activeTab === 'create' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Test Name</label>
              <Input
                placeholder="e.g., Hybrid vs Vector Search"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Describe what you're testing..."
                value={testDescription}
                onChange={(e) => setTestDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Variants</label>
              <div className="space-y-3">
                {variants.map((variant, index) => (
                  <Card key={variant.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Variant name"
                              value={variant.name}
                              onChange={(e) => updateVariant(index, 'name', e.target.value)}
                              className="w-40"
                            />
                            <Badge>{variant.id}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={variant.config.searchMethod}
                              onChange={(e) =>
                                updateVariant(
                                  index,
                                  'config',
                                  JSON.stringify({ searchMethod: e.target.value })
                                )
                              }
                              className="px-3 py-2 border rounded-md text-sm"
                            >
                              <option value="vector">Vector</option>
                              <option value="bm25">BM25</option>
                              <option value="hybrid">Hybrid</option>
                            </select>
                            <select
                              value={variant.config.chunkingStrategy}
                              onChange={(e) =>
                                updateVariant(
                                  index,
                                  'config',
                                  JSON.stringify({ chunkingStrategy: e.target.value })
                                )
                              }
                              className="px-3 py-2 border rounded-md text-sm"
                            >
                              <option value="fixed">Fixed</option>
                              <option value="recursive">Recursive</option>
                              <option value="semantic">Semantic</option>
                              <option value="document-aware">Document-Aware</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-muted-foreground">Chunk Size:</label>
                            <Input
                              type="number"
                              value={variant.config.chunkSize}
                              onChange={(e) =>
                                updateVariant(
                                  index,
                                  'config',
                                  JSON.stringify({ chunkSize: Number(e.target.value) })
                                )
                              }
                              className="w-20"
                              min={100}
                              max={2000}
                            />
                            <label className="text-xs text-muted-foreground">Traffic:</label>
                            <Input
                              type="number"
                              value={trafficSplit[index]}
                              onChange={(e) => updateTrafficSplit(index, Number(e.target.value))}
                              className="w-20"
                              min={0}
                              max={100}
                            />
                            <span className="text-xs">%</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVariant(index)}
                          disabled={variants.length <= 2}
                        >
                          ×
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button variant="outline" onClick={addVariant}>
                + Add Variant
              </Button>
            </div>

            <Button onClick={handleCreate} disabled={loading || !testName.trim()}>
              {loading ? 'Creating...' : 'Create A/B Test'}
            </Button>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="space-y-4">
            {createdTest && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    {createdTest.name}
                    <Badge
                      variant={
                        createdTest.status === 'running'
                          ? 'default'
                          : createdTest.status === 'completed'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {createdTest.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{createdTest.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleLoadSummary(createdTest.id)}>
                      Load Results
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {summary && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Results</h3>

                {summary.winner && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="font-medium text-green-800">
                      Winner:{' '}
                      {
                        summary.variantSummaries.find((v) => v.variantId === summary.winner)
                          ?.variantName
                      }
                    </div>
                    {summary.confidence !== undefined && (
                      <div className="text-sm text-green-600">
                        Confidence: {(summary.confidence * 100).toFixed(1)}%
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {summary.variantSummaries.map((variant) => (
                    <Card key={variant.variantId}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center justify-between">
                          {variant.variantName}
                          {summary.winner === variant.variantId && (
                            <Badge className="bg-green-500">Winner</Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Queries:</span>
                            <span>{variant.totalQueries}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Avg Latency:</span>
                            <span>{variant.avgLatencyMs.toFixed(0)}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Relevance:</span>
                            <span>{(variant.avgRelevance * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Faithfulness:</span>
                            <span>{(variant.avgFaithfulness * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Positive Rating:</span>
                            <span>{(variant.positiveRatio * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {!createdTest && !summary && (
              <div className="text-center text-muted-foreground py-8">
                No A/B tests created yet. Create one in the &quot;Create Test&quot; tab.
              </div>
            )}
          </div>
        )}

        {error && <div className="text-red-500 text-sm mt-4">{error}</div>}
      </CardContent>
    </Card>
  );
}
