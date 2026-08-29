'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { ImageAnalysisResult } from '@/types/multi-modal';

interface AnalysisResultProps {
  result: ImageAnalysisResult;
}

export function AnalysisResult({ result }: AnalysisResultProps) {
  return (
    <Card className="p-4 bg-gray-900 border-gray-700 space-y-3">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="capitalize">
          {result.analysisType.replace('_', ' ')}
        </Badge>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>{result.latencyMs}ms</span>
          <span>{result.tokensUsed} tokens</span>
        </div>
      </div>

      <div className="prose prose-invert prose-sm max-w-none">
        <div className="whitespace-pre-wrap text-sm text-gray-200">{result.description}</div>
      </div>

      {result.extractedText && (
        <div className="mt-3">
          <h4 className="text-xs font-medium text-gray-400 mb-1">Extracted Text</h4>
          <pre className="bg-gray-800 rounded p-3 text-xs text-gray-300 overflow-auto max-h-60 whitespace-pre-wrap">
            {result.extractedText}
          </pre>
        </div>
      )}

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span>Model: {result.model}</span>
        <span>Confidence: {(result.confidence * 100).toFixed(0)}%</span>
        <span>Cost: ${result.costUsd.toFixed(6)}</span>
      </div>
    </Card>
  );
}
