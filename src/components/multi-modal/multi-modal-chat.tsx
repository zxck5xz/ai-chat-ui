'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import type { ChatImage, MultiModalChatMessage } from '@/types/multi-modal';

interface MultiModalChatProps {
  messages: MultiModalChatMessage[];
  onSendMessage: (content: string, images?: ChatImage[]) => void;
  isLoading?: boolean;
}

export function MultiModalChat({ messages, onSendMessage, isLoading }: MultiModalChatProps) {
  const [input, setInput] = useState('');
  const [selectedImages, setSelectedImages] = useState<ChatImage[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!input.trim() && selectedImages.length === 0) return;
    onSendMessage(input.trim(), selectedImages.length > 0 ? selectedImages : undefined);
    setInput('');
    setSelectedImages([]);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ChatImage[] = [];
    for (let i = 0; i < Math.min(files.length, 5); i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });

      newImages.push({
        id: crypto.randomUUID(),
        base64,
        mimeType: file.type,
        name: file.name,
      });
    }

    setSelectedImages((prev) => [...prev, ...newImages]);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <ImageIcon size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">Upload images and ask questions about them</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-200'
              }`}
            >
              {/* Images */}
              {msg.images && msg.images.length > 0 && (
                <div className="flex gap-1 mb-2 flex-wrap">
                  {msg.images.map((img) => (
                    <img
                      key={img.id}
                      src={`data:${img.mimeType};base64,${img.base64}`}
                      alt={img.name}
                      className="w-16 h-16 object-cover rounded border border-gray-600"
                    />
                  ))}
                </div>
              )}
              <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-lg p-3 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-gray-400" />
              <span className="text-sm text-gray-400">Analyzing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Selected images preview */}
      {selectedImages.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-700 flex gap-2 flex-wrap">
          {selectedImages.map((img) => (
            <div key={img.id} className="relative">
              <img
                src={`data:${img.mimeType};base64,${img.base64}`}
                alt={img.name}
                className="w-12 h-12 object-cover rounded border border-gray-600"
              />
              <button
                onClick={() => setSelectedImages((prev) => prev.filter((i) => i.id !== img.id))}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileRef.current?.click()}
            className="shrink-0"
          >
            <ImageIcon size={18} />
          </Button>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask about the images..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || (!input.trim() && selectedImages.length === 0)}
            className="shrink-0"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
