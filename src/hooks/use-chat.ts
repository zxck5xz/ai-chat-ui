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
        const response = await fetch(`${API_URL}/api/messages/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content }],
            conversationId,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errBody = await response.json().catch(() => ({}));
          throw new Error(errBody.message || `HTTP ${response.status}`);
        }

        const data = await response.json();

        // Parse content - may contain JSON with answer/sources
        let answer = data.content || '';
        let sources = data.sources || [];

        // Try to parse structured JSON from answer
        try {
          const jsonMatch = answer.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.answer) answer = parsed.answer;
            if (parsed.sources?.length) sources = parsed.sources;
          }
        } catch {
          // Use raw text if JSON parse fails
        }

        setLoadingState({ type: 'streaming', tokens: answer });
        updateMessage(conversationId, assistantMessage.id, {
          content: answer,
          sources,
        });
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

  const regenerate = useCallback(
    async (conversationId: string) => {
      const conversation = getActive();
      if (!conversation) return;

      const messages = conversation.messages;
      const lastAssistantIndex = messages.findLastIndex((m) => m.role === 'assistant');

      if (lastAssistantIndex === -1) return;

      const userMessages = messages
        .slice(0, lastAssistantIndex)
        .filter((m) => m.role === 'user')
        .map((m) => ({ role: 'user' as const, content: m.content }));

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
        const response = await fetch(`${API_URL}/api/messages/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: userMessages,
            conversationId,
          }),
          signal: controller.signal,
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        let answer = data.content || '';
        let sources = data.sources || [];

        try {
          const jsonMatch = answer.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.answer) answer = parsed.answer;
            if (parsed.sources?.length) sources = parsed.sources;
          }
        } catch {
          // Use raw text
        }

        updateMessage(conversationId, assistantMessage.id, {
          content: answer,
          sources,
        });
        setLoadingState({ type: 'idle' });
      } catch (err) {
        const chatError = handleError(err);
        if (chatError.type !== 'abort') {
          setError(chatError);
        }
        setLoadingState({ type: 'idle' });
      }
    },
    [getActive, addMessage, createController, handleError, updateMessage]
  );

  const stop = useCallback(() => {
    abort();
    setLoadingState({ type: 'idle' });
  }, [abort]);

  return { sendMessage, regenerate, stop, loadingState, error, isAborting };
}
