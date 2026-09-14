// Model Manager — GPU detection, model selection, WebLLM/ONNX initialization
import type {
  DeviceCapabilities,
  ModelConfig,
  ModelStatus,
  ModelProvider,
  ModelCategory,
  DeviceCapability,
} from '@/types/edge-ai';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface StoredModelConfig {
  id: string;
  name: string;
  provider: ModelProvider;
  category: string;
  modelId: string;
  sizeMB: number;
  minGPUMemoryMB: number;
  minRAMMB: number;
  description: string;
  quantization: string;
  maxTokens: number;
}

class ModelManager {
  private device: DeviceCapabilities | null = null;
  private loadedModels: Map<string, ModelStatus> = new Map();
  private modelConfigs: Map<string, StoredModelConfig> = new Map();

  async detectDevice(): Promise<DeviceCapabilities> {
    if (this.device) return this.device;

    const webgpuSupported = typeof navigator !== 'undefined' && 'gpu' in navigator;

    let gpuMemoryMB = 0;
    if (webgpuSupported) {
      const nav = navigator as unknown as {
        gpu?: {
          requestAdapter: () => Promise<{
            requestAdapterInfo?: () => Promise<{ description?: string }>;
          } | null>;
        };
      };
      if (nav.gpu) {
        try {
          const adapter = await nav.gpu.requestAdapter();
          if (adapter) {
            const info = adapter.requestAdapterInfo
              ? await adapter.requestAdapterInfo()
              : (adapter as unknown as { info?: { description?: string } }).info;
            const desc = info?.description || '';
            const match = desc.match(/(\d+)\s*MB/i);
            if (match) {
              gpuMemoryMB = parseInt(match[1]);
            } else {
              gpuMemoryMB = 2048;
            }
          }
        } catch {
          gpuMemoryMB = 0;
        }
      }
    }

    const totalRAMMB =
      typeof navigator !== 'undefined' && 'deviceMemory' in navigator
        ? ((navigator as unknown as { deviceMemory: number }).deviceMemory || 4) * 1024
        : 4096;

    const cpuCores =
      typeof navigator !== 'undefined' && 'hardwareConcurrency' in navigator
        ? navigator.hardwareConcurrency || 4
        : 4;

    let capability: DeviceCapability = 'unsupported';
    if (webgpuSupported && gpuMemoryMB >= 4096) {
      capability = 'high-end';
    } else if (webgpuSupported && gpuMemoryMB >= 1536) {
      capability = 'mid-range';
    } else if (totalRAMMB >= 2048) {
      capability = 'low-end';
    }

    const recommendedModels: string[] = [];
    for (const [, config] of this.modelConfigs) {
      if (config.provider === 'onnx') {
        recommendedModels.push(config.id);
      } else if (
        webgpuSupported &&
        config.minGPUMemoryMB <= gpuMemoryMB &&
        config.minRAMMB <= totalRAMMB
      ) {
        recommendedModels.push(config.id);
      }
    }

    this.device = {
      gpuAvailable: webgpuSupported,
      gpuMemoryMB,
      webgpuSupported,
      totalRAMMB,
      cpuCores,
      capability,
      recommendedModels,
    };

    return this.device;
  }

  async fetchModels(): Promise<ModelConfig[]> {
    if (this.modelConfigs.size > 0) {
      return Array.from(this.modelConfigs.values()) as ModelConfig[];
    }

    try {
      const res = await fetch(`${API_BASE}/api/edge-ai/models`);
      const data = (await res.json()) as { models: StoredModelConfig[] };
      const models = data.models || [];
      for (const m of models) {
        this.modelConfigs.set(m.id, m);
      }
      return models as ModelConfig[];
    } catch {
      return this.getDefaultModels();
    }
  }

