'use client';

import { Button } from '@/components/ui/button';
import { Mic, Square, RotateCcw, Loader2 } from 'lucide-react';
import type { VoiceSessionStatus } from '@/types/voice-agent';

interface VoiceControlsProps {
  status: VoiceSessionStatus;
  isRecording: boolean;
  isProcessing: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onInterrupt: () => void;
}

export function VoiceControls({
  status,
  isRecording,
  isProcessing,
  onStartRecording,
  onStopRecording,
  onInterrupt,
}: VoiceControlsProps) {
  const isIdle = status === 'completed' || status === 'failed' || status === 'interrupted';
  const isBusy = isRecording || isProcessing || status === 'listening' || status === 'processing' || status === 'speaking';

  return (
    <div className="flex items-center justify-center gap-4">
      {isIdle ? (
        <Button
          onClick={onStartRecording}
          className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30 transition-all duration-200 hover:scale-105"
        >
          <Mic size={32} className="text-white" />
        </Button>
      ) : (
        <div className="flex items-center gap-3">
          <Button
            onClick={onInterrupt}
            variant="outline"
            className="w-14 h-14 rounded-full border-gray-600 hover:bg-gray-800"
          >
            <RotateCcw size={24} className="text-gray-400" />
          </Button>

          {isRecording ? (
            <Button
              onClick={onStopRecording}
              className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30 animate-pulse"
            >
              <Square size={28} className="text-white" />
            </Button>
          ) : isProcessing ? (
            <Button
              disabled
              className="w-20 h-20 rounded-full bg-gray-700"
            >
              <Loader2 size={28} className="text-white animate-spin" />
            </Button>
          ) : (
            <Button
              onClick={onStopRecording}
              className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30"
            >
              <Mic size={32} className="text-white" />
            </Button>
          )}
        </div>
      )}

      <div className="absolute bottom-4 left-0 right-0 text-center">
        {isRecording && (
          <p className="text-red-400 text-sm animate-pulse">
            Listening... Tap to stop
          </p>
        )}
        {status === 'processing' && (
          <p className="text-yellow-400 text-sm">
            Processing your voice...
          </p>
        )}
        {status === 'speaking' && (
          <p className="text-green-400 text-sm animate-pulse">
            Speaking... Tap to interrupt
          </p>
        )}
      </div>
    </div>
  );
}
