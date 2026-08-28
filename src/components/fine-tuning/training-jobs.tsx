'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Play } from 'lucide-react';
import { useState } from 'react';
import type { TrainingJob } from '@/types/fine-tuning';

interface TrainingJobsProps {
  jobs: TrainingJob[];
  datasets: { id: string; name: string }[];
  loading: boolean;
  onStart: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onCreate: (input: {
    name: string;
    dataset_id: string;
    base_model: string;
    method: string;
  }) => Promise<string | null>;
  onSelect: (job: TrainingJob) => void;
  selectedId?: string;
}

function statusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'training':
      return 'bg-blue-100 text-blue-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'queued':
      return 'bg-yellow-100 text-yellow-800';
    case 'evaluating':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function TrainingJobs({
  jobs,
  datasets,
  loading,
  onStart,
  onDelete,
  onCreate,
  onSelect,
  selectedId,
}: TrainingJobsProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDataset, setNewDataset] = useState('');
  const [newModel, setNewModel] = useState('gemini-2.0-flash');
  const [newMethod, setNewMethod] = useState('lora');

  const handleCreate = async () => {
    if (!newName || !newDataset) return;
    await onCreate({
      name: newName,
      dataset_id: newDataset,
      base_model: newModel,
      method: newMethod,
    });
    setNewName('');
    setShowCreate(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Training Jobs ({jobs.length})</CardTitle>
        <Button size="sm" variant="outline" onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-3 w-3 mr-1" /> New Job
        </Button>
      </CardHeader>
      <CardContent>
        {showCreate && (
          <div className="p-3 border rounded-lg mb-3 space-y-2">
            <input
              className="w-full px-2 py-1 text-sm border rounded"
              placeholder="Job name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <select
              className="w-full px-2 py-1 text-sm border rounded"
              value={newDataset}
              onChange={(e) => setNewDataset(e.target.value)}
            >
              <option value="">Select dataset</option>
              {datasets.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <select
                className="px-2 py-1 text-sm border rounded flex-1"
                value={newModel}
                onChange={(e) => setNewModel(e.target.value)}
              >
                <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                <option value="gpt-4o-mini">gpt-4o-mini</option>
              </select>
              <select
                className="px-2 py-1 text-sm border rounded"
                value={newMethod}
                onChange={(e) => setNewMethod(e.target.value)}
              >
                <option value="lora">LoRA</option>
                <option value="qlora">QLoRA</option>
                <option value="full">Full</option>
              </select>
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
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No training jobs.</p>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {jobs.map((job) => {
              const progress =
                job.total_steps > 0 ? (job.completed_steps / job.total_steps) * 100 : 0;
              const hp = JSON.parse(job.hyperparameters || '{}');
              return (
                <div
                  key={job.id}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors ${selectedId === job.id ? 'border-primary bg-accent' : ''}`}
                  onClick={() => onSelect(job)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{job.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColor(job.status)}>{job.status}</Badge>
                      {job.status === 'queued' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onStart(job.id);
                          }}
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(job.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                    <span>{job.base_model}</span>
                    <Badge variant="outline" className="text-xs">
                      {job.method.toUpperCase()}
                    </Badge>
                    <span>
                      Epoch {job.epoch}/{job.total_epochs}
                    </span>
                    {job.current_loss != null && <span>Loss: {job.current_loss.toFixed(4)}</span>}
                  </div>
                  {job.status === 'training' && (
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {hp.learning_rate && (
                      <Badge variant="secondary" className="text-xs">
                        lr: {hp.learning_rate}
                      </Badge>
                    )}
                    {hp.batch_size && (
                      <Badge variant="secondary" className="text-xs">
                        bs: {hp.batch_size}
                      </Badge>
                    )}
                    {hp.lora_rank && (
                      <Badge variant="secondary" className="text-xs">
                        rank: {hp.lora_rank}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
