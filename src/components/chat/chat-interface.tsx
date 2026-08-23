'use client';

import { useChat } from '@/hooks/use-chat';
import { useConversationStore } from '@/hooks/use-conversation';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { Plus, MessageSquare } from 'lucide-react';
import { useEffect } from 'react';

export function ChatInterface() {
  const { conversations, activeId, create, setActive } = useConversationStore();
  const { sendMessage, stop, loadingState, error } = useChat();

  const activeConversation = conversations.find((c) => c.id === activeId);
  const messages = activeConversation?.messages ?? [];

  useEffect(() => {
    if (!activeId && conversations.length === 0) {
      create();
    }
  }, [activeId, conversations.length, create]);

  const handleSend = (content: string) => {
    if (!activeId) {
      const id = create();
      sendMessage(id, content);
    } else {
      sendMessage(activeId, content);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b">
          <Button onClick={() => create()} className="w-full" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActive(conv.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                conv.id === activeId
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span className="truncate">{conv.title}</span>
            </button>
          ))}
        </div>
        <div className="p-4 border-t">
          <ThemeToggle />
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {error && (
          <div className="p-4 bg-destructive/10 text-destructive text-sm">
            {error.message}
          </div>
        )}
        <MessageList messages={messages} loadingState={loadingState} />
        <ChatInput
          onSend={handleSend}
          onStop={stop}
          isLoading={loadingState.type !== 'idle'}
        />
      </div>
    </div>
  );
}
