'use client';

import { useState } from 'react';
import type { MCPServerConnection } from '@/types/mcp';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trash2, ExternalLink, Wifi, WifiOff, AlertCircle } from 'lucide-react';

interface ServerListProps {
  servers: MCPServerConnection[];
  onRefresh: (serverId: string) => void;
  onDisconnect: (serverId: string) => void;
  loading?: boolean;
}

export function ServerList({ servers, onRefresh, onDisconnect, loading }: ServerListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const statusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-400" />;
    }
  };

  if (servers.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <WifiOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No MCP servers connected</p>
        <p className="text-sm mt-2">Connect to an external MCP server to use its tools</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {servers.map((server) => (
        <div
          key={server.id}
          className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {statusIcon(server.status)}
              <div>
                <h3 className="font-medium">{server.name}</h3>
                <p className="text-sm text-muted-foreground truncate max-w-[300px]">{server.url}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRefresh(server.id)}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDisconnect(server.id)}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>

          <button
            onClick={() => setExpandedId(expandedId === server.id ? null : server.id)}
            className="mt-2 text-sm text-muted-foreground hover:text-foreground"
          >
            {expandedId === server.id ? 'Hide details' : 'Show details'}
          </button>

          {expandedId === server.id && (
            <div className="mt-3 p-3 rounded bg-muted text-sm space-y-1">
              <p>
                <span className="font-medium">Status:</span>{' '}
                <span className={server.status === 'connected' ? 'text-green-500' : 'text-red-500'}>
                  {server.status}
                </span>
              </p>
              <p>
                <span className="font-medium">Protocol:</span> {server.protocolVersion}
              </p>
              {server.serverInfo && (
                <p>
                  <span className="font-medium">Server:</span> {server.serverInfo.name} v
                  {server.serverInfo.version}
                </p>
              )}
              {server.lastError && (
                <p className="text-red-500">
                  <span className="font-medium">Error:</span> {server.lastError}
                </p>
              )}
              {server.lastSeenAt && (
                <p>
                  <span className="font-medium">Last seen:</span>{' '}
                  {new Date(server.lastSeenAt).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
