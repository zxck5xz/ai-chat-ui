// ONNX Runtime Web Client — On-device classification and embeddings
import type { ModelStatus } from '@/types/edge-ai';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OrtSession = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OrtModule = any;

let ortModule: OrtModule | null = null;

async function getOrt(): Promise<OrtModule> {
  if (ortModule) return ortModule;
  const mod = await import('onnxruntime-web');
  ortModule = mod.default || mod;
  if (ortModule?.env?.wasm) {
    ortModule.env.wasm.numThreads = navigator.hardwareConcurrency || 4;
  }
  return ortModule;
}

const onnxSessions: Map<string, OrtSession> = new Map();

export async function loadONNXModel(modelId: string, modelUrl?: string): Promise<ModelStatus> {
  const startTime = Date.now();

  try {
    const ort = await getOrt();
    const url = modelUrl || `https://huggingface.co/xenova/${modelId}/resolve/main/onnx/model.onnx`;

    const session = await ort.InferenceSession.create(url, {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all',
    });

    onnxSessions.set(modelId, session);

    return {
      modelId,
      loaded: true,
      loading: false,
      loadTimeMs: Date.now() - startTime,
      memoryMB: estimateONNXMemory(modelId),
      lastUsed: new Date().toISOString(),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    throw new Error(`Failed to load ONNX model ${modelId}: ${msg}`);
  }
}

export interface ClassificationResult {
  label: string;
  score: number;
}

export async function classifyWithONNX(
  modelId: string,
  text: string
): Promise<ClassificationResult[]> {
  const session = onnxSessions.get(modelId);
  if (!session) throw new Error(`ONNX model ${modelId} not loaded`);

  const tokens = tokenizeText(text, 512);
  const inputTensor = {
    data: new Int32Array(tokens),
    dims: [1, tokens.length],
    type: 'int32',
  };

  const feeds: Record<string, unknown> = {};
  const inputName = session.inputNames[0] || 'input_ids';
  feeds[inputName] = inputTensor;

  if (session.inputNames.includes('attention_mask')) {
    feeds['attention_mask'] = {
      data: new Int32Array(tokens.map(() => 1)),
      dims: [1, tokens.length],
      type: 'int32',
    };
  }

  const results = await session.run(feeds);
  const outputName = session.outputNames[0] || 'logits';
  const outputTensor = results[outputName] as { data: Float32Array; dims: number[] } | undefined;

  if (!outputTensor) return [{ label: 'unknown', score: 0 }];

  const logits = outputTensor.data as Float32Array;
  const scores = softmax(logits);

  return [
    { label: 'POSITIVE', score: scores[1] ?? 0 },
    { label: 'NEGATIVE', score: scores[0] ?? 0 },
  ];
}

export async function embedWithONNX(modelId: string, text: string): Promise<number[]> {
  const session = onnxSessions.get(modelId);
  if (!session) throw new Error(`ONNX model ${modelId} not loaded`);

  const tokens = tokenizeText(text, 256);
  const inputTensor = {
    data: new Int32Array(tokens),
    dims: [1, tokens.length],
    type: 'int32',
  };

  const feeds: Record<string, unknown> = {};
  const inputName = session.inputNames[0] || 'input_ids';
  feeds[inputName] = inputTensor;

  if (session.inputNames.includes('attention_mask')) {
    feeds['attention_mask'] = {
      data: new Int32Array(tokens.map(() => 1)),
      dims: [1, tokens.length],
      type: 'int32',
    };
  }

  const results = await session.run(feeds);
  const outputName = session.outputNames[0] || 'token_embeddings';
  const outputTensor = results[outputName] as { data: Float32Array; dims: number[] } | undefined;

  if (!outputTensor) return [];

  const data = outputTensor.data as Float32Array;
  const dim = outputTensor.dims[outputTensor.dims.length - 1] || 384;
  const embedding = new Array<number>(dim);
  for (let i = 0; i < dim; i++) {
    embedding[i] = data[i];
  }

  return embedding;
}

export async function unloadONNXModel(modelId: string): Promise<void> {
  const session = onnxSessions.get(modelId);
  if (session) {
    await session.release?.();
    onnxSessions.delete(modelId);
  }
}

export function isONNXModelLoaded(modelId: string): boolean {
  return onnxSessions.has(modelId);
}

function tokenizeText(text: string, maxLength: number): number[] {
  const words = text.toLowerCase().split(/\s+/).slice(0, maxLength);
  const tokens: number[] = [101]; // [CLS]
  for (const word of words) {
    const hash = (simpleHash(word) % 30000) + 1000;
    tokens.push(hash);
  }
  tokens.push(102); // [SEP]
  while (tokens.length < maxLength) tokens.push(0);
  return tokens.slice(0, maxLength);
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function softmax(arr: Float32Array): number[] {
  let max = -Infinity;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > max) max = arr[i];
  }
  let sum = 0;
  const result = new Array<number>(arr.length);
  for (let i = 0; i < arr.length; i++) {
    result[i] = Math.exp(arr[i] - max);
    sum += result[i];
  }
  for (let i = 0; i < result.length; i++) {
    result[i] /= sum;
  }
  return result;
}

function estimateONNXMemory(modelId: string): number {
  if (modelId.includes('MiniLM')) return 90;
  if (modelId.includes('distilbert')) return 260;
  return 150;
}
