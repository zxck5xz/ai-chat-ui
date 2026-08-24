'use client';

import { useCallback, useState } from 'react';
import type { ChatMessage, LoadingState, ChatError, Source } from '@/types/chat';
import { useConversationStore } from './use-conversation';
import { useAbort } from './use-abort';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

// Parse SSE line
function parseSSELine(line: string): string | null {
  if (line.startsWith('data: ')) {
    return line.slice(6);
  }
  return null;
}

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

        // Check if response is SSE stream
        const contentType = response.headers.get('content-type') || '';
        const isSSE = contentType.includes('text/event-stream');

        if (!isSSE) {
          // Fallback: non-streaming response
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

          setLoadingState({ type: 'streaming', tokens: answer });
          updateMessage(conversationId, assistantMessage.id, {
            content: answer,
            sources,
          });
          setLoadingState({ type: 'idle' });
          return;
        }

        // SSE streaming
        setLoadingState({ type: 'streaming', tokens: '' });
        let fullContent = '';
        let sources: Source[] = [];

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        if (!reader) {
          throw new Error('No readable stream');
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            const data = parseSSELine(trimmed);
            if (!data) continue;

            if (data === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(data);

              switch (parsed.type) {
                case 'start':
                  console.log('Stream started with model:', parsed.model);
                  break;

                case 'token':
                  fullContent += parsed.content;
                  updateMessage(conversationId, assistantMessage.id, {
                    content: fullContent,
                  });
                  setLoadingState({ type: 'streaming', tokens: fullContent });
                  break;

                case 'sources':
                  sources = parsed.sources || [];
                  break;

                case 'error':
                  throw new Error(parsed.message);
              }
            } catch (e) {
              if (e instanceof Error && e.message !== 'Unexpected end of JSON input') {
                throw e;
              }
            }
          }
        }

        // Final update with sources
        updateMessage(conversationId, assistantMessage.id, {
          content: fullContent,
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

        // Check if response is SSE stream
        const contentType = response.headers.get('content-type') || '';
        const isSSE = contentType.includes('text/event-stream');

        if (!isSSE) {
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
          return;
        }

        // SSE streaming
        setLoadingState({ type: 'streaming', tokens: '' });
        let fullContent = '';
        let sources: Source[] = [];

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        if (!reader) {
          throw new Error('No readable stream');
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            const data = parseSSELine(trimmed);
            if (!data) continue;

            if (data === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(data);

              switch (parsed.type) {
                case 'start':
                  console.log('Stream started with model:', parsed.model);
                  break;

                case 'token':
                  fullContent += parsed.content;
                  updateMessage(conversationId, assistantMessage.id, {
                    content: fullContent,
                  });
                  setLoadingState({ type: 'streaming', tokens: fullContent });
                  break;

                case 'sources':
                  sources = parsed.sources || [];
                  break;

                case 'error':
                  throw new Error(parsed.message);
              }
            } catch (e) {
              if (e instanceof Error && e.message !== 'Unexpected end of JSON input') {
                throw e;
              }
            }
          }
        }

        updateMessage(conversationId, assistantMessage.id, {
          content: fullContent,
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

  const sendRAGQuery = useCallback(
    async (conversationId: string, query: string) => {
      setError(null);

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: query,
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
        const response = await fetch(`${API_URL}/api/rag/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            conversationId,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errBody = await response.json().catch(() => ({}));
          throw new Error(errBody.message || `HTTP ${response.status}`);
        }

        // SSE streaming
        setLoadingState({ type: 'streaming', tokens: '' });
        let fullContent = '';
        let sources: Source[] = [];

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        if (!reader) {
          throw new Error('No readable stream');
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            const data = parseSSELine(trimmed);
            if (!data) continue;

            if (data === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(data);

              switch (parsed.type) {
                case 'start':
                  console.log('RAG stream started with model:', parsed.model);
                  break;

                case 'token':
                  fullContent += parsed.content;
                  updateMessage(conversationId, assistantMessage.id, {
                    content: fullContent,
                  });
                  setLoadingState({ type: 'streaming', tokens: fullContent });
                  break;

                case 'sources':
                  sources = parsed.sources || [];
                  break;

                case 'error':
                  throw new Error(parsed.message);
              }
            } catch (e) {
              if (e instanceof Error && e.message !== 'Unexpected end of JSON input') {
                throw e;
              }
            }
          }
        }

        // Final update with sources
        updateMessage(conversationId, assistantMessage.id, {
          content: fullContent,
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

  return { sendMessage, sendRAGQuery, regenerate, stop, loadingState, error, isAborting };
}
