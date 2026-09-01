'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Type } from 'lucide-react';
import type { TextRegion } from '@/types/image-text-replacement';

interface TextRegionSelectorProps {
  imageUrl: string;
  regions: TextRegion[];
  selectedRegions: Map<string, string>;
  onRegionSelect: (regionId: string, newText: string) => void;
  disabled?: boolean;
}

export function TextRegionSelector({
  imageUrl,
  regions,
  selectedRegions,
  onRegionSelect,
  disabled,
}: TextRegionSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [editingRegion, setEditingRegion] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleRegionClick = useCallback(
    (region: TextRegion) => {
      if (disabled) return;
      setEditingRegion(region.id);
      setEditText(region.text);
    },
    [disabled]
  );

  const handleConfirm = useCallback(() => {
    if (editingRegion) {
      onRegionSelect(editingRegion, editText);
      setEditingRegion(null);
      setEditText('');
    }
  }, [editingRegion, editText, onRegionSelect]);

  const handleCancel = useCallback(() => {
    setEditingRegion(null);
    setEditText('');
  }, []);

  const handleRemoveRegion = useCallback(
    (regionId: string) => {
      onRegionSelect(regionId, '');
    },
    [onRegionSelect]
  );

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className="relative inline-block w-full rounded-lg overflow-hidden border border-gray-700"
      >
        <img
          src={imageUrl}
          alt="Source"
          className="w-full h-auto"
          onLoad={(e) => {
            const img = e.target as HTMLImageElement;
            setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
          }}
        />

        {/* Bounding box overlays */}
        {regions.map((region) => {
          const isSelected = selectedRegions.has(region.id);
          const isEditing = editingRegion === region.id;

          return (
            <div key={region.id}>
              {/* Bounding box */}
              <button
                onClick={() => handleRegionClick(region)}
                disabled={disabled}
                className={`absolute border-2 rounded transition-all cursor-pointer ${
                  isEditing
                    ? 'border-yellow-400 bg-yellow-400/20 z-20'
                    : isSelected
                      ? 'border-green-400 bg-green-400/20 z-10'
                      : 'border-blue-400 bg-blue-400/10 hover:bg-blue-400/20 z-10'
                }`}
                style={{
                  left: `${region.bbox.x}%`,
                  top: `${region.bbox.y}%`,
                  width: `${region.bbox.width}%`,
                  height: `${region.bbox.height}%`,
                }}
              >
                {/* Text label */}
                <span className="absolute -top-5 left-0 text-[10px] bg-black/80 text-white px-1 rounded whitespace-nowrap">
                  {region.text.substring(0, 20)}
                  {region.text.length > 20 ? '...' : ''}
                </span>

                {/* Selected indicator */}
                {isSelected && !isEditing && (
                  <div className="absolute -top-5 -right-1">
                    <Badge className="bg-green-600 text-[9px] px-1 py-0">
                      <Check size={8} className="mr-0.5" />
                      Edit
                    </Badge>
                  </div>
                )}
              </button>

              {/* Inline edit popup */}
              {isEditing && (
                <div
                  className="absolute z-30 bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl"
                  style={{
                    left: `${Math.min(region.bbox.x, 60)}%`,
                    top: `${region.bbox.y + region.bbox.height + 1}%`,
                    minWidth: '250px',
                  }}
                >
                  <div className="text-[10px] text-gray-400 mb-1">
                    Original: <span className="text-white">{region.text}</span>
                  </div>
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleConfirm();
                      if (e.key === 'Escape') handleCancel();
                    }}
                    className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="New text..."
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" onClick={handleConfirm} className="flex-1 h-7">
                      <Check size={12} className="mr-1" /> Apply
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel} className="h-7">
                      <X size={12} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Region list */}
      {regions.length > 0 && (
        <Card className="p-3 bg-gray-900 border-gray-700">
          <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
            <Type size={12} />
            Detected {regions.length} text region{regions.length !== 1 ? 's' : ''}
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {regions.map((region) => {
              const isSelected = selectedRegions.has(region.id);
              const newText = selectedRegions.get(region.id);

              return (
                <div
                  key={region.id}
                  className={`flex items-center gap-2 p-1.5 rounded text-xs ${
                    isSelected
                      ? 'bg-green-900/30 border border-green-700'
                      : 'bg-gray-800 border border-gray-700'
                  }`}
                >
                  <span className="flex-1 truncate text-gray-300">{region.text}</span>
                  {isSelected && newText && (
                    <span className="text-green-400 truncate max-w-[100px]">→ {newText}</span>
                  )}
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleRegionClick(region)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Type size={12} />
                    </button>
                    {isSelected && (
                      <button
                        onClick={() => handleRemoveRegion(region.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
