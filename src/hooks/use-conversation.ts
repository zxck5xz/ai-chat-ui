'use client';

import { create } from 'zustand';
import type { Conversation, ChatMessage } from '@/types/chat';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';
const STORAGE_KEY = 'ai-chat-conversations';

function loadConversations(): Conversation[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return parsed.map((c: Conversation) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
      messages: c.messages.map((m) => ({
        ...m,
        createdAt: new Date(m.createdAt),
      })),
    }));
  } catch {
    return [];
  }
}

function saveConversations(conversations: Conversation[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    // Storage full or unavailable
  }
}

interface ConversationStore {
  conversations: Conversation[];
  activeId: string | null;
  create: () => string;
  setActive: (id: string) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<ChatMessage>) => void;
  removeMessages: (conversationId: string, messageIds: string[]) => void;
  deleteConversation: (id: string) => void;
  getActive: () => Conversation | undefined;
  init: () => void;
  syncFromServer: () => Promise<void>;
}

function generateId() {
  return crypto.randomUUID();
}

export const useConversationStore = create<ConversationStore>((set, get) => ({
  conversations: [],
  activeId: null,

  init: () => {
    const conversations = loadConversations();
    set({ conversations });
  },

  syncFromServer: async () => {
    try {
      const response = await fetch(`${API_URL}/api/conversations`);
      if (!response.ok) return;

      const serverConversations = await response.json();
      const localConversations = get().conversations;

      // Merge: prefer server data, fallback to local
      const merged = serverConversations.map((sc: Record<string, unknown>) => {
        const local = localConversations.find((lc) => lc.id === sc.id);
        return {
          id: sc.id,
          title: sc.title,
          createdAt: new Date((sc.created_at as string) || (sc.createdAt as string)),
          updatedAt: new Date((sc.updated_at as string) || (sc.updatedAt as string)),
          messages: local?.messages || [],
        };
      });

      saveConversations(merged);
      set({ conversations: merged });
    } catch {
      // Offline or server unavailable
    }
  },

  create: () => {
    const id = generateId();
    const conversation: Conversation = {
      id,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to server
    fetch(`${API_URL}/api/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, title: 'New Chat' }),
    }).catch(() => {});

    set((state) => {
      const updated = [conversation, ...state.conversations];
      saveConversations(updated);
      return { conversations: updated, activeId: id };
    });
    return id;
  },

  setActive: (id) => set({ activeId: id }),

  addMessage: (conversationId, message) =>
    set((state) => {
      const updated = state.conversations.map((conv) =>
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
      );
      saveConversations(updated);
      return { conversations: updated };
    }),

  updateMessage: (conversationId, messageId, updates) =>
    set((state) => {
      const updated = state.conversations.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: conv.messages.map((msg) =>
                msg.id === messageId ? { ...msg, ...updates } : msg
              ),
            }
          : conv
      );
      saveConversations(updated);
      return { conversations: updated };
    }),

  removeMessages: (conversationId, messageIds) =>
    set((state) => {
      const updated = state.conversations.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: conv.messages.filter((msg) => !messageIds.includes(msg.id)),
            }
          : conv
      );
      saveConversations(updated);
      return { conversations: updated };
    }),

  deleteConversation: (id) =>
    set((state) => {
      // Delete from server
      fetch(`${API_URL}/api/conversations/${id}`, {
        method: 'DELETE',
      }).catch(() => {});

      const updated = state.conversations.filter((c) => c.id !== id);
      saveConversations(updated);
      return {
        conversations: updated,
        activeId: state.activeId === id ? (updated[0]?.id ?? null) : state.activeId,
      };
    }),

  getActive: () => {
    const { conversations, activeId } = get();
    return conversations.find((c) => c.id === activeId);
  },
}));
