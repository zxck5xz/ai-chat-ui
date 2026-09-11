'use client';

import { useDebate } from '@/hooks/use-debate';
import { ArgumentColumn } from './argument-card';
import { JudgeVerdictPanel } from './judge-verdict';
import { FactCheckPanel } from './fact-check-panel';
import { ConsensusPanel } from './consensus-panel';
import { MetricsDashboard } from './metrics-dashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Play, Square, RotateCcw, History, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { DebateFormat } from '@/types/debate';

const FORMAT_OPTIONS: { value: DebateFormat; label: string; description: string }[] = [
  { value: 'free_form', label: 'Free Form', description: 'Opening + Closing' },
  { value: 'oxford', label: 'Oxford', description: 'Opening + Rebuttal + Closing' },
  {
    value: 'lincoln_douglas',
    label: 'Lincoln-Douglas',
    description: 'Opening + Rebuttal + Closing',
  },
];

const EXAMPLE_QUESTIONS = [
  'Should AI be regulated by governments?',
  'Is remote work better than office work?',
  'Should social media platforms be held liable for user content?',
  'Is nuclear energy the best solution for climate change?',
  'Should universities be tuition-free?',
];

export function DebatePanel() {
  const {
    currentRun,
    runs,
    runsTotal,
    metrics,
    status,
    events,
    error,
    runDebate,
    stop,
    fetchRuns,
    fetchRun,
    fetchMetrics,
    reset,
  } = useDebate();

  const [question, setQuestion] = useState('');
  const [format, setFormat] = useState<DebateFormat>('free_form');
  const [activeTab, setActiveTab] = useState('debate');

  useEffect(() => {
    if (activeTab === 'history') fetchRuns();
    if (activeTab === 'metrics') fetchMetrics();
  }, [activeTab, fetchRuns, fetchMetrics]);

  const handleRun = () => {
    if (!question.trim()) return;
    runDebate(question, format);
  };

  const isLoading =
    status === 'debating' ||
    status === 'judging' ||
    status === 'fact_checking' ||
    status === 'consensus';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="debate" className="flex items-center gap-1">
            <Play size={14} /> Debate
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1">
            <History size={14} /> History
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-1">
            <BarChart3 size={14} /> Metrics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="debate" className="space-y-6">
          {/* Input Section */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Question to Debate</label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter a debatable question..."
                  className="w-full h-20 px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isLoading}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {FORMAT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFormat(opt.value)}
                    disabled={isLoading}
                    className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                      format === opt.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background hover:bg-muted'
                    }`}
                  >
                    <div className="font-medium">{opt.label}</div>
                    <div className="text-xs opacity-70">{opt.description}</div>
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={handleRun} disabled={isLoading || !question.trim()}>
                  {isLoading ? (
                    <>
                      <Square size={14} className="mr-1" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play size={14} className="mr-1" />
                      Start Debate
                    </>
                  )}
                </Button>
                {isLoading && (
                  <Button variant="outline" onClick={stop}>
                    <Square size={14} className="mr-1" />
                    Stop
                  </Button>
                )}
                {currentRun && (
                  <Button variant="outline" onClick={reset}>
                    <RotateCcw size={14} className="mr-1" />
                    New Debate
                  </Button>
                )}
              </div>

              {/* Example questions */}
              {!currentRun && (
                <div>
                  <span className="text-xs text-muted-foreground">Examples:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {EXAMPLE_QUESTIONS.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => setQuestion(q)}
                        className="text-xs px-2 py-1 rounded border hover:bg-muted transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status */}
          {status !== 'idle' && (
            <div className="flex items-center gap-2">
              <Badge
                variant={isLoading ? 'default' : status === 'completed' ? 'default' : 'destructive'}
              >
                {status === 'debating' && 'Debating...'}
                {status === 'judging' && 'Judging...'}
                {status === 'fact_checking' && 'Fact-Checking...'}
                {status === 'consensus' && 'Building Consensus...'}
                {status === 'completed' && 'Completed'}
                {status === 'failed' && 'Failed'}
              </Badge>
              <span className="text-sm text-muted-foreground">{events.length} events</span>
            </div>
          )}

          {/* Results */}
          {currentRun && (
            <div className="space-y-6">
              {/* Arguments - 3 columns */}
              {currentRun.debaters.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Arguments</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {currentRun.debaters.map((debater) => (
                      <ArgumentColumn
                        key={debater.position}
                        position={debater.position}
                        arguments={debater.arguments}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Judge Verdict */}
              {currentRun.judge_verdict && <JudgeVerdictPanel verdict={currentRun.judge_verdict} />}

              {/* Fact Check */}
              {currentRun.fact_check && <FactCheckPanel factCheck={currentRun.fact_check} />}

              {/* Consensus */}
              {currentRun.consensus && <ConsensusPanel consensus={currentRun.consensus} />}

              {/* Run Stats */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Duration: </span>
                      <span className="font-medium">
                        {(currentRun.duration_ms / 1000).toFixed(1)}s
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rounds: </span>
                      <span className="font-medium">{currentRun.total_rounds}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Claims: </span>
                      <span className="font-medium">{currentRun.total_claims}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Accuracy: </span>
                      <span className="font-medium">
                        {(currentRun.accuracy_rate * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                {runs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No debates yet. Start your first debate!
                  </p>
                ) : (
                  runs.map((run) => (
                    <div
                      key={run.id}
                      onClick={() => {
                        fetchRun(run.id);
                        setActiveTab('debate');
                      }}
                      className="flex items-center justify-between p-3 rounded border hover:bg-muted cursor-pointer transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{run.question}</p>
                        <p className="text-xs text-muted-foreground">
                          {run.format} · {(run.duration_ms / 1000).toFixed(1)}s · {run.total_claims}{' '}
                          claims
                        </p>
                      </div>
                      <Badge variant={run.status === 'completed' ? 'default' : 'destructive'}>
                        {run.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
              {runsTotal > runs.length && (
                <Button
                  variant="outline"
                  className="w-full mt-3"
                  onClick={() => fetchRuns(20, runs.length)}
                >
                  Load More ({runsTotal - runs.length} remaining)
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          {metrics ? (
            <MetricsDashboard metrics={metrics} />
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                Loading metrics...
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
