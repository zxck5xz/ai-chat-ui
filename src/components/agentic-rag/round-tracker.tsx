'use client';

import type { RetrievalRound } from '@/types/agentic-rag';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp } from 'lucide-react';

export function RoundTracker({ rounds }: { rounds: RetrievalRound[] }) {
  if (rounds.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Search size={16} className="text-blue-500" />
          Retrieval Rounds
          <Badge variant="outline" className="ml-auto text-xs">{rounds.length} rounds</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rounds.map((round) => (
            <div key={round.roundNumber} className="p-3 rounded-lg border bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center text-xs font-bold">
                    {round.roundNumber}
                  </span>
                  <span className="text-sm font-medium">Round {round.roundNumber}</span>
                </div>
                <Badge variant="outline" className="text-xs">{round.strategy}</Badge>
              </div>

              <p className="text-xs text-muted-foreground mb-2 truncate">{round.query}</p>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Chunks</span>
                  <p className="font-medium">{round.chunksRetrieved}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Avg Score</span>
                  <p className="font-medium">{round.avgRelevanceScore.toFixed(3)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Top Score</span>
                  <p className="font-medium flex items-center gap-1">
                    {round.topScore.toFixed(3)}
                    {round.roundNumber > 1 && round.topScore > rounds[0].topScore && (
                      <TrendingUp size={10} className="text-green-500" />
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-2 text-xs text-muted-foreground">
                Latency: {round.latencyMs}ms
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
