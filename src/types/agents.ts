export type AgentType = 'planner' | 'designer' | 'coder' | 'reviewer';

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'awaiting_approval';

export interface AgentTask {
  id: string;
  agent: AgentType;
  status: TaskStatus;
  input: string;
  output: string;
  startedAt: string;
  completedAt?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface WorkflowRun {
  id: string;
  requestId: string;
  userInput: string;
  tasks: AgentTask[];
  status: 'running' | 'completed' | 'failed' | 'awaiting_approval';
  createdAt: string;
  completedAt?: string;
}

export interface WorkflowEvent {
  type: 'task_start' | 'task_complete' | 'task_error' | 'approval_needed' | 'workflow_complete' | 'workflow_result' | 'token';
  taskId?: string;
  agent?: AgentType;
  content?: string;
  error?: string;
  approvalId?: string;
  workflow?: WorkflowRun;
}

export interface DesignSpec {
  layout: string;
  colorPalette: string[];
  typography: string;
  components: string[];
  responsive: string;
}

export interface CodeResult {
  code: string;
  language: 'tsx' | 'html' | 'css';
  files: { name: string; content: string }[];
}

export interface ReviewResult {
  score: number;
  passed: boolean;
  issues: {
    severity: 'error' | 'warning' | 'info';
    category: string;
    message: string;
    line?: number;
  }[];
  suggestions: string[];
  accessibility: {
    score: number;
    issues: string[];
  };
  performance: {
    score: number;
    issues: string[];
  };
}
