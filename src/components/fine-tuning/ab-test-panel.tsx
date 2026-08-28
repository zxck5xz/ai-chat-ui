'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Square, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { ABTest } from '@/types/fine-tuning';

interface ABTestPanelProps {
  tests: ABTest[];
  loading: boolean;
  onCreate: (input: {
    name: string;
    base_model: string;
    variant_model: string;
    traffic_split: number;
  }) => Promise<unknown>;
  onStop: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function statusColor(status: string): string {
  switch (status) {
    case 'running':
      return 'bg-green-100 text-green-800';
    case 'stopped':
      return 'bg-yellow-100 text-yellow-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function ABTestPanel({ tests, loading, onCreate, onStop, onDelete }: ABTestPanelProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBase, setNewBase] = useState('gemini-2.0-flash');
  const [newVariant, setNewVariant] = useState('gemini-2.0-flash-ft');
  const [newSplit, setNewSplit] = useState(50);

  const handleCreate = async () => {
    if (!newName) return;
    await onCreate({
      name: newName,
      base_model: newBase,
      variant_model: newVariant,
      traffic_split: newSplit,
    });
    setNewName('');
    setShowCreate(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>A/B Tests ({tests.length})</CardTitle>
        <Button size="sm" variant="outline" onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-3 w-3 mr-1" /> New Test
        </Button>
      </CardHeader>
      <CardContent>
        {showCreate && (
          <div className="p-3 border rounded-lg mb-3 space-y-2">
            <input
              className="w-full px-2 py-1 text-sm border rounded"
              placeholder="Test name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <div className="flex gap-2">
              <input
                className="flex-1 px-2 py-1 text-sm border rounded"
                placeholder="Base model"
                value={newBase}
                onChange={(e) => setNewBase(e.target.value)}
              />
              <input
                className="flex-1 px-2 py-1 text-sm border rounded"
                placeholder="Variant model"
                value={newVariant}
                onChange={(e) => setNewVariant(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Traffic split:</span>
              <input
                type="range"
                min={10}
                max={90}
                value={newSplit}
                onChange={(e) => setNewSplit(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs font-medium w-12">
                {newSplit}% / {100 - newSplit}%
              </span>
            </div>
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
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : tests.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No A/B tests.</p>
        ) : (
          <div className="space-y-3">
            {tests.map((test) => (
              <div key={test.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{test.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColor(test.status)}>{test.status}</Badge>
                    {test.status === 'running' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => onStop(test.id)}
                      >
                        <Square className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-red-500"
                      onClick={() => onDelete(test.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Base: {test.base_model}</div>
                    <div>{test.base_requests} requests</div>
                    <div>Latency: {test.base_avg_latency.toFixed(0)}ms</div>
                    <div>Pass: {(test.base_pass_rate * 100).toFixed(1)}%</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Variant: {test.variant_model}</div>
                    <div>{test.variant_requests} requests</div>
                    <div>Latency: {test.variant_avg_latency.toFixed(0)}ms</div>
                    <div>Pass: {(test.variant_pass_rate * 100).toFixed(1)}%</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-l-full"
                      style={{ width: `${test.traffic_split}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {test.traffic_split}% / {100 - test.traffic_split}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
