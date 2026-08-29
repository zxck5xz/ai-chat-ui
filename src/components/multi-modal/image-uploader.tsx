'use client';

import { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (files: { base64: string; mimeType: string; name: string }[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  disabled?: boolean;
}

export function ImageUploader({ onImageSelect, multiple = false, maxFiles = 5, disabled }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<{ url: string; name: string }[]>([]);

  const handleFiles = useCallback(async (fileList: FileList) => {
    const files: { base64: string; mimeType: string; name: string }[] = [];
    const newPreviews: { url: string; name: string }[] = [];

    const limit = Math.min(fileList.length, multiple ? maxFiles : 1);

    for (let i = 0; i < limit; i++) {
      const file = fileList[i];
      if (!file.type.startsWith('image/')) continue;

      const base64 = await fileToBase64(file);
      files.push({ base64, mimeType: file.type, name: file.name });
      newPreviews.push({ url: URL.createObjectURL(file), name: file.name });
    }

    setPreviews(newPreviews);
    onImageSelect(files);
  }, [multiple, maxFiles, onImageSelect]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.readAsDataURL(file);
    });
  };

  const clearPreviews = () => {
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    setPreviews([]);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      {previews.length === 0 ? (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="w-full border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors cursor-pointer disabled:opacity-50"
        >
          <Upload size={32} className="mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-400">Click to upload image{multiple ? 's' : ''}</p>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF, WEBP up to 10MB</p>
        </button>
      ) : (
        <div className="flex gap-2 flex-wrap">
          {previews.map((p, i) => (
            <div key={i} className="relative group">
              <img src={p.url} alt={p.name} className="w-20 h-20 object-cover rounded border border-gray-700" />
              <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-[10px] text-center truncate px-1">
                {p.name}
              </span>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => { clearPreviews(); onImageSelect([]); }}
            className="w-20 h-20"
          >
            <X size={16} />
          </Button>
        </div>
      )}

      {previews.length > 0 && !multiple && (
        <Button variant="ghost" size="sm" onClick={() => inputRef.current?.click()}>
          <ImageIcon size={14} className="mr-1" /> Replace
        </Button>
      )}
    </div>
  );
}
