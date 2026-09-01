'use client';

import { useState, useCallback, useRef } from 'react';
import type {
  OCRResult,
  TextReplacement,
  TextReplacementResult,
} from '@/types/image-text-replacement';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-chat-api.ai-chat-api.workers.dev';

export function useImageTextReplacement() {
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [replacementResult, setReplacementResult] = useState<TextReplacementResult | null>(null);
  const [selectedRegions, setSelectedRegions] = useState<Map<string, string>>(new Map());
  const [isDetecting, setIsDetecting] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const detectTextRegions = useCallback(async (imageBase64: string, mimeType: string) => {
    setIsDetecting(true);
    setError(null);
    setOcrResult(null);
    setReplacementResult(null);
    setSelectedRegions(new Map());

    try {
      const response = await fetch(`${API_URL}/api/image-text/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mimeType }),
      });

      if (!response.ok) throw new Error(`Detection failed: ${response.status}`);

      const data = await response.json();
      setOcrResult(data.result);
      return data.result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Detection failed';
      setError(message);
      throw err;
    } finally {
      setIsDetecting(false);
    }
  }, []);

  const selectRegion = useCallback((regionId: string, newText: string) => {
    setSelectedRegions((prev) => {
      const next = new Map(prev);
      if (newText === '') {
        next.delete(regionId);
      } else {
        next.set(regionId, newText);
      }
      return next;
    });
  }, []);

  const replaceText = useCallback(
    async (
      imageBase64: string,
      mimeType: string,
      style?: { fontSize?: string; fontFamily?: string; color?: string }
    ) => {
      if (!ocrResult || selectedRegions.size === 0) {
        setError('No regions selected for replacement');
        return;
      }

      setIsReplacing(true);
      setError(null);
      setReplacementResult(null);

      const replacements: TextReplacement[] = [];
      for (const [regionId, newText] of selectedRegions) {
        const region = ocrResult.regions.find((r) => r.id === regionId);
        if (region) {
          replacements.push({
            regionId,
            originalText: region.text,
            newText,
          });
        }
      }

      try {
        const response = await fetch(`${API_URL}/api/image-text/replace`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64, mimeType, replacements, style }),
        });

        if (!response.ok) throw new Error(`Replacement failed: ${response.status}`);

        const data = await response.json();
        setReplacementResult(data.result);
        return data.result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Replacement failed';
        setError(message);
        throw err;
      } finally {
        setIsReplacing(false);
      }
    },
    [ocrResult, selectedRegions]
  );

  const clearAll = useCallback(() => {
    setOcrResult(null);
    setReplacementResult(null);
    setSelectedRegions(new Map());
    setError(null);
  }, []);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setIsDetecting(false);
    setIsReplacing(false);
  }, []);

  return {
    ocrResult,
    replacementResult,
    selectedRegions,
    isDetecting,
    isReplacing,
    error,
    detectTextRegions,
    selectRegion,
    replaceText,
    clearAll,
    abort,
  };
}
