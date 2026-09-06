export interface LangGraphPattern {
  id: string;
  name: string;
  description: string;
  agents: string[];
}

export interface LangGraphNode {
  nodeId: string;
  duration: number;
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stateUpdate?: Record<string, any>;
}

export interface LangGraphTrace {
  graphName: string;
  nodes: LangGraphNode[];
  totalDuration: number;
}

export interface LangGraphCost {
  totalUsd: number;
  byModel: Record<string, number>;
  byNode: Record<string, number>;
}

export interface LangGraphRun {
  threadId: string;
  pattern: string;
  task: string;
  status: 'completed' | 'error' | 'running';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: Record<string, any>;
  trace: LangGraphTrace;
  cost?: LangGraphCost;
  createdAt: number;
  completedAt?: number;
}

export interface ApprovalRequest {
  id: string;
  threadId: string;
  nodeId: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stateSnapshot: Record<string, any>;
  options?: string[];
  createdAt: number;
  status: 'pending' | 'approved' | 'rejected';
}
