'use client';

import { useCallback, useState } from 'react';
import type { ChatMessage, LoadingState, ChatError } from '@/types/chat';
import { useConversationStore } from './use-conversation';
import { useAbort } from './use-abort';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

export function useChat() {
  const [loadingState, setLoadingState] = useState<LoadingState>({ type: 'idle' });
  const [error, setError] = useState<ChatError | null>(null);
  const { abort, createController, isAborting, handleError } = useAbort();
  const { addMessage, updateMessage, getActive } = useConversationStore();

  const streamResponse = useCallback(
    async (conversationId: string, assistantMessageId: string, messagesToSend: { role: string; content: string }[]) => {
      setError(null);
      setLoadingState({ type: 'thinking' });

      const controller = createController();

      try {
        const response = await fetch(`${API_URL}/api/messages/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: messagesToSend,
            conversationId,
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

          // Check for sources marker
          const sourcesMatch = chunk.match(/\[SOURCES\]([\s\S]*?)\[\/SOURCES\]/);
          if (sourcesMatch) {
            const sourcesJson = sourcesMatch[1];
            try {
              const sources = JSON.parse(sourcesJson);
              updateMessage(conversationId, assistantMessageId, { sources });
            } catch {
              // Skip malformed sources
            }
          } else {
            fullContent += chunk;
            setLoadingState({ type: 'streaming', tokens: fullContent });
            updateMessage(conversationId, assistantMessageId, { content: fullContent });
          }
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
    [createController, handleError, updateMessage]
  );

  const sendMessage = useCallback(
    async (conversationId: string, content: string) => {
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

      await streamResponse(conversationId, assistantMessage.id, [
        { role: 'user', content },
      ]);
    },
    [addMessage, streamResponse]
  );

  const regenerate = useCallback(
    async (conversationId: string) => {
      const conversation = getActive();
      if (!conversation) return;

      const messages = conversation.messages;
      const lastAssistantIndex = messages.findLastIndex((m) => m.role === 'assistant');

      if (lastAssistantIndex === -1) return;

      // Create new assistant message
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        createdAt: new Date(),
      };
      addMessage(conversationId, assistantMessage);

      // Send all messages up to last user message
      const messagesToSend = messages
        .slice(0, lastAssistantIndex)
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role, content: m.content }));

      await streamResponse(conversationId, assistantMessage.id, messagesToSend);
    },
    [getActive, addMessage, streamResponse]
  );

  const stop = useCallback(() => {
    abort();
    setLoadingState({ type: 'idle' });
  }, [abort]);

  return { sendMessage, regenerate, stop, loadingState, error, isAborting };
}
