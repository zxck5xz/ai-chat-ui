'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftRight } from 'lucide-react';
import type { ComparisonResult } from '@/types/multi-modal';

interface ComparisonViewProps {
  result: ComparisonResult;
  imageUrlA?: string;
  imageUrlB?: string;
}

export function ComparisonView({ result, imageUrlA, imageUrlB }: ComparisonViewProps) {
  return (
    <Card className="p-4 bg-gray-900 border-gray-700 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowLeftRight size={18} className="text-purple-400" />
          <h3 className="font-medium text-sm">Image Comparison</h3>
        </div>
        <div className="text-xs text-gray-400">{result.latencyMs}ms</div>
      </div>

      {/* Side by side images */}
      {imageUrlA && imageUrlB && (
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <img src={imageUrlA} alt="Image A" className="w-full h-40 object-cover rounded border border-gray-700" />
            <Badge className="absolute top-1 left-1 text-[10px]">A</Badge>
          </div>
          <div className="relative">
            <img src={imageUrlB} alt="Image B" className="w-full h-40 object-cover rounded border border-gray-700" />
            <Badge className="absolute top-1 left-1 text-[10px]">B</Badge>
          </div>
        </div>
      )}

      {/* Similarities */}
      <div>
        <h4 className="text-xs font-medium text-green-400 mb-2">Similarities</h4>
        <ul className="space-y-1">
          {result.similarities.map((s, i) => (
            <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
              <span className="text-green-400 mt-0.5">+</span>
              {s}
            </li>
          ))}
        </ul>
      </div>

      {/* Differences */}
      <div>
        <h4 className="text-xs font-medium text-yellow-400 mb-2">Differences</h4>
        <ul className="space-y-1">
          {result.differences.map((d, i) => (
            <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
              <span className="text-yellow-400 mt-0.5">-</span>
              {d}
            </li>
          ))}
        </ul>
      </div>

      {/* Summary */}
      <div className="bg-gray-800 rounded p-3 text-sm text-gray-300">
        <h4 className="text-xs font-medium text-gray-400 mb-1">Summary</h4>
        <div className="whitespace-pre-wrap">{result.summary}</div>
      </div>
    </Card>
  );
}
