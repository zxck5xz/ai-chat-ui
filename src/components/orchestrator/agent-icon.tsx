import type { AgentType } from '@/types/agents';
import { Brain, Palette, Code2, ShieldCheck } from 'lucide-react';

interface AgentIconProps {
  agent: AgentType;
  className?: string;
  size?: number;
}

const agentConfig: Record<AgentType, { icon: typeof Brain; color: string; label: string }> = {
  planner: { icon: Brain, color: 'text-violet-500', label: 'Planner' },
  designer: { icon: Palette, color: 'text-pink-500', label: 'Designer' },
  coder: { icon: Code2, color: 'text-blue-500', label: 'Coder' },
  reviewer: { icon: ShieldCheck, color: 'text-green-500', label: 'Reviewer' },
};

export function AgentIcon({ agent, className, size = 20 }: AgentIconProps) {
  const config = agentConfig[agent];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Icon size={size} className={config.color} />
      <span className="text-sm font-medium">{config.label}</span>
    </div>
  );
}

export function getAgentColor(agent: AgentType): string {
  return agentConfig[agent].color;
}

export function getAgentLabel(agent: AgentType): string {
  return agentConfig[agent].label;
}
