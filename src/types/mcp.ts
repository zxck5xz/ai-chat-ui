// MCP Server Connection
export interface MCPServerConnection {
  id: string;
  name: string;
  url: string;
  protocolVersion: string;
  serverInfo?: {
    name: string;
    version: string;
  };
  status: 'connected' | 'error' | 'disconnected';
  lastError?: string;
  lastSeenAt?: string;
  createdAt: string;
}

// Remote MCP Tool
export interface RemoteMCPTool {
  id: string;
  serverId: string;
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, { type: string; description?: string; enum?: string[] }>;
    required?: string[];
  };
  cachedAt: string;
  serverName?: string;
}

// Local MCP Tool (exposed by our server)
export interface LocalMCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, { type: string; description?: string; enum?: string[] }>;
    required?: string[];
  };
}

// MCP Call Log
export interface MCPCallLog {
  id: string;
  serverId: string;
  toolName: string;
  argsJson: string;
  resultSummary?: string;
  latencyMs: number;
  status: 'ok' | 'error';
  errorMessage?: string;
  createdAt: string;
}

// MCP Dashboard Stats
export interface MCPDashboardStats {
  totalServers: number;
  connectedServers: number;
  totalTools: number;
  totalCalls: number;
  successRate: number;
  avgLatencyMs: number;
  callsByServer: { serverId: string; serverName: string; count: number }[];
  callsByTool: { toolName: string; count: number; avgLatencyMs: number }[];
}

// MCP Tool Call Request
export interface MCPToolCallRequest {
  name: string;
  arguments: Record<string, unknown>;
}

// MCP Tool Call Response
export interface MCPToolCallResponse {
  content: { type: string; text?: string; data?: string }[];
  isError?: boolean;
}

// Category type for grouping tools
export type MCPToolCategory =
  'search' | 'rag' | 'code-review' | 'multi-modal' | 'orchestrator' | 'utility';

// Tool with category info
export interface MCPToolWithCategory extends LocalMCPTool {
  category: MCPToolCategory;
}
