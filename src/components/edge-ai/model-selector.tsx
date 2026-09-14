'use client';

import type { ModelConfig, ModelStatus, DeviceCapabilities } from '@/types/edge-ai';

interface ModelSelectorProps {
  models: ModelConfig[];
  statuses: ModelStatus[];
  device: DeviceCapabilities | null;
  selectedModel: string | null;
  loadProgress: Record<string, number>;
  loading: boolean;
  onSelect: (modelId: string) => void;
  onLoad: (modelId: string) => void;
  onUnload: (modelId: string) => void;
  isModelReady: (modelId: string) => boolean;
}

export function ModelSelector({
  models,
  statuses,
  device,
  selectedModel,
  loadProgress,
  loading,
  onSelect,
  onLoad,
  onUnload,
  isModelReady,
}: ModelSelectorProps) {
  const getStatusForModel = (modelId: string): ModelStatus | undefined => {
    return statuses.find((s) => s.modelId === modelId);
  };

  const formatSize = (mb: number): string => {
    if (mb >= 1000) return `${(mb / 1000).toFixed(1)}GB`;
    return `${mb}MB`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Available Models</h3>
        {device && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              device.capability === 'high-end'
                ? 'bg-green-100 text-green-700'
                : device.capability === 'mid-range'
                  ? 'bg-yellow-100 text-yellow-700'
                  : device.capability === 'low-end'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-red-100 text-red-700'
            }`}
          >
            {device.capability} device
          </span>
        )}
      </div>

      {device && (
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span
              className={`w-2 h-2 rounded-full ${device.webgpuSupported ? 'bg-green-500' : 'bg-red-500'}`}
            />
            WebGPU: {device.webgpuSupported ? 'Yes' : 'No'}
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            GPU: {device.gpuMemoryMB > 0 ? `${formatSize(device.gpuMemoryMB)}` : 'N/A'}
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            RAM: {formatSize(device.totalRAMMB)}
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            CPU: {device.cpuCores} cores
          </div>
        </div>
      )}

      <div className="space-y-2">
        {models.map((model) => {
          const status = getStatusForModel(model.id);
          const loaded = isModelReady(model.id);
          const progress = loadProgress[model.id] ?? 0;
          const compatible = !device || model.provider === 'onnx' || device.webgpuSupported;
          const isSelected = selectedModel === model.id;

          return (
            <div
              key={model.id}
              className={`p-3 rounded-lg border transition-all ${
                isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              } ${!compatible ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{model.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        model.provider === 'webllm'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {model.provider}
                    </span>
                    {loaded && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                        loaded
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {model.description}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                    <span>{formatSize(model.sizeMB)}</span>
                    {model.maxTokens && <span>{model.maxTokens} tokens</span>}
                    <span>{model.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {loaded ? (
                    <>
                      <button
                        onClick={() => onSelect(model.id)}
                        className={`text-xs px-2 py-1 rounded ${
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        }`}
                      >
                        Select
                      </button>
                      <button
                        onClick={() => onUnload(model.id)}
                        className="text-xs px-2 py-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20"
                      >
                        Unload
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => onLoad(model.id)}
                      disabled={loading || !compatible}
                      className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                      {loading && progress > 0 && progress < 100 ? `${progress}%` : 'Load'}
                    </button>
                  )}
                </div>
              </div>

              {loading && progress > 0 && progress < 100 && (
                <div className="mt-2">
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