  private getDefaultModels(): ModelConfig[] {
    const defaults: StoredModelConfig[] = [
      {
        id: 'llama-3.2-3b',
        name: 'Llama 3.2 3B',
        provider: 'webllm',
        category: 'text-generation',
        modelId: 'Llama-3.2-3B-Instruct-q4f16_1-MLC',
        sizeMB: 2000,
        minGPUMemoryMB: 2048,
        minRAMMB: 4096,
        description: 'Meta Llama 3.2 3B',
        quantization: 'q4f16_1',
        maxTokens: 4096,
      },
      {
        id: 'phi-3.5-mini',
        name: 'Phi-3.5 Mini',
        provider: 'webllm',
        category: 'text-generation',
        modelId: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
        sizeMB: 2400,
        minGPUMemoryMB: 2560,
        minRAMMB: 4096,
        description: 'Microsoft Phi-3.5 Mini',
        quantization: 'q4f16_1',
        maxTokens: 4096,
      },
      {
        id: 'gemma-2-2b',
        name: 'Gemma 2 2B',
        provider: 'webllm',
        category: 'text-generation',
        modelId: 'gemma-2-2b-it-q4f16_1-MLC',
        sizeMB: 1600,
        minGPUMemoryMB: 1536,
        minRAMMB: 3072,
        description: 'Google Gemma 2 2B',
        quantization: 'q4f16_1',
        maxTokens: 4096,
      },
      {
        id: 'qwen2.5-1.5b',
        name: 'Qwen2.5 1.5B',
        provider: 'webllm',
        category: 'text-generation',
        modelId: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
        sizeMB: 1100,
        minGPUMemoryMB: 1024,
        minRAMMB: 2048,
        description: 'Alibaba Qwen2.5 1.5B',
        quantization: 'q4f16_1',
        maxTokens: 2048,
      },
      {
        id: 'distilbert-sst2',
        name: 'DistilBERT SST-2',
        provider: 'onnx',
        category: 'classification',
        modelId: 'distilbert-base-uncased-finetuned-sst-2-english',
        sizeMB: 67,
        minGPUMemoryMB: 0,
        minRAMMB: 512,
        description: 'Sentiment classifier (positive/negative)',
        quantization: 'fp32',
        maxTokens: 512,
      },
      {
        id: 'mini-lm-embeddings',
        name: 'MiniLM-L6 Embeddings',
        provider: 'onnx',
        category: 'embedding',
        modelId: 'all-MiniLM-L6-v2',
        sizeMB: 23,
        minGPUMemoryMB: 0,
        minRAMMB: 256,
        description: 'Sentence embeddings (384-dim)',
        quantization: 'fp32',
        maxTokens: 256,
      },
    ];
    for (const m of defaults) {
      this.modelConfigs.set(m.id, m);
    }
    return defaults as ModelConfig[];
  }

  getModelConfig(modelId: string): StoredModelConfig | undefined {
    return this.modelConfigs.get(modelId);
  }

  updateModelStatus(modelId: string, status: Partial<ModelStatus>) {
    const existing = this.loadedModels.get(modelId);
    this.loadedModels.set(modelId, {
      modelId,
      loaded: false,
      loading: false,
      loadTimeMs: 0,
      memoryMB: 0,
      lastUsed: new Date().toISOString(),
      ...existing,
      ...status,
    });
  }

  getModelStatus(modelId: string): ModelStatus | undefined {
    return this.loadedModels.get(modelId);
  }

  getLoadedModels(): ModelStatus[] {
    return Array.from(this.loadedModels.values());
  }

  isModelCompatible(modelId: string): boolean {
    if (!this.device) return false;
    const config = this.modelConfigs.get(modelId);
    if (!config) return false;
    if (config.provider === 'onnx') return true;
    return (
      this.device.webgpuSupported &&
      config.minGPUMemoryMB <= this.device.gpuMemoryMB &&
      config.minRAMMB <= this.device.totalRAMMB
    );
  }

  selectBestModel(category: string = 'text-generation'): StoredModelConfig | null {
    if (!this.device) return null;

    const candidates = Array.from(this.modelConfigs.values()).filter(
      (m) => m.category === category && this.isModelCompatible(m.id)
    );

    if (candidates.length === 0) return null;

    candidates.sort((a, b) => a.sizeMB - b.sizeMB);
    return candidates[0];
  }
}

export const modelManager = new ModelManager();
