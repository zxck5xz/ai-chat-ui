'use client';

import { useToolAgent } from '@/hooks/use-tool-agent';
import { ReasoningStep } from './reasoning-step';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, RotateCcw, Wrench, Bot, Zap } from 'lucide-react';
import { useState } from 'react';

const EXAMPLE_QUERIES = [
  'Tìm giá iPhone 15 ở 3 shop khác nhau, so sánh và tóm tắt',
  'Tìm thời tiết Hà Nội hôm nay và tínhahrenheit转换',
  'Tìm giá Bitcoin hiện tại, tính 0.5 BTC = bao nhiêu USD',
  'So sánh giá Samsung Galaxy S24 vs iPhone 15 Pro',
];

export function ToolAgentPanel() {
  const {
    steps,
    currentStep,
    finalAnswer,
    status,
    error,
    currentThought,
    totalToolCalls,
    progress,
    runQuery,
    reset,
  } = useToolAgent();

  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || status === 'running') return;
    runQuery(query.trim());
    setQuery('');
  };

  const handleExampleClick = (example: string) => {
    if (status === 'running') return;
    runQuery(example);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
            <Wrench className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Agent with Tool Use</h1>
            <p className="text-sm text-muted-foreground">
              Agent with function calling, multi-step reasoning, and tool orchestration
            </p>
          </div>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything... e.g. 'Find iPhone 15 prices at 3 shops and compare'"
          disabled={status === 'running'}
          className="flex-1"
        />
        <Button type="submit" disabled={!query.trim() || status === 'running'}>
          {status === 'running' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
        {status !== 'idle' && (
          <Button type="button" variant="outline" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </form>

      {/* Example queries */}
      {status === 'idle' && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Try an example:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((example, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                onClick={() => handleExampleClick(example)}
                className="text-xs"
              >
                {example}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Progress */}
      {status === 'running' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-muted-foreground">
                Step {currentStep + 1} • {totalToolCalls} tool calls
              </span>
            </div>
            <span className="text-muted-foreground">{progress}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {currentThought && (
            <div className="text-sm text-muted-foreground italic bg-muted/30 p-3 rounded-md">
              <Bot className="h-4 w-4 inline mr-1" />
              {currentThought.slice(0, 200)}
              {currentThought.length > 200 && '...'}
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Reasoning Steps */}
      {steps.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Reasoning Chain</h3>
          {steps.map((step, i) => (
            <ReasoningStep
              key={i}
              step={step}
              stepIndex={i}
              isActive={status === 'running' && i === currentStep}
            />
          ))}
        </div>
      )}

      {/* Final Answer */}
      {finalAnswer && status === 'completed' && (
        <div className="border rounded-lg p-4 bg-green-500/5 border-green-500/20">
          <h3 className="text-sm font-medium text-green-500 mb-2 flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Final Answer
          </h3>
          <div className="text-sm whitespace-pre-wrap">{finalAnswer}</div>
        </div>
      )}
    </div>
  );
}
