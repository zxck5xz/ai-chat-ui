'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';

interface EvalFiltersProps {
  models: string[];
  selectedModel: string;
  onModelChange: (model: string) => void;
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
}

export function EvalFilters({
  models,
  selectedModel,
  onModelChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: EvalFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          {/* Model Version */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Model Version</label>
            <select
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value)}
              className="flex h-10 w-48 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All models</option>
              {models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Start Date</label>
            <div className="flex">
              <input
                type="date"
                value={startDate ? startDate.toISOString().split('T')[0] : ''}
                onChange={(e) => onStartDateChange(e.target.value ? new Date(e.target.value) : undefined)}
                className="flex h-10 w-48 items-center rounded-l-md border border-r-0 border-input bg-background px-3 py-2 text-sm"
              />
              <Button variant="outline" className="rounded-l-none">
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">End Date</label>
            <div className="flex">
              <input
                type="date"
                value={endDate ? endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => onEndDateChange(e.target.value ? new Date(e.target.value) : undefined)}
                className="flex h-10 w-48 items-center rounded-l-md border border-r-0 border-input bg-background px-3 py-2 text-sm"
              />
              <Button variant="outline" className="rounded-l-none">
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">&nbsp;</label>
            <Button
              variant="outline"
              onClick={() => {
                onModelChange('all');
                onStartDateChange(undefined);
                onEndDateChange(undefined);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
