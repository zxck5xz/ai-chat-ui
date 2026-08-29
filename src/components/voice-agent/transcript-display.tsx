'use client';

import type { TranscriptEntry } from '@/types/voice-agent';

interface TranscriptDisplayProps {
  transcript: TranscriptEntry[];
  currentText?: string;
  llmResponse?: string;
  className?: string;
}

export function TranscriptDisplay({
  transcript,
  currentText,
  llmResponse,
  className = '',
}: TranscriptDisplayProps) {
  return (
    <div className={`space-y-4 max-h-[400px] overflow-y-auto p-4 ${className}`}>
      {transcript.length === 0 && !currentText && !llmResponse && (
        <div className="text-center text-gray-500 py-8">
          <p className="text-lg">Press the microphone to start a conversation</p>
          <p className="text-sm mt-2">Speak naturally - the AI will respond with voice</p>
        </div>
      )}

      {transcript.map((entry) => (
        <div
          key={entry.id}
          className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              entry.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-100'
            }`}
          >
            <p className="text-sm">{entry.content}</p>
            {entry.latencyMs && (
              <p className="text-xs opacity-60 mt-1">
                {entry.latencyMs.toFixed(0)}ms
              </p>
            )}
          </div>
        </div>
      ))}

      {currentText && (
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-blue-600/50 text-white/80">
            <p className="text-sm">{currentText}...</p>
          </div>
        </div>
      )}

      {llmResponse && (
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-800/50 text-gray-100/80">
            <p className="text-sm">{llmResponse}</p>
          </div>
        </div>
      )}
    </div>
  );
}
