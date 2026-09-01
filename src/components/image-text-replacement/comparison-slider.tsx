'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { GripVertical } from 'lucide-react';

interface ComparisonSliderProps {
  originalImageUrl: string;
  editedImageUrl: string;
  originalLabel?: string;
  editedLabel?: string;
}

export function ComparisonSlider({
  originalImageUrl,
  editedImageUrl,
  originalLabel = 'Original',
  editedLabel = 'Edited',
}: ComparisonSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const touchHandler = (e: TouchEvent) => handleTouchMove(e);
    container.addEventListener('touchmove', touchHandler);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(container);

    return () => {
      container.removeEventListener('touchmove', touchHandler);
      observer.disconnect();
    };
  }, [handleTouchMove]);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-lg overflow-hidden border border-gray-700 cursor-col-resize select-none"
      onMouseDown={() => setIsDragging(true)}
      onTouchStart={() => setIsDragging(true)}
    >
      {/* Edited image (full background) */}
      <img
        src={editedImageUrl}
        alt={editedLabel}
        className="w-full h-auto block"
        draggable={false}
      />

      {/* Original image (clipped) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPosition}%` }}>
        <img
          src={originalImageUrl}
          alt={originalLabel}
          className="w-full h-auto block"
          style={{ minWidth: containerWidth > 0 ? `${containerWidth}px` : '100%' }}
          draggable={false}
        />
      </div>

      {/* Slider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
          <GripVertical size={16} className="text-gray-600" />
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
        {originalLabel}
      </div>
      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
        {editedLabel}
      </div>
    </div>
  );
}
