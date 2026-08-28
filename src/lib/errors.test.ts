import { describe, it, expect } from 'vitest';
import { parseError } from '../lib/errors';

describe('parseError', () => {
  it('parses AbortError', () => {
    const error = new Error('The operation was aborted');
    error.name = 'AbortError';
    const result = parseError(error);
    expect(result.type).toBe('abort');
    expect(result.retryable).toBe(false);
  });

  it('parses rate limit error', () => {
    const error = new Error('rate_limit exceeded');
    const result = parseError(error);
    expect(result.type).toBe('rate_limit');
    expect(result.retryable).toBe(true);
  });

  it('parses network error', () => {
    const error = new Error('network error occurred');
    const result = parseError(error);
    expect(result.type).toBe('network');
    expect(result.retryable).toBe(true);
  });

  it('parses fetch error', () => {
    const error = new Error('fetch failed');
    const result = parseError(error);
    expect(result.type).toBe('network');
    expect(result.retryable).toBe(true);
  });

  it('parses unknown error', () => {
    const error = new Error('something went wrong');
    const result = parseError(error);
    expect(result.type).toBe('unknown');
    expect(result.retryable).toBe(true);
  });

  it('handles non-Error values', () => {
    const result = parseError('string error');
    expect(result.type).toBe('unknown');
    expect(result.retryable).toBe(true);
  });

  it('handles null/undefined', () => {
    const result = parseError(null);
    expect(result.type).toBe('unknown');
    expect(result.retryable).toBe(true);
  });
});
