'use client';

import { useState, useCallback, useRef } from 'react';
import type {
  AnalysisType,
  ImageAnalysisResult,
  DocumentUnderstandingResult,
  ComparisonResult,
  MultiModalChatMessage,
  ChatImage,
  MultiModalMetrics,
} from '@/types/multi-modal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-chat-api.ai-chat-api.workers.dev';

export function useMultiModal() {
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);
  const [documentResult, setDocumentResult] = useState<DocumentUnderstandingResult | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [chatMessages, setChatMessages] = useState<MultiModalChatMessage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<MultiModalMetrics | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const analyzeImage = useCallback(async (
    imageBase64: string,
    mimeType: string,
    analysisType: AnalysisType = 'describe',
    prompt?: string
  ) => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const response = await fetch(`${API_URL}/api/multi-modal/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mimeType, analysisType, prompt }),
      });

      if (!response.ok) throw new Error(`Analysis failed: ${response.status}`);

      const data = await response.json();
      setAnalysisResult(data.result);
      return data.result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      setError(message);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const analyzeImageStream = useCallback(async (
    imageBase64: string,
    mimeType: string,
    analysisType: AnalysisType = 'describe',
    prompt?: string
  ) => {
    setIsStreaming(true);
    setIsAnalyzing(true);
    setError(null);
    setStreamContent('');
    abortRef.current = new AbortController();

    try {
      const response = await fetch(`${API_URL}/api/multi-modal/analyze-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortRef.current.signal,
        body: JSON.stringify({ imageBase64, mimeType, analysisType, prompt }),
      });

      if (!response.ok) throw new Error(`Analysis failed: ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') continue;

            try {
              const event = JSON.parse(jsonStr);
              if (event.type === 'chunk') {
                setStreamContent((prev) => prev + event.content);
              } else if (event.type === 'done') {
                setAnalysisResult(event.result);
              } else if (event.type === 'error') {
                setError(event.message);
              }
            } catch {
              // Skip malformed
            }
          }
        }
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        setError(err instanceof Error ? err.message : 'Stream failed');
      }
    } finally {
      setIsStreaming(false);
      setIsAnalyzing(false);
    }
  }, []);

  const compareImages = useCallback(async (
    imageBase64A: string,
    imageBase64B: string,
    mimeType: string,
    prompt?: string
  ) => {
    setIsAnalyzing(true);
    setError(null);
    setComparisonResult(null);

    try {
      const response = await fetch(`${API_URL}/api/multi-modal/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64A, imageBase64B, mimeType, prompt }),
      });

      if (!response.ok) throw new Error(`Comparison failed: ${response.status}`);

      const data = await response.json();
      setComparisonResult(data.result);
      return data.result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Comparison failed';
      setError(message);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const understandDocument = useCallback(async (
    documentBase64: string,
    mimeType: string,
    options?: { extractTables?: boolean; extractImages?: boolean }
  ) => {
    setIsAnalyzing(true);
    setError(null);
    setDocumentResult(null);

    try {
      const response = await fetch(`${API_URL}/api/multi-modal/understand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentBase64,
          mimeType,
          extractTables: options?.extractTables ?? true,
          extractImages: options?.extractImages ?? true,
        }),
      });

      if (!response.ok) throw new Error(`Document analysis failed: ${response.status}`);

      const data = await response.json();
      setDocumentResult(data.result);
      return data.result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Document analysis failed';
      setError(message);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const sendChatMessage = useCallback(async (
    content: string,
    images?: ChatImage[]
  ) => {
    const userMessage: MultiModalChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      images,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setIsAnalyzing(true);
    setError(null);

    try {
      const messages = [...chatMessages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
        images: msg.images?.map((img) => ({ base64: img.base64, mimeType: img.mimeType })),
      }));

      const response = await fetch(`${API_URL}/api/multi-modal/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) throw new Error(`Chat failed: ${response.status}`);

      const data = await response.json();

      const assistantMessage: MultiModalChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
      };

      setChatMessages((prev) => [...prev, assistantMessage]);
      return data.reply;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Chat failed';
      setError(message);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, [chatMessages]);

  const loadMetrics = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/multi-modal/metrics`);
      const data = await response.json();
      setMetrics(data.metrics);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    }
  }, []);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setIsAnalyzing(false);
  }, []);

  const clearResults = useCallback(() => {
    setAnalysisResult(null);
    setDocumentResult(null);
    setComparisonResult(null);
    setStreamContent('');
    setError(null);
  }, []);

  return {
    analysisResult,
    documentResult,
    comparisonResult,
    chatMessages,
    isAnalyzing,
    isStreaming,
    streamContent,
    error,
    metrics,
    analyzeImage,
    analyzeImageStream,
    compareImages,
    understandDocument,
    sendChatMessage,
    loadMetrics,
    abort,
    clearResults,
  };
}
