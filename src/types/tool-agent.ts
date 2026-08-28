export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
  output: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export interface ToolAgentStep {
  thought: string;
  toolCalls: ToolCall[];
  result?: string;
}

export interface ToolAgentRun {
  id: string;
  query: string;
  steps: ToolAgentStep[];
  finalAnswer: string;
  status: 'running' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  totalToolCalls: number;
}

export interface ToolAgentEvent {
  type:
    | 'step_start'
    | 'thinking'
    | 'tool_call'
    | 'tool_result'
    | 'step_complete'
    | 'final_answer'
    | 'run_complete'
    | 'error';
  stepIndex?: number;
  thought?: string;
  toolCall?: ToolCall;
  toolName?: string;
  toolInput?: Record<string, unknown>;
  toolOutput?: string;
  content?: string;
  error?: string;
  run?: ToolAgentRun;
}

export interface ToolInfo {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, { type: string; description?: string }>;
    required: string[];
  };
}
