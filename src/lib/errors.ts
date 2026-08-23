import type { ChatError } from '@/types/chat';

export function parseError(error: unknown): ChatError {
  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return { type: 'abort', message: 'Request cancelled', retryable: false };
    }
    if (error.message.includes('rate_limit')) {
      return { type: 'rate_limit', message: 'Rate limit exceeded. Please wait.', retryable: true };
    }
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return { type: 'network', message: 'Network error. Check connection.', retryable: true };
    }
    return { type: 'unknown', message: error.message, retryable: true };
  }
  return { type: 'unknown', message: 'An unexpected error occurred', retryable: true };
}
