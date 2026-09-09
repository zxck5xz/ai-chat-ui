'use client';

import { useRef, useEffect, useState } from 'react';
import type { KnowledgeGraphNode, KnowledgeGraphEdge } from '../../types/memory';

interface GraphViewProps {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  onNodeClick?: (node: KnowledgeGraphNode) => void;
}

interface LayoutNode {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  strength: number;
}

export function GraphView({ nodes, edges, onNodeClick }: GraphViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [layoutNodes, setLayoutNodes] = useState<LayoutNode[]>([]);
  const [hoveredNode, setHoveredNode] = useState<LayoutNode | null>(null);

  useEffect(() => {
    if (nodes.length === 0) return;

    const typeColors: Record<string, string> = {
      topic: '#6366f1',
      episode: '#10b981',
      concept: '#f59e0b',
      entity: '#ef4444',
      default: '#6b7280',
    };

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Simple force-directed layout
    const layout: LayoutNode[] = nodes.map((n, i) => ({
      id: n.id,
      name: n.name,
      type: n.type,
      x: width / 2 + Math.cos((2 * Math.PI * i) / nodes.length) * Math.min(width, height) * 0.35,
      y: height / 2 + Math.sin((2 * Math.PI * i) / nodes.length) * Math.min(width, height) * 0.35,
      strength: n.strength,
    }));

    // Run a few iterations of force simulation
    for (let iter = 0; iter < 50; iter++) {
      for (let i = 0; i < layout.length; i++) {
        for (let j = i + 1; j < layout.length; j++) {
          const dx = layout[j].x - layout[i].x;
          const dy = layout[j].y - layout[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 2000 / (dist * dist);
          layout[i].x -= (dx / dist) * force;
          layout[i].y -= (dy / dist) * force;
          layout[j].x += (dx / dist) * force;
          layout[j].y += (dy / dist) * force;
        }
      }

      // Attract connected nodes
      for (const edge of edges) {
        const src = layout.find((n) => n.id === edge.source_node_id);
        const tgt = layout.find((n) => n.id === edge.target_node_id);
        if (src && tgt) {
          const dx = tgt.x - src.x;
          const dy = tgt.y - src.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (dist - 100) * 0.01;
          src.x += (dx / dist) * force;
          src.y += (dy / dist) * force;
          tgt.x -= (dx / dist) * force;
          tgt.y -= (dy / dist) * force;
        }
      }

      // Keep nodes in bounds
      for (const n of layout) {
        n.x = Math.max(40, Math.min(width - 40, n.x));
        n.y = Math.max(40, Math.min(height - 40, n.y));
      }
    }

    setLayoutNodes(layout);

    // Draw
    ctx.clearRect(0, 0, width, height);

    // Draw edges
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    for (const edge of edges) {
      const src = layout.find((n) => n.id === edge.source_node_id);
      const tgt = layout.find((n) => n.id === edge.target_node_id);
      if (src && tgt) {
        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);
        ctx.stroke();

        // Draw relationship label
        const midX = (src.x + tgt.x) / 2;
        const midY = (src.y + tgt.y) / 2;
        ctx.fillStyle = '#9ca3af';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(edge.relationship, midX, midY - 4);
      }
    }

    // Draw nodes
    for (const node of layout) {
      const color = typeColors[node.type] || typeColors.default;
      const radius = 8 + node.strength * 12;

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#374151';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      const label = node.name.length > 15 ? node.name.slice(0, 15) + '…' : node.name;
      ctx.fillText(label, node.x, node.y + radius + 14);
    }
  }, [nodes, edges]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onNodeClick || layoutNodes.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const node of layoutNodes) {
      const dist = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      if (dist < 15) {
        const fullNode = nodes.find((n) => n.id === node.id);
        if (fullNode) onNodeClick(fullNode);
        break;
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (layoutNodes.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const node of layoutNodes) {
      const dist = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      if (dist < 15) {
        setHoveredNode(node);
        canvas.style.cursor = 'pointer';
        return;
      }
    }
    setHoveredNode(null);
    canvas.style.cursor = 'default';
  };

  if (nodes.length === 0) {
    return <div className="text-center py-12 text-gray-500">No knowledge graph nodes yet</div>;
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        className="w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={() => setHoveredNode(null)}
      />
      {hoveredNode && (
        <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg text-sm max-w-xs">
          <div className="font-medium">{hoveredNode.name}</div>
          <div className="text-xs text-gray-500 mt-1">Type: {hoveredNode.type}</div>
          <div className="text-xs text-gray-500">Strength: {hoveredNode.strength.toFixed(2)}</div>
        </div>
      )}
      <div className="flex flex-wrap gap-3 mt-3 justify-center">
        {[
          { color: '#6366f1', label: 'Topic' },
          { color: '#10b981', label: 'Episode' },
          { color: '#f59e0b', label: 'Concept' },
          { color: '#ef4444', label: 'Entity' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-xs text-gray-600">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
