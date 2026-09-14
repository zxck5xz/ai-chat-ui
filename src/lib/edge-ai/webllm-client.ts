// WebLLM Client — Browser-based LLM inference via WebGPU
import type { ModelStatus } from '@/types/edge-ai';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WebLLMEngine = any;

let webllmModule: {
  CreateMLCEngine: (modelId: string, config?: Record<string, unknown>) => Promise<WebLLMEngine>;
} | null = null;

async function getWebLLM() {
  if (webllmModule) return webllmModule;
  const mod = await import('@mlc-ai/web-llm');
  webllmModule = {
    CreateMLCEngine: mod.CreateMLCEngine as (
      modelId: string,
      config?: Record<string, unknown>
    ) => Promise<WebLLMEngine>,
  };
  return webllmModule;
}

interface LoadedEngine {
  engine: WebLLMEngine;
  modelId: string;
  loadedAt: number;
}

const engines: Map<string, LoadedEngine> = new Map();

export interface WebLLMGenerateOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

export interface WebLLMStreamChunk {
  text: string;
  finished: boolean;
}

export async function loadWebLLMModel(
  modelId: string,
  onProgress?: (progress: number, text: string) => void
): Promise<ModelStatus> {
  const startTime = Date.now();

  try {
    const webllm = await getWebLLM();

    const engine = await webllm.CreateMLCEngine(modelId, {
      logLevel: 'INFO',
      initProgressCallback: onProgress
        ? (report: { progress: number; text: string }) => onProgress(report.progress, report.text)
        : undefined,
    });

    engines.set(modelId, { engine, modelId, loadedAt: Date.now() });

    const status: ModelStatus = {
      modelId,
      loaded: true,
      loading: false,
      loadTimeMs: Date.now() - startTime,
      memoryMB: estimateModelMemory(modelId),
      lastUsed: new Date().toISOString(),
    };

    return status;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    throw new Error(`Failed to load model ${modelId}: ${msg}`);
  }
}

export async function generateWithWebLLM(
  modelId: string,
  prompt: string,
  options: WebLLMGenerateOptions = {}
): Promise<{ text: string; tokensGenerated: number; latencyMs: number }> {
  const engine = engines.get(modelId);
  if (!engine) throw new Error(`Model ${modelId} not loaded`);

  const startTime = Date.now();

  const response = await engine.engine.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    max_tokens: options.maxTokens || 256,
    temperature: options.temperature ?? 0.7,
    top_p: options.topP ?? 0.9,
    stream: false,
  });

  let text = '';
  for await (const chunk of response) {
    const delta = chunk.choices?.[0]?.delta?.content;
    if (delta) text += delta;
  }

  const latencyMs = Date.now() - startTime;
  const tokensGenerated = text.split(/\s+/).length;

  return { text, tokensGenerated, latencyMs };
}

export async function* streamWithWebLLM(
  modelId: string,
  prompt: string,
  options: WebLLMGenerateOptions = {}
): AsyncGenerator<WebLLMStreamChunk> {
  const engine = engines.get(modelId);
  if (!engine) throw new Error(`Model ${modelId} not loaded`);

  const response = await engine.engine.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    max_tokens: options.maxTokens || 256,
    temperature: options.temperature ?? 0.7,
    top_p: options.topP ?? 0.9,
    stream: true,
  });

  let totalText = '';
  for await (const chunk of response) {
    const delta = chunk.choices?.[0]?.delta?.content;
    if (delta) {
      totalText += delta;
      yield { text: delta, finished: false };
    }
  }

  yield { text: '', finished: true };
}

export async function unloadWebLLMModel(modelId: string): Promise<void> {
  const engine = engines.get(modelId);
  if (engine) {
    await engine.engine.unload();
    engines.delete(modelId);
  }
}

export function isModelLoaded(modelId: string): boolean {
  return engines.has(modelId);
}

export function getLoadedModelIds(): string[] {
  return Array.from(engines.keys());
}

function estimateModelMemory(modelId: string): number {
  if (modelId.includes('1.5B') || modelId.includes('1_5B')) return 1100;
  if (modelId.includes('2B') || modelId.includes('2b')) return 1600;
  if (modelId.includes('3B') || modelId.includes('3b')) return 2000;
  if (modelId.includes('7B') || modelId.includes('7b')) return 4500;
  return 2000;
}
