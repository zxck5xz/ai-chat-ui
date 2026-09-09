'use client';

import type { MemorySearchResult } from '../../types/memory';

interface TimelineViewProps {
  items: MemorySearchResult[];
  onDelete?: (id: string) => void;
}

export function TimelineView({ items, onDelete }: TimelineViewProps) {
  if (items.length === 0) {
    return <div className="text-center py-12 text-gray-500">No memories in timeline</div>;
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'positive':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'negative':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={item.id} className="relative pl-10">
            <div className="absolute left-2.5 top-2 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 bg-blue-500 shadow" />
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getOutcomeColor(String(item.metadata?.outcome || 'neutral'))}`}
                  >
                    {String(item.metadata?.outcome || 'neutral')}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(String(item.metadata?.created_at || ''))}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">strength: {item.score.toFixed(2)}</span>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(item.id)}
                      className="text-gray-400 hover:text-red-500 ml-2"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{item.content}</p>
              {item.metadata?.topics ? (
                <div className="flex flex-wrap gap-1">
                  {(() => {
                    try {
                      const topics = JSON.parse(String(item.metadata.topics));
                      return (topics as string[]).map((t, i) => (
                        <span
                          key={i}
                          className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded"
                        >
                          {t}
                        </span>
                      ));
                    } catch {
                      return null;
                    }
                  })()}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
