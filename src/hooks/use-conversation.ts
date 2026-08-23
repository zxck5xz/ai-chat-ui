'use client';

import { create } from 'zustand';
import type { Conversation, ChatMessage } from '@/types/chat';

interface ConversationStore {
  conversations: Conversation[];
  activeId: string | null;
  create: () => string;
  setActive: (id: string) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<ChatMessage>) => void;
  getActive: () => Conversation | undefined;
}

function generateId() {
  return crypto.randomUUID();
}

export const useConversationStore = create<ConversationStore>((set, get) => ({
  conversations: [],
  activeId: null,

  create: () => {
    const id = generateId();
    const conversation: Conversation = {
      id,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      conversations: [conversation, ...state.conversations],
      activeId: id,
    }));
    return id;
  },

  setActive: (id) => set({ activeId: id }),

  addMessage: (conversationId, message) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: [...conv.messages, message],
              updatedAt: new Date(),
              title: conv.messages.length === 0 && message.role === 'user'
                ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
                : conv.title,
            }
          : conv
      ),
    })),

  updateMessage: (conversationId, messageId, updates) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: conv.messages.map((msg) =>
                msg.id === messageId ? { ...msg, ...updates } : msg
              ),
            }
          : conv
      ),
    })),

  getActive: () => {
    const { conversations, activeId } = get();
    return conversations.find((c) => c.id === activeId);
  },
}));
