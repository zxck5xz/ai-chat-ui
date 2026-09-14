'use client';

import { useState, useCallback, useRef } from 'react';
import type {
  DeviceCapabilities,
  ModelConfig,
  ModelStatus,
  InferenceResult,
  PerformanceMetrics,
  InferenceMode,
} from '@/types/edge-ai';
import { modelManager } from '@/lib/edge-ai/model-manager';
import { loadWebLLMModel, unloadWebLLMModel, isModelLoaded } from '@/lib/edge-ai/webllm-client';
import { loadONNXModel, unloadONNXModel, isONNXModelLoaded } from '@/lib/edge-ai/onnx-client';
import { hybridGenerate } from '@/lib/edge-ai/hybrid-router';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface UseEdgeAIState {
  device: DeviceCapabilities | null;
  models: ModelConfig[];
  modelStatuses: ModelStatus[];
  metrics: PerformanceMetrics | null;
  history: InferenceResult[];
  loading: boolean;
  error: string | null;
  selectedModel: string | null;
  mode: InferenceMode;
  loadProgress: Record<string, number>;
}

export function useEdgeAI() {
  const [state, setState] = useState<UseEdgeAIState>({
    device: null,
    models: [],
    modelStatuses: [],
    metrics: null,
    history: [],
    loading: false,
    error: null,
    selectedModel: null,
    mode: 'hybrid',
    loadProgress: {},
  });

  const abortRef = useRef<AbortController | null>(null);

  const updateState = useCallback((patch: Partial<UseEdgeAIState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const detectDevice = useCallback(async () => {
    const device = await modelManager.detectDevice();
    updateState({ device });
    return device;
  }, [updateState]);

  const fetchModels = useCallback(async () => {
    const models = await modelManager.fetchModels();
    const statuses = modelManager.getLoadedModels();
    updateState({ models, modelStatuses: statuses });
    return models;
  }, [updateState]);

  const loadModel = useCallback(
    async (modelId: string) => {
      updateState({ loading: true, error: null });
      updateState({
        loadProgress: { ...state.loadProgress, [modelId]: 0 },
      });

      try {
        const config = modelManager.getModelConfig(modelId);
        if (!config) throw new Error(`Unknown model: ${modelId}`);

        let status: ModelStatus;
        if (config.provider === 'webllm') {
          status = await loadWebLLMModel(config.modelId, (progress) => {
            updateState({
              loadProgress: { ...state.loadProgress, [modelId]: Math.round(progress * 100) },
            });
          });
        } else {
          status = await loadONNXModel(config.modelId);
        }

        modelManager.updateModelStatus(modelId, status);
        const statuses = modelManager.getLoadedModels();
        updateState({
          modelStatuses: statuses,
          selectedModel: modelId,
          loading: false,
          loadProgress: { ...state.loadProgress, [modelId]: 100 },
        });

        return status;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load model';
        updateState({ loading: false, error: msg });
        throw err;
      }
    },
    [state.loadProgress, updateState]
  );

  const unloadModel = useCallback(
    async (modelId: string) => {
      try {
        const config = modelManager.getModelConfig(modelId);
        if (config?.provider === 'webllm') {
          await unloadWebLLMModel(config.modelId);
        } else if (config?.provider === 'onnx') {
          await unloadONNXModel(config.modelId);
        }

        modelManager.updateModelStatus(modelId, { loaded: false, loading: false });
        const statuses = modelManager.getLoadedModels();
        updateState({ modelStatuses: statuses });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to unload model';
        updateState({ error: msg });
      }
    },
    [updateState]
  );

  const runInference = useCallback(
    async (
      prompt: string,
      options: {
        maxTokens?: number;
        temperature?: number;
        preferredMode?: InferenceMode;
        onChunk?: (text: string, finished: boolean) => void;
      } = {}
    ) => {
      updateState({ loading: true, error: null });
      abortRef.current = new AbortController();

      try {
        const result = await hybridGenerate(prompt, {
          preferredMode: options.preferredMode || state.mode,
          maxTokens: options.maxTokens || 256,
          temperature: options.temperature ?? 0.7,
          onChunk: options.onChunk,
        });

        const inference: InferenceResult = {
          id: crypto.randomUUID(),
          modelId: result.modelId,
          input: prompt,
          output: result.result,
          mode: result.mode,
          tokensGenerated: result.result.split(/\s+/).length,
          tokensPerSecond: result.tokensPerSecond,
          latencyMs: result.latencyMs,
          memoryUsedMB: 0,
          provider:
            result.mode === 'local' ? 'webllm' : result.mode === 'cloud' ? 'cloud' : 'webllm',
          created_at: new Date().toISOString(),
        };

        // Log to backend
        try {
          await fetch(`${API_BASE}/api/edge-ai/log-inference`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(inference),
          });
        } catch {
          // Non-critical
        }

        updateState({
          loading: false,
          history: [inference, ...state.history].slice(0, 100),
        });

        return inference;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Inference failed';
        updateState({ loading: false, error: msg });
        throw err;
      }
    },
    [state.mode, state.history, updateState]
  );

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/edge-ai/metrics`);
      const data = (await res.json()) as { metrics: PerformanceMetrics };
      updateState({ metrics: data.metrics });
    } catch {
      // Non-critical
    }
  }, [updateState]);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/edge-ai/history?limit=50`);
      const data = (await res.json()) as { history: InferenceResult[] };
      updateState({ history: data.history || [] });
    } catch {
      // Non-critical
    }
  }, [updateState]);

  const setMode = useCallback(
    (mode: InferenceMode) => {
      updateState({ mode });
    },
    [updateState]
  );

  const setSelectedModel = useCallback(
    (modelId: string | null) => {
      updateState({ selectedModel: modelId });
    },
    [updateState]
  );

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const isModelReady = useCallback((modelId: string): boolean => {
    return isModelLoaded(modelId) || isONNXModelLoaded(modelId);
  }, []);

  return {
    ...state,
    detectDevice,
    fetchModels,
    loadModel,
    unloadModel,
    runInference,
    fetchMetrics,
    fetchHistory,
    setMode,
    setSelectedModel,
    clearError,
    isModelReady,
  };
}
