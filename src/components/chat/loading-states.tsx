'use client';

import type { LoadingState } from '@/types/chat';
import { Loader2 } from 'lucide-react';

interface LoadingStatesProps {
  state: LoadingState;
}

export function LoadingStates({ state }: LoadingStatesProps) {
  if (state.type === 'idle') return null;

  return (
    <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>
        {state.type === 'thinking' && 'Thinking...'}
        {state.type === 'streaming' && 'Generating response...'}
        {state.type === 'loading-sources' && 'Loading sources...'}
      </span>
    </div>
  );
}
