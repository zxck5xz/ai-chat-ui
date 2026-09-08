'use client';

import { useEffect, useState } from 'react';
import { useLangGraph } from '@/hooks/use-langgraph';
import { PatternSelector } from './pattern-selector';
import { TraceView } from './trace-view';
import { ResultView } from './result-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, History, GitBranch } from 'lucide-react';

export function LangGraphPanel() {
  const { patterns, runs, currentRun, status, error, fetchPatterns, fetchRuns, runWorkflow } =
    useLangGraph();
  const [selectedPattern, setSelectedPattern] = useState('supervisor');
  const [task, setTask] = useState('Build a login page with validation and error handling');

  useEffect(() => {
    fetchPatterns();
    fetchRuns();
  }, [fetchPatterns, fetchRuns]);

  const handleRun = async () => {
    if (!task.trim()) return;
    await runWorkflow(selectedPattern, task);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <GitBranch size={24} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">LangGraph Multi-Agent</h1>
          <p className="text-sm text-muted-foreground">
            Stateful multi-agent orchestration with checkpointing & observability
          </p>
        </div>
      </div>

      <Tabs defaultValue="run">
        <TabsList>
          <TabsTrigger value="run" className="flex items-center gap-2">
            <Play size={14} /> Run
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History size={14} /> History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="run" className="space-y-6">
          {/* Pattern Selection */}
          <div>
            <h3 className="text-sm font-medium mb-3">Select Pattern</h3>
            <PatternSelector
              patterns={patterns}
              selected={selectedPattern}
              onSelect={setSelectedPattern}
            />
          </div>

          {/* Task Input */}
          <div>
            <h3 className="text-sm font-medium mb-3">Task</h3>
            <div className="flex gap-2">
              <Input
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Describe the task for the multi-agent system..."
                onKeyDown={(e) => e.key === 'Enter' && handleRun()}
              />
              <Button
                onClick={handleRun}
                disabled={status === 'running' || !task.trim()}
                className="flex items-center gap-2"
              >
                {status === 'running' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Run
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 text-red-600 text-sm">{error}</div>
          )}

          {/* Results */}
          {currentRun && (
            <div className="space-y-6">
              <ResultView run={currentRun} />
              <TraceView trace={currentRun.trace} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {runs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No runs yet</p>
          ) : (
            <div className="space-y-2">
              {runs.map((run) => (
                <button
                  key={run.threadId}
                  className="w-full p-3 rounded-lg border text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {run.status === 'completed' ? (
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                      )}
                      <span className="font-medium text-sm">{run.pattern}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-xs">
                        {run.task}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{run.trace?.totalDuration ?? 0}ms</span>
                      <span>{new Date(run.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
