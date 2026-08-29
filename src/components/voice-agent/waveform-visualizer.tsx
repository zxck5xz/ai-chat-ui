'use client';

import { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  isRecording: boolean;
  isSpeaking: boolean;
  getAudioData: () => Float32Array | null;
  className?: string;
}

export function WaveformVisualizer({
  isRecording,
  isSpeaking,
  getAudioData,
  className = '',
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (isRecording || isSpeaking) {
        const data = getAudioData();
        if (data) {
          const sliceWidth = width / data.length;
          let x = 0;

          ctx.beginPath();

          for (let i = 0; i < data.length; i++) {
            const v = data[i];
            const y = (v * height) / 2 + height / 2;

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }

            x += sliceWidth;
          }

          ctx.lineTo(width, height / 2);

          const gradient = ctx.createLinearGradient(0, 0, width, 0);
          if (isRecording) {
            gradient.addColorStop(0, '#ef4444');
            gradient.addColorStop(1, '#dc2626');
          } else {
            gradient.addColorStop(0, '#22c55e');
            gradient.addColorStop(1, '#16a34a');
          }

          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      } else {
        // Idle state - flat line
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording, isSpeaking, getAudioData]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={600}
        height={120}
        className="w-full h-24 rounded-lg bg-gray-900"
      />
      {(isRecording || isSpeaking) && (
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <div
            className={`w-2 h-2 rounded-full ${
              isRecording ? 'bg-red-500 animate-pulse' : 'bg-green-500 animate-pulse'
            }`}
          />
          <span className="text-xs text-gray-400">
            {isRecording ? 'Recording...' : 'Speaking...'}
          </span>
        </div>
      )}
    </div>
  );
}
