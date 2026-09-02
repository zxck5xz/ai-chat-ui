'use client';

import { useState } from 'react';
import type { LocalMCPTool, RemoteMCPTool } from '@/types/mcp';
import { Button } from '@/components/ui/button';
import { Play, ChevronDown, ChevronUp } from 'lucide-react';

interface ToolListProps {
  localTools: LocalMCPTool[];
  remoteTools: (RemoteMCPTool & { serverName?: string })[];
  onCallTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  onCallRemoteTool?: (
    serverId: string,
    toolName: string,
    args: Record<string, unknown>
  ) => Promise<unknown>;
}

export function ToolList({ localTools, remoteTools, onCallTool, onCallRemoteTool }: ToolListProps) {
  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  const [toolArgs, setToolArgs] = useState<Record<string, string>>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [callResult, setCallResult] = useState<any>(null);
  const [calling, setCalling] = useState(false);

  const handleCall = async (tool: LocalMCPTool | RemoteMCPTool, isRemote: boolean) => {
    setCalling(true);
    setCallResult(null);
    try {
      const args: Record<string, unknown> = {};
      const schema = tool.inputSchema;
      if (schema.properties) {
        for (const [key, prop] of Object.entries(schema.properties)) {
          const val = toolArgs[`${tool.name}_${key}`];
          if (val !== undefined && val !== '') {
            if (prop.type === 'number') args[key] = Number(val);
            else if (prop.type === 'boolean') args[key] = val === 'true';
            else args[key] = val;
          }
        }
      }

      let result;
      if (isRemote && 'serverId' in tool && onCallRemoteTool) {
        result = await onCallRemoteTool(tool.serverId, tool.name, args);
      } else {
        result = await onCallTool(tool.name, args);
      }
      setCallResult(result);
    } finally {
      setCalling(false);
    }
  };

  const groupedLocal = localTools.reduce(
    (acc, tool) => {
      // Group by first word of description or name prefix
      const group = tool.name.split('_')[0] || 'other';
      if (!acc[group]) acc[group] = [];
      acc[group].push(tool);
      return acc;
    },
    {} as Record<string, LocalMCPTool[]>
  );

  const groupedRemote = remoteTools.reduce(
    (acc, tool) => {
      const group = tool.serverName || 'Unknown Server';
      if (!acc[group]) acc[group] = [];
      acc[group].push(tool);
      return acc;
    },
    {} as Record<string, RemoteMCPTool[]>
  );

  const renderTool = (tool: LocalMCPTool | RemoteMCPTool, isRemote: boolean): React.ReactNode => {
    const isExpanded = expandedTool === tool.name;
    const schema = tool.inputSchema;
    const requiredFields = schema.required || [];
    const properties = schema.properties || {};

    return (
      <div key={tool.name} className="p-3 rounded-lg border bg-card">
        <button
          onClick={() => setExpandedTool(isExpanded ? null : tool.name)}
          className="w-full flex items-center justify-between text-left"
        >
          <div>
            <h4 className="font-mono text-sm font-medium">{tool.name}</h4>
            <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0" />
          )}
        </button>

        {isExpanded && (
          <div className="mt-3 space-y-3">
            {Object.keys(properties).length > 0 && (
              <div className="space-y-2">
                {Object.entries(properties).map(([key, prop]) => (
                  <div key={key}>
                    <label className="text-xs font-medium">
                      {key}
                      {requiredFields.includes(key) && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                      {prop.description && (
                        <span className="text-muted-foreground ml-1">- {prop.description}</span>
                      )}
                    </label>
                    {prop.enum ? (
                      <select
                        className="w-full mt-1 p-2 rounded border bg-background text-sm"
                        value={toolArgs[`${tool.name}_${key}`] || ''}
                        onChange={(e) =>
                          setToolArgs((prev) => ({
                            ...prev,
                            [`${tool.name}_${key}`]: e.target.value,
                          }))
                        }
                      >
                        <option value="">Select...</option>
                        {prop.enum.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={prop.type === 'number' ? 'number' : 'text'}
                        className="w-full mt-1 p-2 rounded border bg-background text-sm"
                        placeholder={prop.type === 'number' ? '0' : `Enter ${key}...`}
                        value={toolArgs[`${tool.name}_${key}`] || ''}
                        onChange={(e) =>
                          setToolArgs((prev) => ({
                            ...prev,
                            [`${tool.name}_${key}`]: e.target.value,
                          }))
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            <Button size="sm" onClick={() => handleCall(tool, isRemote)} disabled={calling}>
              <Play className="h-3 w-3 mr-1" />
              {calling ? 'Calling...' : 'Call Tool'}
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Local Tools */}
      {Object.entries(groupedLocal).map(([group, tools]) => (
        <div key={group}>
          <h3 className="text-sm font-medium mb-3 capitalize">{group} Tools</h3>
          <div className="space-y-2">{tools.map((t) => renderTool(t, false))}</div>
        </div>
      ))}

      {/* Remote Tools */}
      {Object.entries(groupedRemote).map(([serverName, tools]: [string, RemoteMCPTool[]]) => (
        <div key={`remote-${serverName}`}>
          <h3 className="text-sm font-medium mb-3">
            {serverName}
            <span className="ml-2 text-xs text-muted-foreground">(remote)</span>
          </h3>
          <div className="space-y-2">{tools.map((t) => renderTool(t, true))}</div>
        </div>
      ))}

      {/* Result Display */}
      {callResult && (
        <div className="p-4 rounded-lg border bg-muted">
          <h4 className="text-sm font-medium mb-2">Result</h4>
          <pre className="text-xs overflow-auto max-h-[400px]">
            {JSON.stringify(callResult, null, 2)}
          </pre>
        </div>
      )}

      {localTools.length === 0 && remoteTools.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          <p>No tools available</p>
          <p className="text-sm mt-2">Connect to an MCP server or check server configuration</p>
        </div>
      )}
    </div>
  );
}
