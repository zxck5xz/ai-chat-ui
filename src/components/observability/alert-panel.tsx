'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Plus, X } from 'lucide-react';
import { useState } from 'react';
import type { AlertRule, AlertEvent } from '@/types/observability';

interface AlertPanelProps {
  rules: AlertRule[];
  events: AlertEvent[];
  onToggle: (id: string) => void;
  onCreate: (rule: {
    name: string;
    metric: string;
    condition: 'gt' | 'lt' | 'eq';
    threshold: number;
  }) => Promise<void>;
  onAcknowledge: (id: string) => void;
}

export function AlertPanel({ rules, events, onToggle, onCreate, onAcknowledge }: AlertPanelProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [newRule, setNewRule] = useState<{
    name: string;
    metric: string;
    condition: 'gt' | 'lt' | 'eq';
    threshold: number;
  }>({ name: '', metric: 'latency_ms', condition: 'gt', threshold: 5000 });

  const handleCreate = async () => {
    if (!newRule.name) return;
    await onCreate(newRule);
    setNewRule({ name: '', metric: 'latency_ms', condition: 'gt', threshold: 5000 });
    setShowCreate(false);
  };

  const unacknowledged = events.filter((e) => !e.acknowledged);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Alert Rules ({rules.length})
          </CardTitle>
          <Button size="sm" variant="outline" onClick={() => setShowCreate(!showCreate)}>
            <Plus className="h-3 w-3 mr-1" />
            Add Rule
          </Button>
        </CardHeader>
        <CardContent>
          {showCreate && (
            <div className="p-3 border rounded-lg mb-3 space-y-2">
              <input
                className="w-full px-2 py-1 text-sm border rounded"
                placeholder="Rule name"
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
              />
              <div className="flex gap-2">
                <select
                  className="px-2 py-1 text-sm border rounded"
                  value={newRule.metric}
                  onChange={(e) => setNewRule({ ...newRule, metric: e.target.value })}
                >
                  <option value="latency_ms">Latency (ms)</option>
                  <option value="cost_usd">Cost ($)</option>
                  <option value="error_rate">Error Rate (%)</option>
                  <option value="tokens">Tokens</option>
                </select>
                <select
                  className="px-2 py-1 text-sm border rounded"
                  value={newRule.condition}
                  onChange={(e) =>
                    setNewRule({ ...newRule, condition: e.target.value as 'gt' | 'lt' | 'eq' })
                  }
                >
                  <option value="gt">Greater than</option>
                  <option value="lt">Less than</option>
                  <option value="eq">Equals</option>
                </select>
                <input
                  type="number"
                  className="w-24 px-2 py-1 text-sm border rounded"
                  value={newRule.threshold}
                  onChange={(e) => setNewRule({ ...newRule, threshold: Number(e.target.value) })}
                />
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

          {rules.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No alert rules configured.
            </p>
          ) : (
            <div className="space-y-2">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-2 border rounded-lg"
                >
                  <div className="text-sm">
                    <span className="font-medium">{rule.name}</span>
                    <span className="text-muted-foreground ml-2">
                      {rule.metric}{' '}
                      {rule.condition === 'gt' ? '>' : rule.condition === 'lt' ? '<' : '='}{' '}
                      {rule.threshold}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant={rule.enabled ? 'default' : 'ghost'}
                    onClick={() => onToggle(rule.id)}
                  >
                    {rule.enabled ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts ({unacknowledged.length} active)</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No alerts triggered.</p>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {events.map((event) => (
                <div
                  key={event.id}
                  className={`flex items-center justify-between p-2 border rounded-lg ${
                    event.acknowledged ? 'opacity-50' : ''
                  }`}
                >
                  <div className="text-sm">
                    <Badge
                      variant={event.acknowledged ? 'secondary' : 'destructive'}
                      className="mr-2"
                    >
                      {event.acknowledged ? 'acked' : 'active'}
                    </Badge>
                    <span className="font-medium">{event.rule_name}</span>
                    <span className="text-muted-foreground ml-2">
                      actual: {event.actual_value} (threshold: {event.threshold})
                    </span>
                  </div>
                  {!event.acknowledged && (
                    <Button size="sm" variant="ghost" onClick={() => onAcknowledge(event.id)}>
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
