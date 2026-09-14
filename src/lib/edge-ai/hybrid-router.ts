// Hybrid Router — Routes inference tasks to local or cloud based on complexity
import type { InferenceMode, ModelConfig } from '@/types/edge-ai';
import { modelManager } from './model-manager';
import { isModelLoaded, generateWithWebLLM, streamWithWebLLM } from './webllm-client';
import { isONNXModelLoaded, classifyWithONNX, embedWithONNX } from './onnx-client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface RoutingDecision {
  mode: InferenceMode;
  modelId: string;
  reason: string;
}

export function decideRouting(
  task: 'text-generation' | 'classification' | 'embedding',
  prompt: string
): RoutingDecision {
  const device = modelManager['device'];

  if (task === 'classification') {
    if (isONNXModelLoaded('distilbert-sst2')) {
      return {
        mode: 'local',
        modelId: 'distilbert-sst2',
        reason: 'ONNX classifier loaded locally',
      };
    }
    return { mode: 'cloud', modelId: 'gemini', reason: 'No local classifier available' };
  }

  if (task === 'embedding') {
    if (isONNXModelLoaded('mini-lm-embeddings')) {
      return {
        mode: 'local',
        modelId: 'mini-lm-embeddings',
        reason: 'ONNX embeddings loaded locally',
      };
    }
    return { mode: 'cloud', modelId: 'gemini', reason: 'No local embedder available' };
  }

  const complexity = estimateComplexity(prompt);

  if (complexity === 'simple' && device?.capability !== 'unsupported') {
    const bestModel = modelManager.selectBestModel('text-generation');
    if (bestModel && isModelLoaded(bestModel.modelId)) {
      return {
        mode: 'local',
        modelId: bestModel.modelId,
        reason: 'Simple task, local model sufficient',
      };
    }
    if (bestModel) {
      return {
        mode: 'hybrid',
        modelId: bestModel.modelId,
        reason: 'Simple task, loading local model',
      };
    }
  }

  if (complexity === 'complex') {
    return { mode: 'cloud', modelId: 'gemini', reason: 'Complex task, cloud model recommended' };
  }

  if (device?.capability === 'high-end') {
    const bestModel = modelManager.selectBestModel('text-generation');
    if (bestModel && isModelLoaded(bestModel.modelId)) {
      return {
        mode: 'local',
        modelId: bestModel.modelId,
        reason: 'Mid-range task on high-end device',
      };
    }
  }

  return { mode: 'cloud', modelId: 'gemini', reason: 'Default to cloud for reliability' };
}

