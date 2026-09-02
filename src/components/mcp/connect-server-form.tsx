'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';

interface ConnectServerFormProps {
  onConnect: (name: string, url: string, authToken: string) => Promise<unknown>;
  loading?: boolean;
}

export function ConnectServerForm({ onConnect, loading }: ConnectServerFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [authToken, setAuthToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url) return;
    await onConnect(name, url, authToken);
    setName('');
    setUrl('');
    setAuthToken('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Connect MCP Server
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-lg border bg-card space-y-3">
      <h3 className="font-medium">Connect to MCP Server</h3>
      <div>
        <label className="text-sm font-medium">Name</label>
        <input
          type="text"
          className="w-full mt-1 p-2 rounded border bg-background text-sm"
          placeholder="My MCP Server"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium">Server URL</label>
        <input
          type="url"
          className="w-full mt-1 p-2 rounded border bg-background text-sm"
          placeholder="https://mcp.example.com/sse"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium">Auth Token (optional)</label>
        <input
          type="password"
          className="w-full mt-1 p-2 rounded border bg-background text-sm"
          placeholder="Bearer token or API key"
          value={authToken}
          onChange={(e) => setAuthToken(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading || !name || !url}>
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Connect
        </Button>
        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
