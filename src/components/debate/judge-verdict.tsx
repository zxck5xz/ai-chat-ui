'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { JudgeVerdict, ArgumentPosition } from '@/types/debate';

const POSITION_COLORS: Record<ArgumentPosition, string> = {
  for: 'bg-green-100 text-green-800',
  against: 'bg-red-100 text-red-800',
  nuanced: 'bg-blue-100 text-blue-800',
};

interface JudgeVerdictProps {
  verdict: JudgeVerdict;
}

export function JudgeVerdictPanel({ verdict }: JudgeVerdictProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Judge&apos;s Verdict</span>
          <Badge className={POSITION_COLORS[verdict.winner]}>
            Winner: {verdict.winner.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Reasoning</h4>
          <p className="text-sm whitespace-pre-wrap">{verdict.reasoning}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Scores</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {verdict.scores.map((score) => (
              <div
                key={score.position}
                className={`rounded-lg p-3 border ${
                  score.position === verdict.winner ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge className={POSITION_COLORS[score.position]}>
                    {score.position.toUpperCase()}
                  </Badge>
                  <span className="text-lg font-bold">{score.overall.toFixed(1)}</span>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Argumentation</span>
                    <span>{score.argumentation.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Evidence</span>
                    <span>{score.evidence.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Persuasiveness</span>
                    <span>{score.persuasiveness.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rebuttal</span>
                    <span>{score.rebuttal_effectiveness.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
