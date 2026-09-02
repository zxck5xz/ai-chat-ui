'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';

interface CreateVersionFormProps {
  onCreate: (data: {
    name: string;
    version: string;
    provider: string;
    modelId: string;
    config?: Record<string, unknown>;
    notes?: string;
  }) => Promise<unknown>;
  loading?: boolean;
}

export function CreateVersionForm({ onCreate, loading }: CreateVersionFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [version, setVersion] = useState('');
  const [provider, setProvider] = useState<'gemini' | 'openai' | 'anthropic' | 'custom'>('gemini');
  const [modelId, setModelId] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !version || !modelId) return;
    await onCreate({ name, version, provider, modelId, notes });
    setName('');
    setVersion('');
    setModelId('');
    setNotes('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Create Version
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-lg border bg-card space-y-3">
      <h3 className="font-medium">Create Model Version</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Name</label>
          <input
            type="text"
            className="w-full mt-1 p-2 rounded border bg-background text-sm"
            placeholder="Production Model"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Version</label>
          <input
            type="text"
            className="w-full mt-1 p-2 rounded border bg-background text-sm"
            placeholder="1.0.0"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Provider</label>
          <select
            className="w-full mt-1 p-2 rounded border bg-background text-sm"
            value={provider}
            onChange={(e) => setProvider(e.target.value as typeof provider)}
          >
            <option value="gemini">Gemini</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Model ID</label>
          <input
            type="text"
            className="w-full mt-1 p-2 rounded border bg-background text-sm"
            placeholder="gemini-2.0-flash"
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            required
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Notes (optional)</label>
        <textarea
          className="w-full mt-1 p-2 rounded border bg-background text-sm"
          placeholder="Initial production deployment..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading || !name || !version || !modelId}>
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Create
        </Button>
        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
