'use client';

import { useChat } from '@/hooks/use-chat';
import { useConversationStore } from '@/hooks/use-conversation';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, Trash2, RefreshCw, Menu, X } from 'lucide-react';
import { useEffect, useCallback, useState } from 'react';

export function ChatInterface() {
  const { conversations, activeId, create, setActive, deleteConversation, init } =
    useConversationStore();
  const { sendMessage, regenerate, stop, loadingState, error } = useChat();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const activeConversation = conversations.find((c) => c.id === activeId);
  const messages = activeConversation?.messages ?? [];

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (!activeId && conversations.length === 0) {
      create();
    }
  }, [activeId, conversations.length, create]);

  const handleSend = useCallback((content: string) => {
    if (!activeId) {
      const id = create();
      sendMessage(id, content);
    } else {
      sendMessage(activeId, content);
    }
  }, [activeId, create, sendMessage]);

  const handleRegenerate = useCallback(() => {
    if (activeId) {
      regenerate(activeId);
    }
  }, [activeId, regenerate]);

  const handleEdit = useCallback((messageId: string, newContent: string) => {
    if (!activeId) return;

    const conversation = conversations.find((c) => c.id === activeId);
    if (!conversation) return;

    const messageIndex = conversation.messages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1) return;

    // Get all user messages up to this point (excluding the edited one)
    const userMessages = conversation.messages
      .slice(0, messageIndex)
      .filter((m) => m.role === 'user')
      .map((m) => ({ role: 'user' as const, content: m.content }));

    // Add the edited message
    userMessages.push({ role: 'user', content: newContent });

    // Remove this message and all messages after it
    const { updateMessage, removeMessages } = useConversationStore.getState();
    
    // Remove messages after the edited one (assistant response + any following)
    const messagesToRemove = conversation.messages.slice(messageIndex + 1);
    for (const msg of messagesToRemove) {
      removeMessages(activeId, [msg.id]);
    }

    // Update the edited message
    updateMessage(activeId, messageId, { content: newContent });

    // Resend with new context
    sendMessage(activeId, newContent);
  }, [activeId, conversations, sendMessage]);

  const handleSelectConversation = useCallback((id: string) => {
    setActive(id);
    setIsSidebarOpen(false);
  }, [setActive]);

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 border-r bg-muted/30 flex flex-col transform transition-transform duration-200 ease-in-out
          md:relative md:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <Button onClick={() => create()} className="flex-1 mr-2" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group flex items-center gap-2 rounded-lg transition-colors ${
                conv.id === activeId
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <button
                onClick={() => handleSelectConversation(conv.id)}
                className="flex-1 text-left px-3 py-2 text-sm flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span className="truncate">{conv.title}</span>
              </button>
              <button
                onClick={() => deleteConversation(conv.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-opacity"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="flex items-center gap-2 p-2 border-b md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-medium truncate">{activeConversation?.title || 'New Chat'}</span>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 text-destructive text-sm flex items-center justify-between">
            <span className="truncate">{error.message}</span>
            {error.retryable && (
              <Button size="sm" variant="outline" onClick={handleRegenerate} className="shrink-0 ml-2">
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
          </div>
        )}
        <MessageList
          messages={messages}
          loadingState={loadingState}
          conversationId={activeId}
          onEdit={handleEdit}
          onRegenerate={handleRegenerate}
        />
        <ChatInput
          onSend={handleSend}
          onStop={stop}
          isLoading={loadingState.type !== 'idle'}
        />
      </div>
    </div>
  );
}