function estimateComplexity(prompt: string): 'simple' | 'moderate' | 'complex' {
  const wordCount = prompt.split(/\s+/).length;
  const hasCode = /```|function|class|import|const|let|var/i.test(prompt);
  const hasMath = /calculate|equation|proof|derivative|integral/i.test(prompt);
  const hasLongContext = prompt.length > 2000;
  const hasMultiStep = /step by step|chain of thought|reasoning|explain.*why/i.test(prompt);

  if (hasCode || hasMath || hasMultiStep || hasLongContext) return 'complex';
  if (wordCount > 50) return 'moderate';
  return 'simple';
}

export async function hybridGenerate(
  prompt: string,
  options: {
    preferredMode?: InferenceMode;
    maxTokens?: number;
    temperature?: number;
    onChunk?: (text: string, finished: boolean) => void;
  } = {}
): Promise<{
  result: string;
  mode: InferenceMode;
  modelId: string;
  tokensPerSecond: number;
  latencyMs: number;
}> {
  const decision =
    options.preferredMode === 'local'
      ? {
          mode: 'local' as const,
          modelId: modelManager.selectBestModel()?.modelId || 'llama-3.2-3b',
          reason: 'User preference',
        }
      : options.preferredMode === 'cloud'
        ? { mode: 'cloud' as const, modelId: 'gemini', reason: 'User preference' }
        : decideRouting('text-generation', prompt);

  const startTime = Date.now();

  if (decision.mode === 'local' || decision.mode === 'hybrid') {
    if (isModelLoaded(decision.modelId)) {
      try {
        if (options.onChunk) {
          let fullText = '';
          for await (const chunk of streamWithWebLLM(decision.modelId, prompt, {
            maxTokens: options.maxTokens,
            temperature: options.temperature,
          })) {
            if (chunk.finished) {
              options.onChunk('', true);
            } else {
              fullText += chunk.text;
              options.onChunk(chunk.text, false);
            }
          }
          const latencyMs = Date.now() - startTime;
          return {
            result: fullText,
            mode: 'local',
            modelId: decision.modelId,
            tokensPerSecond: fullText.split(/\s+/).length / (latencyMs / 1000),
            latencyMs,
          };
        }

        const output = await generateWithWebLLM(decision.modelId, prompt, {
          maxTokens: options.maxTokens,
          temperature: options.temperature,
        });
        return {
          result: output.text,
          mode: 'local',
          modelId: decision.modelId,
          tokensPerSecond: output.tokensGenerated / (output.latencyMs / 1000),
          latencyMs: output.latencyMs,
        };
      } catch {
        if (decision.mode === 'hybrid') {
          return cloudGenerate(prompt, options, startTime);
        }
        throw new Error('Local inference failed');
      }
    }

    if (decision.mode === 'hybrid') {
      return cloudGenerate(prompt, options, startTime);
    }
  }

  return cloudGenerate(prompt, options, startTime);
}

async function cloudGenerate(
  prompt: string,
  options: {
    maxTokens?: number;
    temperature?: number;
    onChunk?: (text: string, finished: boolean) => void;
  },
  startTime: number
) {
  try {
    const res = await fetch(`${API_BASE}/api/edge-ai/inference`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        maxTokens: options.maxTokens || 256,
        temperature: options.temperature ?? 0.7,
      }),
    });

    const data = (await res.json()) as {
      result?: { output: string; tokensPerSecond: number; latencyMs: number };
      error?: string;
    };

    if (data.error) throw new Error(data.error);

    if (options.onChunk && data.result) {
      options.onChunk(data.result.output, false);
      options.onChunk('', true);
    }

    return {
      result: data.result?.output || '',
      mode: 'cloud' as const,
      modelId: 'gemini',
      tokensPerSecond: data.result?.tokensPerSecond || 0,
      latencyMs: data.result?.latencyMs || Date.now() - startTime,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Cloud inference failed';
    throw new Error(msg);
  }
}

export async function hybridClassify(text: string): Promise<{
  results: Array<{ label: string; score: number }>;
  mode: InferenceMode;
}> {
  if (isONNXModelLoaded('distilbert-sst2')) {
    const results = await classifyWithONNX('distilbert-sst2', text);
    return { results, mode: 'local' };
  }

  const res = await fetch(`${API_BASE}/api/edge-ai/inference`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: `Classify the sentiment of this text as POSITIVE or NEGATIVE. Reply with just the label and confidence score (0-1) in JSON format: {"label": "...", "score": ...}\n\nText: ${text}`,
      maxTokens: 50,
    }),
  });
  const data = (await res.json()) as { result?: { output: string } };
  try {
    const parsed = JSON.parse(data.result?.output || '{}');
    return {
      results: [{ label: parsed.label || 'UNKNOWN', score: parsed.score || 0 }],
      mode: 'cloud',
    };
  } catch {
    return { results: [{ label: 'UNKNOWN', score: 0 }], mode: 'cloud' };
  }
}

export async function hybridEmbed(text: string): Promise<{
  embedding: number[];
  mode: InferenceMode;
}> {
  if (isONNXModelLoaded('mini-lm-embeddings')) {
    const embedding = await embedWithONNX('mini-lm-embeddings', text);
    return { embedding, mode: 'local' };
  }

  return { embedding: [], mode: 'cloud' };
}
