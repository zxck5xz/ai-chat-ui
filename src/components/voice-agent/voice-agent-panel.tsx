'use client';

import { useEffect } from 'react';
import { useVoiceAgent } from '@/hooks/use-voice-agent';
import { WaveformVisualizer } from './waveform-visualizer';
import { TranscriptDisplay } from './transcript-display';
import { VoiceControls } from './voice-controls';
import { Card } from '@/components/ui/card';
import { Mic, Activity, Clock, Zap } from 'lucide-react';

export function VoiceAgentPanel() {
  const {
    status,
    transcript,
    currentText,
    llmResponse,
    isRecording,
    isProcessing,
    error,
    totalLatencyMs,
    sttLatencyMs,
    llmLatencyMs,
    ttsLatencyMs,
    startRecording,
    stopRecording,
    interrupt,
    getAudioData,
  } = useVoiceAgent();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-cyan-500/10">
            <Mic className="w-6 h-6 text-cyan-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Voice AI Agent</h1>
            <p className="text-sm text-muted-foreground">
              Real-time voice conversation with AI
            </p>
          </div>
        </div>

        {/* Status Bar */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Status:</span>
                <span
                  className={`text-sm font-medium ${
                    status === 'completed'
                      ? 'text-green-500'
                      : status === 'failed'
                      ? 'text-red-500'
                      : 'text-cyan-500'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>

              {totalLatencyMs > 0 && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Total:</span>
                  <span className="text-sm font-medium">
                    {totalLatencyMs.toFixed(0)}ms
                  </span>
                </div>
              )}
            </div>

            {error && (
              <div className="text-sm text-red-500">{error}</div>
            )}
          </div>

          {/* Latency Breakdown */}
          {totalLatencyMs > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">STT</p>
                <p className="text-sm font-medium">{sttLatencyMs.toFixed(0)}ms</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">LLM</p>
                <p className="text-sm font-medium">{llmLatencyMs.toFixed(0)}ms</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">TTS</p>
                <p className="text-sm font-medium">{ttsLatencyMs.toFixed(0)}ms</p>
              </div>
            </div>
          )}
        </Card>

        {/* Waveform */}
        <Card className="p-4 mb-6">
          <WaveformVisualizer
            isRecording={isRecording}
            isSpeaking={status === 'speaking'}
            getAudioData={getAudioData}
          />
        </Card>

        {/* Transcript */}
        <Card className="mb-6">
          <TranscriptDisplay
            transcript={transcript}
            currentText={currentText}
            llmResponse={llmResponse}
          />
        </Card>

        {/* Controls */}
        <div className="flex justify-center">
          <VoiceControls
            status={status}
            isRecording={isRecording}
            isProcessing={isProcessing}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onInterrupt={interrupt}
          />
        </div>
      </div>
    </div>
  );
}
