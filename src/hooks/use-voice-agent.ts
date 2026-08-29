'use client';

import { useState, useRef, useCallback } from 'react';
import type { TranscriptEntry, VoiceEvent, VoiceSession, VoiceSessionStatus } from '@/types/voice-agent';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-chat-api.ai-chat-api.workers.dev';

export function useVoiceAgent() {
  const [status, setStatus] = useState<VoiceSessionStatus>('completed');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [llmResponse, setLlmResponse] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<VoiceSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [totalLatencyMs, setTotalLatencyMs] = useState(0);
  const [sttLatencyMs, setSttLatencyMs] = useState(0);
  const [llmLatencyMs, setLlmLatencyMs] = useState(0);
  const [ttsLatencyMs, setTtsLatencyMs] = useState(0);

  const audioChunksRef = useRef<string[]>([]);
  const llmStartTimeRef = useRef(0);
  const ttsStartTimeRef = useRef(0);
  const recordingStartTimeRef = useRef(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioDataRef = useRef<Float32Array | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const audioElementsRef = useRef<HTMLAudioElement[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      source.connect(analyserRef.current);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          audioChunksRef.current = [base64];
        };
        reader.readAsDataURL(blob);

        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Collect data every 100ms

      recordingStartTimeRef.current = Date.now();
      setIsRecording(true);
      setStatus('listening');
      setError(null);
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access.');
      console.error('Recording error:', err);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      setStatus('processing');

      // Wait for audio data to be ready
      await new Promise((resolve) => setTimeout(resolve, 200));

      if (audioChunksRef.current.length === 0) {
        setError('No audio recorded');
        setIsProcessing(false);
        setStatus('completed');
        return;
      }

      const audioBase64 = audioChunksRef.current[0];
      audioChunksRef.current = [];
      await runPipeline(audioBase64);
    }
  }, [isRecording]);

  const playAudioChunk = (audioBase64: string, format: string) => {
    try {
      const binaryStr = atob(audioBase64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: format });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioElementsRef.current.push(audio);
      audio.play().catch(console.error);
      audio.onended = () => {
        URL.revokeObjectURL(url);
        audioElementsRef.current = audioElementsRef.current.filter((a) => a !== audio);
      };
    } catch (err) {
      console.error('Audio playback error:', err);
    }
  };

  const stopAllAudio = useCallback(() => {
    audioElementsRef.current.forEach((audio) => {
      audio.pause();
      audio.src = '';
    });
    audioElementsRef.current = [];
  }, []);

  const handleEvent = useCallback(
    (event: VoiceEvent, pipelineStartTime: number) => {
      switch (event.type) {
        case 'session_started':
          setCurrentSessionId(event.sessionId);
          break;

        case 'transcribing':
          setStatus('processing');
          break;

        case 'transcribed':
          setSttLatencyMs(Date.now() - pipelineStartTime);
          setCurrentText(event.text);
          break;

        case 'thinking':
          llmStartTimeRef.current = Date.now();
          break;

        case 'llm_chunk':
          setLlmResponse((prev) => prev + event.content);
          break;

        case 'llm_done':
          setLlmLatencyMs(Date.now() - llmStartTimeRef.current);
          setLlmResponse(event.content);
          break;

        case 'synthesizing':
          ttsStartTimeRef.current = Date.now();
          setStatus('speaking');
          break;

        case 'audio_chunk':
          playAudioChunk(event.audioBase64, event.format);
          break;

        case 'audio_done':
          setTtsLatencyMs(Date.now() - ttsStartTimeRef.current);
          break;

        case 'completed':
          setTranscript(event.transcript);
          setTotalLatencyMs(event.totalLatencyMs);
          setStatus('completed');
          setCurrentText('');
          setLlmResponse('');
          break;

        case 'error':
          setError(event.message);
          setStatus('failed');
          break;

        case 'interrupted':
          stopAllAudio();
          setStatus('completed');
          setCurrentText('');
          setLlmResponse('');
          break;
      }
    },
    [stopAllAudio]
  );

  const runPipeline = useCallback(
    async (audioBase64: string) => {
      const startTime = Date.now();
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(`${API_URL}/api/voice-agent/run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: abortControllerRef.current.signal,
          body: JSON.stringify({
            audioBase64,
            history: transcript.slice(-10),
          }),
        });

      if (!response.ok) {
        throw new Error(`Voice agent error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6).trim();
              if (jsonStr === '[DONE]') continue;

              const event: VoiceEvent = JSON.parse(jsonStr);
              handleEvent(event, startTime);
            } catch {
              // Skip malformed lines
            }
          }
        }
      }

      setIsProcessing(false);
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        // Interrupted - cleanup already handled by interrupt()
        return;
      }
      setError(err instanceof Error ? err.message : 'Pipeline failed');
      setStatus('failed');
      setIsProcessing(false);
    }
  }, [transcript]);

  const interrupt = useCallback(async () => {
    // Stop recording if active
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }

    // Abort the SSE fetch
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    // Stop all audio playback
    stopAllAudio();

    // Send interrupt signal to server
    if (currentSessionId) {
      try {
        await fetch(`${API_URL}/api/voice-agent/interrupt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: currentSessionId }),
        });
      } catch {
        // Ignore errors - server may already be processing the abort
      }
    }

    setStatus('completed');
    setCurrentText('');
    setLlmResponse('');
    setIsProcessing(false);
  }, [isRecording, currentSessionId, stopAllAudio]);

  const getAudioData = useCallback((): Float32Array | null => {
    if (analyserRef.current) {
      const data = new Float32Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getFloatTimeDomainData(data);
      audioDataRef.current = data;
      return data;
    }
    return null;
  }, []);

  const loadSessions = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/voice-agent/sessions?limit=20`);
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
  }, []);

  const loadSession = useCallback(async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/voice-agent/sessions/${id}`);
      const data = await response.json();
      if (data.session) {
        setTranscript(JSON.parse(data.session.transcript));
      }
    } catch (err) {
      console.error('Failed to load session:', err);
    }
  }, []);

  return {
    status,
    transcript,
    currentText,
    llmResponse,
    isRecording,
    isProcessing,
    error,
    sessions,
    currentSessionId,
    totalLatencyMs,
    sttLatencyMs,
    llmLatencyMs,
    ttsLatencyMs,
    startRecording,
    stopRecording,
    interrupt,
    getAudioData,
    loadSessions,
    loadSession,
    stopAllAudio,
  };
}
