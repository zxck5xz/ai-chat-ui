'use client';

import { useState, useEffect } from 'react';
import { useAgenticRAG } from '@/hooks/use-agentic-rag';
import { AnalysisCard } from './analysis-card';
import { ConfidenceGauge } from './confidence-gauge';
import { RoundTracker } from './round-tracker';
import { StepTimeline } from './step-timeline';
import { RunHistory } from './run-history';
import { CitationVerification } from './citation-verification';
import { MetricsDashboard } from './metrics-dashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Brain, Play, RotateCcw, Settings, MessageSquare, Clock, Zap, StopCircle, History, BarChart3, Shield, CheckCircle } from 'lucide-react';

const EXAMPLE_QUERIES = [
  'What are the latest advancements in quantum computing?',
  'Compare React Server Components vs traditional SSR for performance',
  'Explain how vector databases enable semantic search',
  'What is the current market share of cloud providers in 2026?',
];

export function AgenticRAGPanel() {
  const {
    run, events, status, error, analysis,
    runs, runsTotal, metrics, hallucinationResult,
    runPipeline, runSimple, stop, reset,
    fetchRuns, fetchRun, fetchMetrics, deleteRun, checkHallucination,
  } = useAgenticRAG();

  const [query, setQuery] = useState('');
  const [maxRounds, setMaxRounds] = useState(3);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('run');

  // Load history on mount
  useEffect(() => {
    fetchRuns(20, 0);
  }, [fetchRuns]);

  const handleRun = async () => {
    if (!query.trim()) return;
    await runPipeline(query, { maxRounds, confidenceThreshold });
  };

  const handleSelectRun = async (selectedRun: typeof run) => {
    if (selectedRun) {
      await fetchRun(selectedRun.id);
      setQuery(selectedRun.query);
      setActiveTab('run');
    }
  };

  const handleLoadMore = () => {
    fetchRuns(20, runs.length);
  };

  const handleLoadMetrics = () => {
    fetchMetrics();
    setActiveTab('metrics');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Brain size={24} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Agentic RAG</h1>
          <p className="text-sm text-muted-foreground">
            Self-correcting retrieval with confidence evaluation & multi-round retrieval
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="run" className="flex items-center gap-2">
            <Play size={14} /> Run
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History size={14} /> History
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Brain size={14} /> Analysis
          </TabsTrigger>
          <TabsTrigger value="steps" className="flex items-center gap-2">
            <Zap size={14} /> Steps
          </TabsTrigger>
          <TabsTrigger value="verify" className="flex items-center gap-2">
            <Shield size={14} /> Verify
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <BarChart3 size={14} /> Metrics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="run" className="space-y-6">
          {/* Query Input */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask a question that needs retrieval & self-correction..."
                    onKeyDown={(e) => e.key === 'Enter' && handleRun()}
                  />
                  {status === 'running' ? (
                    <Button variant="destructive" onClick={stop} className="flex items-center gap-2">
                      <StopCircle size={16} />
                      Stop
                    </Button>
                  ) : (
                    <Button onClick={handleRun} disabled={!query.trim()} className="flex items-center gap-2">
                      <Play size={16} />
                      Run
                    </Button>
                  )}
                </div>

                {/* Settings toggle */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Settings size={12} />
                    Settings
                  </button>
                  <div className="flex gap-1.5 ml-auto">
                    {EXAMPLE_QUERIES.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => setQuery(q)}
                        className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded bg-muted/50 hover:bg-muted transition-colors truncate max-w-[150px]"
                        title={q}
                      >
                        {q.slice(0, 20)}...
                      </button>
                    ))}
                  </div>
                </div>

                {showSettings && (
                  <div className="flex gap-4 p-3 rounded-lg bg-muted/50 text-xs">
                    <div className="flex items-center gap-2">
                      <label className="text-muted-foreground">Max Rounds:</label>
                      <input
                        type="number"
                        value={maxRounds}
                        onChange={(e) => setMaxRounds(Number(e.target.value))}
                        min={1} max={5}
                        className="w-16 px-2 py-1 rounded border bg-background"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-muted-foreground">Confidence Threshold:</label>
                      <input
                        type="number"
                        value={confidenceThreshold}
                        onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                        min={0} max={1} step={0.1}
                        className="w-20 px-2 py-1 rounded border bg-background"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 text-red-600 text-sm">{error}</div>
          )}

          {/* Running indicator */}
          {status === 'running' && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Running agentic RAG pipeline...</span>
                  <Badge variant="outline" className="ml-auto text-xs">{events.length} events</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {run && (
            <div className="space-y-6">
              {/* Summary bar */}
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 text-xs">
                <div className="flex items-center gap-1.5">
                  <Clock size={12} />
                  <span className="font-medium">{run.totalLatencyMs}ms</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap size={12} />
                  <span>{run.totalRounds} rounds</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageSquare size={12} />
                  <span>{run.steps.length} steps</span>
                </div>
                <Badge variant={run.confidence.score >= 0.7 ? 'default' : 'destructive'} className="ml-auto">
                  {run.confidence.score >= 0.7 ? 'Passed' : 'Low Confidence'}
                </Badge>
              </div>

              {/* Final Answer */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Final Answer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">{run.finalAnswer}</div>
                </CardContent>
              </Card>

              <ConfidenceGauge confidence={run.confidence} />
              <RoundTracker rounds={run.rounds} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <RunHistory
            runs={runs}
            total={runsTotal}
            onSelect={handleSelectRun}
            onDelete={deleteRun}
            onLoadMore={handleLoadMore}
            hasMore={runs.length < runsTotal}
          />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          {analysis ? (
            <AnalysisCard analysis={analysis} />
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                Run a query to see analysis results
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="steps" className="space-y-4">
          {run && run.steps.length > 0 ? (
            <StepTimeline steps={run.steps} />
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                Run a query to see pipeline steps
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="verify" className="space-y-4">
          {hallucinationResult ? (
            <CitationVerification result={hallucinationResult} />
          ) : run ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground space-y-3">
                <Shield size={32} className="mx-auto text-muted-foreground/50" />
                <p>Verify the answer against source documents for hallucinations</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Use chunks from retrieval rounds as sources
                    const sources = run.steps
                      .filter((s) => s.type === 'retrieve')
                      .flatMap((s) => {
                        try {
                          const meta = s.metadata as Record<string, unknown>;
                          return [];
                        } catch {
                          return [];
                        }
                      });
                    checkHallucination(run.query, run.finalAnswer, []);
                  }}
                >
                  <Shield size={14} className="mr-2" />
                  Run Hallucination Check
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                Run a query first, then verify the answer
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          {metrics ? (
            <MetricsDashboard metrics={metrics} />
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground space-y-3">
                <BarChart3 size={32} className="mx-auto text-muted-foreground/50" />
                <p>View aggregated metrics across all agentic RAG runs</p>
                <Button variant="outline" size="sm" onClick={handleLoadMetrics}>
                  <BarChart3 size={14} className="mr-2" />
                  Load Metrics
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
