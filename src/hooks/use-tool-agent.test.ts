import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToolAgent } from '../hooks/use-tool-agent';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useToolAgent', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('initializes with idle state', () => {
    const { result } = renderHook(() => useToolAgent());
    expect(result.current.status).toBe('idle');
    expect(result.current.steps).toEqual([]);
    expect(result.current.finalAnswer).toBe('');
    expect(result.current.error).toBeNull();
  });

  it('resets state correctly', () => {
    const { result } = renderHook(() => useToolAgent());
    act(() => {
      result.current.reset();
    });
    expect(result.current.status).toBe('idle');
    expect(result.current.steps).toEqual([]);
  });

  it('calculates progress correctly', () => {
    const { result } = renderHook(() => useToolAgent());
    expect(result.current.progress).toBe(0);
  });
});
