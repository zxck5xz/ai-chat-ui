'use client';

import { useEffect, useRef } from 'react';
import type { ChatMessage, LoadingState } from '@/types/chat';
import { MessageBubble } from './message-bubble';
import { LoadingStates } from './loading-states';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface MessageListProps {
  messages: ChatMessage[];
  loadingState: LoadingState;
  conversationId: string | null;
  onEdit?: (messageId: string, newContent: string) => void;
  onRegenerate?: () => void;
}

export function MessageList({ messages, loadingState, conversationId, onEdit, onRegenerate }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingState]);

  const lastMessage = messages[messages.length - 1];
  const canRegenerate = lastMessage?.role === 'assistant' && loadingState.type === 'idle';

  return (
    <div className="flex-1 overflow-y-auto px-4">
      <div className="max-w-3xl mx-auto py-6">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">AI Chat</h2>
            <p className="text-muted-foreground">
              Ask anything. Responses include sources when available.
            </p>
          </div>
        )}
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            conversationId={conversationId ?? ''}
            isLast={index === messages.length - 1}
            onEdit={onEdit}
          />
        ))}
        {canRegenerate && onRegenerate && (
          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerate}
              className="text-muted-foreground"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Regenerate response
            </Button>
          </div>
        )}
        <LoadingStates state={loadingState} />
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
