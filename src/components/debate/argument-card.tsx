'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Argument, ArgumentPosition } from '@/types/debate';

const POSITION_COLORS: Record<ArgumentPosition, string> = {
  for: 'bg-green-100 text-green-800 border-green-200',
  against: 'bg-red-100 text-red-800 border-red-200',
  nuanced: 'bg-blue-100 text-blue-800 border-blue-200',
};

const POSITION_LABELS: Record<ArgumentPosition, string> = {
  for: 'FOR',
  against: 'AGAINST',
  nuanced: 'NUANCED',
};

const ROUND_LABELS: Record<string, string> = {
  opening: 'Opening Statement',
  rebuttal: 'Rebuttal',
  closing: 'Closing Statement',
};

interface ArgumentCardProps {
  argument: Argument;
}

export function ArgumentCard({ argument }: ArgumentCardProps) {
  return (
    <Card className="mb-3">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={POSITION_COLORS[argument.position]}>
              {POSITION_LABELS[argument.position]}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {ROUND_LABELS[argument.round] || argument.round}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Strength: {(argument.strength_score * 100).toFixed(0)}%</span>
            <span>Evidence: {argument.evidence_count}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm whitespace-pre-wrap leading-relaxed">{argument.content}</div>
        {argument.claims.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <span className="text-xs font-medium text-muted-foreground">
              {argument.claims.length} factual claim(s) identified
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ArgumentColumnProps {
  position: ArgumentPosition;
  arguments: Argument[];
}

export function ArgumentColumn({ position, arguments: args }: ArgumentColumnProps) {
  return (
    <div className="flex-1 min-w-0">
      <div className={`rounded-lg p-3 ${POSITION_COLORS[position]} border mb-3`}>
        <h3 className="font-semibold text-center">{POSITION_LABELS[position]} Position</h3>
      </div>
      <div className="space-y-3">
        {args.map((arg) => (
          <ArgumentCard key={arg.id} argument={arg} />
        ))}
      </div>
    </div>
  );
}
