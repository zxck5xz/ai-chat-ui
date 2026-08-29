'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Table, ImageIcon, Layout } from 'lucide-react';
import type { DocumentUnderstandingResult } from '@/types/multi-modal';

interface DocumentViewerProps {
  result: DocumentUnderstandingResult;
}

export function DocumentViewer({ result }: DocumentViewerProps) {
  return (
    <Card className="p-4 bg-gray-900 border-gray-700 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-blue-400" />
          <h3 className="font-medium text-sm">Document Analysis</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>{result.totalPages} page{result.totalPages > 1 ? 's' : ''}</span>
          <span>{result.metadata.wordCount} words</span>
          <span>{result.latencyMs}ms</span>
        </div>
      </div>

      {result.summary && (
        <div className="bg-gray-800 rounded p-3 text-sm text-gray-300">
          <h4 className="text-xs font-medium text-gray-400 mb-1">Summary</h4>
          {result.summary}
        </div>
      )}

      {result.pages.map((page) => (
        <div key={page.pageNumber} className="space-y-3">
          <h4 className="text-xs font-medium text-gray-400 flex items-center gap-1">
            Page {page.pageNumber}
            {page.layout && (
              <Badge variant="outline" className="ml-2 text-[10px]">
                <Layout size={10} className="mr-1" />
                {page.layout.columns} col
              </Badge>
            )}
          </h4>

          {/* Page text */}
          <pre className="bg-gray-800 rounded p-3 text-xs text-gray-300 overflow-auto max-h-60 whitespace-pre-wrap font-mono">
            {page.text}
          </pre>

          {/* Tables */}
          {page.tables && page.tables.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-gray-400 flex items-center gap-1">
                <Table size={12} /> Tables ({page.tables.length})
              </h5>
              {page.tables.map((table, ti) => (
                <div key={ti} className="overflow-auto">
                  <table className="text-xs border-collapse">
                    <thead>
                      <tr>
                        {table.headers.map((h, hi) => (
                          <th key={hi} className="border border-gray-700 px-2 py-1 bg-gray-800 text-left">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, ri) => (
                        <tr key={ri}>
                          {row.map((cell, ci) => (
                            <td key={ci} className="border border-gray-700 px-2 py-1">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

          {/* Extracted images */}
          {page.images && page.images.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-gray-400 flex items-center gap-1">
                <ImageIcon size={12} /> Images ({page.images.length})
              </h5>
              <div className="flex gap-2 flex-wrap">
                {page.images.map((img, ii) => (
                  <div key={ii} className="bg-gray-800 rounded p-2 text-xs text-gray-400 max-w-xs">
                    <p>{img.description}</p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      Position: ({img.position.x}, {img.position.y})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </Card>
  );
}
