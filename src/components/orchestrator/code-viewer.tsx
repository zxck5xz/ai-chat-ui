'use client';

import { useState } from 'react';
import { Copy, Check, FileCode2 } from 'lucide-react';
import type { CodeResult } from '@/types/agents';

interface CodeViewerProps {
  result: CodeResult;
}

export function CodeViewer({ result }: CodeViewerProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <FileCode2 size={16} className="text-blue-500" />
        <span>Generated Code ({result.files.length} files)</span>
      </div>

      {result.files.map((file, index) => (
        <div key={index} className="border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between bg-muted px-4 py-2">
            <span className="text-sm font-mono">{file.name}</span>
            <button
              onClick={() => copyToClipboard(file.content, index)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {copiedIndex === index ? (
                <Check size={14} className="text-green-500" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>
          <pre className="p-4 overflow-x-auto text-sm bg-background">
            <code className="font-mono">{file.content}</code>
          </pre>
        </div>
      ))}
    </div>
  );
}
