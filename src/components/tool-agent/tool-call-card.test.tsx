import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ToolCallCard } from './tool-call-card';
import type { ToolCall } from '@/types/tool-agent';

const mockToolCall: ToolCall = {
  id: 'test-1',
  name: 'search_web',
  input: { query: 'iPhone 15 price' },
  output: 'iPhone 15 costs $799',
  status: 'completed',
  startedAt: '2026-08-28T10:00:00Z',
  completedAt: '2026-08-28T10:00:01Z',
};

describe('ToolCallCard', () => {
  it('renders tool name', () => {
    render(<ToolCallCard toolCall={mockToolCall} />);
    expect(screen.getByText('search_web')).toBeInTheDocument();
  });

  it('renders status', () => {
    render(<ToolCallCard toolCall={mockToolCall} />);
    expect(screen.getByText('completed')).toBeInTheDocument();
  });

  it('renders input', () => {
    render(<ToolCallCard toolCall={mockToolCall} />);
    expect(screen.getByText(/iPhone 15 price/)).toBeInTheDocument();
  });

  it('renders output when completed', () => {
    render(<ToolCallCard toolCall={mockToolCall} />);
    expect(screen.getByText(/iPhone 15 costs \$799/)).toBeInTheDocument();
  });

  it('renders error when failed', () => {
    const failedCall: ToolCall = {
      ...mockToolCall,
      status: 'failed',
      error: 'Tool not found',
    };
    render(<ToolCallCard toolCall={failedCall} />);
    expect(screen.getByText('Tool not found')).toBeInTheDocument();
  });

  it('renders running state', () => {
    const runningCall: ToolCall = {
      ...mockToolCall,
      status: 'running',
      output: '',
    };
    render(<ToolCallCard toolCall={runningCall} />);
    expect(screen.getByText('running')).toBeInTheDocument();
  });
});
