'use client';

import { useState, useCallback } from 'react';
import type {
  MCPServerConnection,
  RemoteMCPTool,
  LocalMCPTool,
  MCPCallLog,
  MCPDashboardStats,
  MCPToolCallResponse,
} from '@/types/mcp';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// === MCP Server (Local Tools) ===

export function useMCPServer() {
  const [localTools, setLocalTools] = useState<LocalMCPTool[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTools = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/mcp/server/tools`);
      if (!res.ok) throw new Error('Failed to fetch tools');
      const data = await res.json();
      setLocalTools(data.tools || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const callTool = useCallback(
    async (name: string, args: Record<string, unknown>): Promise<MCPToolCallResponse | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/mcp/server/call`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, arguments: args }),
        });
        if (!res.ok) throw new Error('Tool call failed');
        return await res.json();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { localTools, loading, error, fetchTools, callTool };
}

// === MCP Client (Remote Servers) ===

export function useMCPClient() {
  const [servers, setServers] = useState<MCPServerConnection[]>([]);
  const [remoteTools, setRemoteTools] = useState<RemoteMCPTool[]>([]);
  const [callLog, setCallLog] = useState<MCPCallLog[]>([]);
  const [stats, setStats] = useState<MCPDashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/mcp/client/servers`);
      if (!res.ok) throw new Error('Failed to fetch servers');
      const data = await res.json();
      setServers(data.servers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const connectServer = useCallback(
    async (name: string, url: string, authToken: string): Promise<MCPServerConnection | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/mcp/client/servers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, url, authToken }),
        });
        if (!res.ok) throw new Error('Failed to connect');
        const data = await res.json();
        setServers((prev) => [data.server, ...prev]);
        return data.server;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const disconnectServer = useCallback(async (serverId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/mcp/client/servers/${serverId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to disconnect');
      setServers((prev) => prev.filter((s) => s.id !== serverId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshTools = useCallback(async (serverId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/mcp/client/servers/${serverId}/refresh`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to refresh tools');
      const data = await res.json();
      setRemoteTools((prev) => [
        ...prev.filter((t) => t.serverId !== serverId),
        ...(data.tools || []),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRemoteTools = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/mcp/client/tools`);
      if (!res.ok) throw new Error('Failed to fetch tools');
      const data = await res.json();
      setRemoteTools(data.tools || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const callRemoteTool = useCallback(
    async (
      serverId: string,
      toolName: string,
      args: Record<string, unknown>
    ): Promise<MCPToolCallResponse | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/mcp/client/call`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ serverId, toolName, arguments: args }),
        });
        if (!res.ok) throw new Error('Tool call failed');
        return await res.json();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchCallLog = useCallback(async (serverId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (serverId) params.set('serverId', serverId);
      const res = await fetch(`${API_BASE}/api/mcp/client/log?${params}`);
      if (!res.ok) throw new Error('Failed to fetch log');
      const data = await res.json();
      setCallLog(data.log || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/mcp/client/stats`);
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    servers,
    remoteTools,
    callLog,
    stats,
    loading,
    error,
    fetchServers,
    connectServer,
    disconnectServer,
    refreshTools,
    fetchRemoteTools,
    callRemoteTool,
    fetchCallLog,
    fetchStats,
  };
}
