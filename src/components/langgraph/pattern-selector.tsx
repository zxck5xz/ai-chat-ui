'use client';

import type { LangGraphPattern } from '@/types/langgraph';
import { GitBranch, Users, Layers, Workflow, Shield, Zap } from 'lucide-react';

const patternIcons: Record<string, React.ReactNode> = {
  supervisor: <Users size={20} />,
  'supervisor-code': <GitBranch size={20} />,
  swarm: <Zap size={20} />,
  'swarm-code': <Zap size={20} />,
  hierarchical: <Layers size={20} />,
  'hierarchical-review': <Shield size={20} />,
};

interface Props {
  patterns: LangGraphPattern[];
  selected: string;
  onSelect: (id: string) => void;
}

export function PatternSelector({ patterns, selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {patterns.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p.id)}
          className={`p-4 rounded-lg border text-left transition-all ${
            selected === p.id
              ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
              : 'border-border hover:border-primary/50 hover:bg-muted/50'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className={selected === p.id ? 'text-primary' : 'text-muted-foreground'}>
              {patternIcons[p.id] || <Workflow size={20} />}
            </span>
            <span className="font-medium text-sm">{p.name}</span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {p.agents.map((a) => (
              <span
                key={a}
                className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
              >
                {a}
              </span>
            ))}
          </div>
        </button>
      ))}
    </div>
  );
}
