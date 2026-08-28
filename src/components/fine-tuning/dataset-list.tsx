'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import type { Dataset } from '@/types/fine-tuning';

interface DatasetListProps {
  datasets: Dataset[];
  loading: boolean;
  onSelect: (ds: Dataset) => void;
  onValidate: (id: string) => Promise<unknown>;
  onDelete: (id: string) => Promise<void>;
  onCreate: (input: {
    name: string;
    description: string;
    source: string;
    format: string;
  }) => Promise<unknown>;
  selectedId?: string;
}

function statusColor(status: string): string {
  switch (status) {
    case 'ready':
      return 'bg-green-100 text-green-800';
    case 'draft':
      return 'bg-yellow-100 text-yellow-800';
    case 'validating':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function DatasetList({
  datasets,
  loading,
  onSelect,
  onValidate,
  onDelete,
  onCreate,
  selectedId,
}: DatasetListProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newFormat, setNewFormat] = useState('instruction');

  const handleCreate = async () => {
    if (!newName) return;
    await onCreate({ name: newName, description: newDesc, source: 'manual', format: newFormat });
    setNewName('');
    setNewDesc('');
    setShowCreate(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Datasets ({datasets.length})</CardTitle>
        <Button size="sm" variant="outline" onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-3 w-3 mr-1" /> New
        </Button>
      </CardHeader>
      <CardContent>
        {showCreate && (
          <div className="p-3 border rounded-lg mb-3 space-y-2">
            <input
              className="w-full px-2 py-1 text-sm border rounded"
              placeholder="Dataset name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <input
              className="w-full px-2 py-1 text-sm border rounded"
              placeholder="Description"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
            <select
              className="px-2 py-1 text-sm border rounded"
              value={newFormat}
              onChange={(e) => setNewFormat(e.target.value)}
            >
              <option value="instruction">Instruction</option>
              <option value="chat">Chat</option>
              <option value="completion">Completion</option>
            </select>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreate}>
                Create
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : datasets.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No datasets yet.</p>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {datasets.map((ds) => (
              <div
                key={ds.id}
                className={`p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors ${selectedId === ds.id ? 'border-primary bg-accent' : ''}`}
                onClick={() => onSelect(ds)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{ds.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColor(ds.status)}>{ds.status}</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onValidate(ds.id);
                      }}
                    >
                      <CheckCircle className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(ds.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{ds.total_entries} entries</span>
                  <span>{ds.valid_entries} valid</span>
                  <span>{ds.format}</span>
                  <Badge variant="outline" className="text-xs">
                    {ds.source}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
