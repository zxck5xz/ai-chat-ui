'use client';

import { useCallback, useState } from 'react';
import type { ChatMessage, LoadingState, ChatError } from '@/types/chat';
import { useConversationStore } from './use-conversation';
import { useAbort } from './use-abort';

export function useChat() {
  const [loadingState, setLoadingState] = useState<LoadingState>({ type: 'idle' });
  const [error, setError] = useState<ChatError | null>(null);
  const { abort, createController, isAborting, handleError } = useAbort();
  const { addMessage, updateMessage } = useConversationStore();

  const sendMessage = useCallback(
    async (conversationId: string, content: string) => {
      setError(null);

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        createdAt: new Date(),
      };
      addMessage(conversationId, userMessage);

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        createdAt: new Date(),
      };
      addMessage(conversationId, assistantMessage);
      setLoadingState({ type: 'thinking' });

      const controller = createController();

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content }],
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let fullContent = '';

        setLoadingState({ type: 'streaming', tokens: '' });

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;
          setLoadingState({ type: 'streaming', tokens: fullContent });
          updateMessage(conversationId, assistantMessage.id, { content: fullContent });
        }

        setLoadingState({ type: 'idle' });
      } catch (err) {
        const chatError = handleError(err);
        if (chatError.type !== 'abort') {
          setError(chatError);
        }
        setLoadingState({ type: 'idle' });
      }
    },
    [addMessage, updateMessage, createController, handleError]
  );

  const stop = useCallback(() => {
    abort();
    setLoadingState({ type: 'idle' });
  }, [abort]);

  return { sendMessage, stop, loadingState, error, isAborting };
}
