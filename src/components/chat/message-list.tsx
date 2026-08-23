'use client';

import { useEffect, useRef } from 'react';
import type { ChatMessage } from '@/types/chat';
import { MessageBubble } from './message-bubble';
import { LoadingStates } from './loading-states';
import type { LoadingState } from '@/types/chat';

interface MessageListProps {
  messages: ChatMessage[];
  loadingState: LoadingState;
}

export function MessageList({ messages, loadingState }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingState]);

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
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <LoadingStates state={loadingState} />
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
