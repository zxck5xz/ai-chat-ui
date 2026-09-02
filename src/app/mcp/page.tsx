'use client';

import { useEffect, useState } from 'react';
import { useMCPServer, useMCPClient } from '@/hooks/use-mcp';
import { StatsCards } from '@/components/mcp/stats-cards';
import { ServerList } from '@/components/mcp/server-list';
import { ToolList } from '@/components/mcp/tool-list';
import { ConnectServerForm } from '@/components/mcp/connect-server-form';
import { CallLog } from '@/components/mcp/call-log';
import Link from 'next/link';
import { ArrowLeft, Server, Wrench, Activity } from 'lucide-react';

export default function MCPDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'servers' | 'tools' | 'log'>('overview');

  const {
    localTools,
    loading: serverLoading,
    fetchTools: fetchLocalTools,
    callTool,
  } = useMCPServer();

  const {
    servers,
    remoteTools,
    callLog,
    stats,
    loading: clientLoading,
    fetchServers,
    connectServer,
    disconnectServer,
    refreshTools,
    fetchRemoteTools,
    callRemoteTool,
    fetchCallLog,
    fetchStats,
  } = useMCPClient();

  const loading = serverLoading || clientLoading;

  useEffect(() => {
    fetchLocalTools();
    fetchServers();
    fetchRemoteTools();
    fetchStats();
    fetchCallLog();
  }, [fetchLocalTools, fetchServers, fetchRemoteTools, fetchStats, fetchCallLog]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'servers', label: 'Servers', icon: Server },
    { id: 'tools', label: 'Tools', icon: Wrench },
    { id: 'log', label: 'Call Log', icon: Activity },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/chat" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">MCP Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Model Context Protocol - Server & Client Management
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <StatsCards stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Connected Servers</h2>
                <ServerList
                  servers={servers}
                  onRefresh={refreshTools}
                  onDisconnect={disconnectServer}
                  loading={loading}
                />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-4">Recent Calls</h2>
                <CallLog log={callLog.slice(0, 5)} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'servers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">MCP Servers</h2>
              <ConnectServerForm onConnect={connectServer} loading={loading} />
            </div>
            <ServerList
              servers={servers}
              onRefresh={refreshTools}
              onDisconnect={disconnectServer}
              loading={loading}
            />
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Available Tools</h2>
            <ToolList
              localTools={localTools}
              remoteTools={remoteTools}
              onCallTool={callTool}
              onCallRemoteTool={callRemoteTool}
            />
          </div>
        )}

        {activeTab === 'log' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Call History</h2>
            <CallLog log={callLog} />
          </div>
        )}
      </div>
    </div>
  );
}
