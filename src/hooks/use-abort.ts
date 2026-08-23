'use client';

import { useCallback, useRef, useState } from 'react';
import type { ChatError } from '@/types/chat';
import { parseError } from '@/lib/errors';

export function useAbort() {
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isAborting, setIsAborting] = useState(false);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      setIsAborting(true);
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const createController = useCallback(() => {
    abortControllerRef.current = new AbortController();
    setIsAborting(false);
    return abortControllerRef.current;
  }, []);

  const handleError = useCallback((error: unknown): ChatError => {
    const parsed = parseError(error);
    if (parsed.type === 'abort') {
      setIsAborting(false);
    }
    return parsed;
  }, []);

  return { abort, createController, isAborting, handleError };
}
