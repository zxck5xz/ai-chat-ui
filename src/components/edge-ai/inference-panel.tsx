'use client';

import { useState, useRef, useEffect } from 'react';
import type { InferenceMode } from '@/types/edge-ai';

interface InferencePanelProps {
  loading: boolean;
  mode: InferenceMode;
  selectedModel: string | null;
  onRun: (
    prompt: string,
    options: {
      maxTokens?: number;
      temperature?: number;
      preferredMode?: InferenceMode;
      onChunk?: (text: string, finished: boolean) => void;
    }
  ) => Promise<{ output: string; mode: InferenceMode; tokensPerSecond: number; latencyMs: number }>;
  onSetMode: (mode: InferenceMode) => void;
  isModelReady: (modelId: string) => boolean;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  mode?: InferenceMode;
  tokensPerSecond?: number;
  latencyMs?: number;
  timestamp: number;
}

export function InferencePanel({
  loading,
  mode,
  selectedModel,
  onRun,
  onSetMode,
  isModelReady,
}: InferencePanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [maxTokens, setMaxTokens] = useState(256);
  const [temperature, setTemperature] = useState(0.7);
  const [streamingText, setStreamingText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const prompt = input.trim();
    setInput('');

    setMessages((prev) => [...prev, { role: 'user', content: prompt, timestamp: Date.now() }]);

    setStreamingText('');

    try {
      const result = await onRun(prompt, {
        maxTokens,
        temperature,
        preferredMode: mode,
        onChunk: (text, finished) => {
          if (finished) {
            setStreamingText('');
          } else {
            setStreamingText((prev) => prev + text);
          }
        },
      });

      setStreamingText('');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: result.output,
          mode: result.mode,
          tokensPerSecond: result.tokensPerSecond,
          latencyMs: result.latencyMs,
          timestamp: Date.now(),
        },
      ]);
    } catch {
      setStreamingText('');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Error: Failed to run inference. Please try again.',
          timestamp: Date.now(),
        },
      ]);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setStreamingText('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Inference</h3>
          {selectedModel && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
              {selectedModel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={mode}
            onChange={(e) => onSetMode(e.target.value as InferenceMode)}
            className="text-xs px-2 py-1 rounded border bg-background"
          >
            <option value="local">Local</option>
            <option value="cloud">Cloud</option>
            <option value="hybrid">Hybrid</option>
          </select>
          <button
            onClick={clearChat}
            className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && !streamingText && (
          <div className="text-center text-muted-foreground text-sm py-8">
            {selectedModel
              ? isModelReady(selectedModel)
                ? 'Model loaded. Start chatting locally!'
                : 'Load a model first, then start chatting.'
              : 'Select and load a model to start.'}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-lg p-3 ${
                msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
              {msg.role === 'assistant' && msg.tokensPerSecond !== undefined && (
                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                  {msg.mode && (
                    <span
                      className={`px-1 py-0.5 rounded ${
                        msg.mode === 'local'
                          ? 'bg-emerald-100 text-emerald-700'
                          : msg.mode === 'cloud'
                            ? 'bg-sky-100 text-sky-700'
                            : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {msg.mode}
                    </span>
                  )}
                  <span>{msg.tokensPerSecond.toFixed(1)} tok/s</span>
                  <span>{msg.latencyMs}ms</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {streamingText && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-lg p-3 bg-secondary">
              <div className="text-sm whitespace-pre-wrap">{streamingText}</div>
              <div className="mt-1 h-1 w-8 bg-primary/50 rounded-full animate-pulse" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Settings */}
      <div className="px-3 py-2 border-t flex items-center gap-4 text-xs text-muted-foreground">
        <label className="flex items-center gap-1.5">
          Max Tokens:
          <input
            type="number"
            value={maxTokens}
            onChange={(e) => setMaxTokens(parseInt(e.target.value) || 256)}
            className="w-16 px-1.5 py-0.5 rounded border bg-background text-foreground text-xs"
            min={1}
            max={4096}
          />
        </label>
        <label className="flex items-center gap-1.5">
          Temperature:
          <input
            type="number"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value) || 0.7)}
            className="w-16 px-1.5 py-0.5 rounded border bg-background text-foreground text-xs"
            min={0}
            max={2}
            step={0.1}
          />
        </label>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            selectedModel
              ? isModelReady(selectedModel)
                ? 'Type a message...'
                : 'Load the model first...'
              : 'Select a model first...'
          }
          disabled={loading || !selectedModel}
          className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm placeholder:text-muted-foreground disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim() || !selectedModel}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
