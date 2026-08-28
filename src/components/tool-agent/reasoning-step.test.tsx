import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReasoningStep } from './reasoning-step';
import type { ToolAgentStep } from '@/types/tool-agent';

const mockStep: ToolAgentStep = {
  thought: 'I need to search for iPhone prices',
  toolCalls: [
    {
      id: 'tc-1',
      name: 'search_web',
      input: { query: 'iPhone 15 price' },
      output: 'iPhone 15 costs $799',
      status: 'completed',
      startedAt: '2026-08-28T10:00:00Z',
      completedAt: '2026-08-28T10:00:01Z',
    },
  ],
  result: '[search_web] iPhone 15 costs $799',
};

describe('ReasoningStep', () => {
  it('renders step number', () => {
    render(<ReasoningStep step={mockStep} stepIndex={0} isActive={false} />);
    expect(screen.getByText('Step 1')).toBeInTheDocument();
  });

  it('renders thought', () => {
    render(<ReasoningStep step={mockStep} stepIndex={0} isActive={false} />);
    expect(screen.getByText(/I need to search for iPhone prices/)).toBeInTheDocument();
  });

  it('renders tool call count', () => {
    render(<ReasoningStep step={mockStep} stepIndex={0} isActive={false} />);
    expect(screen.getByText('1 tool')).toBeInTheDocument();
  });

  it('renders tool name', () => {
    render(<ReasoningStep step={mockStep} stepIndex={0} isActive={false} />);
    expect(screen.getByText('search_web')).toBeInTheDocument();
  });

  it('renders result', () => {
    render(<ReasoningStep step={mockStep} stepIndex={0} isActive={false} />);
    expect(screen.getByText(/search_web.*iPhone 15 costs \$799/)).toBeInTheDocument();
  });

  it('shows active indicator when isActive', () => {
    render(<ReasoningStep step={mockStep} stepIndex={0} isActive={true} />);
    const indicator = document.querySelector('.animate-pulse');
    expect(indicator).toBeInTheDocument();
  });

  it('collapses on click', () => {
    render(<ReasoningStep step={mockStep} stepIndex={0} isActive={false} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.queryByText(/I need to search/)).not.toBeInTheDocument();
  });

  it('expands again on second click', () => {
    render(<ReasoningStep step={mockStep} stepIndex={0} isActive={false} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    fireEvent.click(button);
    expect(screen.getByText(/I need to search/)).toBeInTheDocument();
  });
});
