'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ConsensusResult } from '@/types/debate';

interface ConsensusPanelProps {
  consensus: ConsensusResult;
}

export function ConsensusPanel({ consensus }: ConsensusPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Consensus Synthesis</span>
          <span className="text-sm font-normal text-muted-foreground">
            Confidence: {(consensus.confidence * 100).toFixed(0)}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Synthesis</h4>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{consensus.synthesis}</p>
        </div>

        {consensus.key_points.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Key Points</h4>
            <ul className="list-disc list-inside space-y-1">
              {consensus.key_points.map((point, i) => (
                <li key={i} className="text-sm">
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {consensus.areas_of_agreement.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-green-600 mb-2">Areas of Agreement</h4>
              <ul className="list-disc list-inside space-y-1">
                {consensus.areas_of_agreement.map((area, i) => (
                  <li key={i} className="text-sm">
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {consensus.areas_of_disagreement.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-red-600 mb-2">Areas of Disagreement</h4>
              <ul className="list-disc list-inside space-y-1">
                {consensus.areas_of_disagreement.map((area, i) => (
                  <li key={i} className="text-sm">
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
