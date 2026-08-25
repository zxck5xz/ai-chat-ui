'use client';

import { Palette, Layout, Type, Smartphone } from 'lucide-react';
import type { DesignSpec } from '@/types/agents';

interface DesignSpecViewerProps {
  result: DesignSpec;
}

export function DesignSpecViewer({ result }: DesignSpecViewerProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Palette size={16} className="text-pink-500" />
        <span>Design Specification</span>
      </div>

      {/* Layout */}
      <div className="border rounded-lg p-3">
        <div className="flex items-center gap-2 text-sm font-medium mb-2">
          <Layout size={14} className="text-violet-500" />
          Layout
        </div>
        <p className="text-sm text-muted-foreground">{result.layout}</p>
      </div>

      {/* Color Palette */}
      <div className="border rounded-lg p-3">
        <div className="flex items-center gap-2 text-sm font-medium mb-2">
          <Palette size={14} className="text-pink-500" />
          Color Palette
        </div>
        <div className="flex gap-2 flex-wrap">
          {result.colorPalette.map((color, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded border"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs font-mono">{color}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div className="border rounded-lg p-3">
        <div className="flex items-center gap-2 text-sm font-medium mb-2">
          <Type size={14} className="text-blue-500" />
          Typography
        </div>
        <p className="text-sm text-muted-foreground">{result.typography}</p>
      </div>

      {/* Components */}
      <div className="border rounded-lg p-3">
        <div className="flex items-center gap-2 text-sm font-medium mb-2">
          Components ({result.components.length})
        </div>
        <ul className="space-y-1">
          {result.components.map((component, index) => (
            <li key={index} className="text-sm text-muted-foreground">
              • {component}
            </li>
          ))}
        </ul>
      </div>

      {/* Responsive */}
      <div className="border rounded-lg p-3">
        <div className="flex items-center gap-2 text-sm font-medium mb-2">
          <Smartphone size={14} className="text-green-500" />
          Responsive Strategy
        </div>
        <p className="text-sm text-muted-foreground">{result.responsive}</p>
      </div>
    </div>
  );
}
