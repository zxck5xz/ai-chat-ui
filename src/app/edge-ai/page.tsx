'use client';

import { useEffect, useState } from 'react';
import { useEdgeAI } from '@/hooks/use-edge-ai';
import { ModelSelector } from '@/components/edge-ai/model-selector';
import { PerformanceDashboard } from '@/components/edge-ai/performance-dashboard';
import { InferencePanel } from '@/components/edge-ai/inference-panel';
import { OfflineToggle } from '@/components/edge-ai/offline-toggle';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  HelpCircle,
  Monitor,
  Cpu,
  MessageSquare,
  BarChart3,
  WifiOff,
} from 'lucide-react';
import Link from 'next/link';

type Tab = 'models' | 'inference' | 'performance' | 'offline';

export default function EdgeAIPage() {
  const [activeTab, setActiveTab] = useState<Tab>('models');
  const [privacyMode, setPrivacyMode] = useState(false);

  const {
    device,
    models,
    modelStatuses,
    metrics,
    history,
    loading,
    error,
    selectedModel,
    mode,
    loadProgress,
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
  } = useEdgeAI();

  useEffect(() => {
    detectDevice();
    fetchModels();
    fetchMetrics();
    fetchHistory();
  }, [detectDevice, fetchModels, fetchMetrics, fetchHistory]);

  useEffect(() => {
    if (activeTab === 'performance') {
      fetchMetrics();
      fetchHistory();
    }
  }, [activeTab, fetchMetrics, fetchHistory]);

  const tabs: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
    { id: 'models', label: 'Models', icon: <Cpu size={14} /> },
    { id: 'inference', label: 'Inference', icon: <MessageSquare size={14} /> },
    { id: 'performance', label: 'Performance', icon: <BarChart3 size={14} /> },
    { id: 'offline', label: 'Privacy', icon: <WifiOff size={14} /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/chat">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft size={16} />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold flex items-center gap-2">
                <Monitor size={18} className="text-cyan-500" />
                Edge AI Inference
              </h1>
              <p className="text-xs text-muted-foreground">
                Run AI models directly in your browser — no server needed
              </p>
            </div>
          </div>
          <Link href="/chat">
            <Button variant="outline" size="sm">
              <HelpCircle size={14} className="mr-1" />
              Help
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-destructive/10 border-b px-4 py-2 flex items-center justify-between">
          <span className="text-sm text-destructive">{error}</span>
          <button onClick={clearError} className="text-xs text-destructive hover:underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Tabs */}
            <div className="flex items-center gap-1 mb-4 border-b">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[500px]">
              {activeTab === 'models' && (
                <ModelSelector
                  models={models}
                  statuses={modelStatuses}
                  device={device}
                  selectedModel={selectedModel}
                  loadProgress={loadProgress}
                  loading={loading}
                  onSelect={setSelectedModel}
                  onLoad={loadModel}
                  onUnload={unloadModel}
                  isModelReady={isModelReady}
                />
              )}

              {activeTab === 'inference' && (
                <div className="h-[600px] border rounded-lg overflow-hidden">
                  <InferencePanel
                    loading={loading}
                    mode={mode}
                    selectedModel={selectedModel}
                    onRun={runInference}
                    onSetMode={setMode}
                    isModelReady={isModelReady}
                  />
                </div>
              )}

              {activeTab === 'performance' && (
                <PerformanceDashboard metrics={metrics} device={device} history={history} />
              )}

              {activeTab === 'offline' && (
                <OfflineToggle enabled={privacyMode} onToggle={setPrivacyMode} />
              )}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="w-full lg:w-72 shrink-0 space-y-3">
            {/* Quick Stats */}
            <div className="p-3 rounded-lg border bg-card">
              <h4 className="text-xs font-medium mb-2">Quick Info</h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">WebGPU</span>
                  <span className={device?.webgpuSupported ? 'text-emerald-600' : 'text-red-600'}>
                    {device?.webgpuSupported ? 'Supported' : 'Not Supported'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Device Tier</span>
                  <span className="font-medium capitalize">{device?.capability || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Inference Mode</span>
                  <span className="font-medium capitalize">{mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Models Loaded</span>
                  <span className="font-medium">
                    {modelStatuses.filter((s) => s.loaded).length}
                  </span>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="p-3 rounded-lg border bg-card">
              <h4 className="text-xs font-medium mb-2">How It Works</h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex gap-2">
                  <span className="text-cyan-500 font-bold">1</span>
                  <span>Detect your device GPU and capabilities</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-cyan-500 font-bold">2</span>
                  <span>Load a compatible model via WebGPU or ONNX</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-cyan-500 font-bold">3</span>
                  <span>Run inference locally in your browser</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-cyan-500 font-bold">4</span>
                  <span>Fallback to cloud for complex tasks</span>
                </div>
              </div>
            </div>

            {/* Privacy */}
            <div className="p-3 rounded-lg border bg-card">
              <h4 className="text-xs font-medium mb-2">Privacy</h4>
              <p className="text-xs text-muted-foreground">
                When running locally, your data never leaves your device. All inference happens
                directly in your browser using WebGPU or WebAssembly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
