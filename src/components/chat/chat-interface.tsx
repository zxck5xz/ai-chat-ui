'use client';

import { useChat } from '@/hooks/use-chat';
import { useConversationStore } from '@/hooks/use-conversation';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { Button } from '@/components/ui/button';
import {
  Plus,
  MessageSquare,
  Trash2,
  RefreshCw,
  Menu,
  X,
  Sparkles,
  BarChart3,
  Code,
  Search,
  Wrench,
  Eye,
  FlaskConical,
  Mic,
  Type,
  Shield,
  Link as LinkIcon,
  GitBranch,
  Layers,
} from 'lucide-react';
import { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { DocumentUpload } from './document-upload';
import Link from 'next/link';

export function ChatInterface() {
  const { conversations, activeId, create, setActive, deleteConversation, init } =
    useConversationStore();
  const { sendMessage, sendRAGQuery, regenerate, stop, loadingState, error } = useChat();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [useRAG, setUseRAG] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeConversation = conversations.find((c) => c.id === activeId);
  const messages = useMemo(() => activeConversation?.messages ?? [], [activeConversation]);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (!activeId && conversations.length === 0) {
      create();
    }
  }, [activeId, conversations.length, create]);

  const handleSend = useCallback(
    (content: string) => {
      if (!activeId) {
        const id = create();
        if (useRAG) {
          sendRAGQuery(id, content);
        } else {
          sendMessage(id, content);
        }
      } else {
        if (useRAG) {
          sendRAGQuery(activeId, content);
        } else {
          sendMessage(activeId, content);
        }
      }
    },
    [activeId, create, sendMessage, sendRAGQuery, useRAG]
  );

  const handleRegenerate = useCallback(() => {
    if (activeId) {
      regenerate(activeId);
    }
  }, [activeId, regenerate]);

  const handleEdit = useCallback(
    (messageId: string, newContent: string) => {
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
    },
    [activeId, conversations, sendMessage]
  );

  const handleSelectConversation = useCallback(
    (id: string) => {
      setActive(id);
      setIsSidebarOpen(false);
    },
    [setActive]
  );

  const handleFocusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const handleNewChat = useCallback(() => {
    create();
    setIsSidebarOpen(false);
  }, [create]);

  const handleEditLastMessage = useCallback(() => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMessage && activeId) {
      handleEdit(lastUserMessage.id, lastUserMessage.content);
    }
  }, [messages, activeId, handleEdit]);

  useKeyboardShortcuts({
    onFocusInput: handleFocusInput,
    onNewChat: handleNewChat,
    onStopStreaming: stop,
    onCloseSidebar: () => setIsSidebarOpen(false),
    onEditLastMessage: handleEditLastMessage,
    isStreaming: loadingState.type !== 'idle',
    isSidebarOpen,
  });

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
        <DocumentUpload />
        <div className="p-2 border-t">
          <Link href="/orchestrator">
            <Button variant="outline" className="w-full flex items-center gap-2">
              <Sparkles size={16} className="text-violet-500" />
              Multi-Agent Orchestrator
            </Button>
          </Link>
        </div>
        <div className="p-2">
          <Link href="/eval">
            <Button variant="outline" className="w-full flex items-center gap-2">
              <BarChart3 size={16} className="text-blue-500" />
              Eval Dashboard
            </Button>
          </Link>
        </div>
        <div className="p-2">
          <Link href="/code-review">
            <Button variant="outline" className="w-full flex items-center gap-2">
              <Code size={16} className="text-purple-500" />
              Code Review Bot
            </Button>
          </Link>
        </div>
        <div className="p-2">
          <Link href="/hybrid-search">
            <Button variant="outline" className="w-full flex items-center gap-2">
              <Search size={16} className="text-orange-500" />
              Hybrid Search
            </Button>
          </Link>
        </div>
        <div className="p-2">
          <Link href="/tool-agent">
            <Button variant="outline" className="w-full flex items-center gap-2">
              <Wrench size={16} className="text-red-500" />
              Tool Agent
            </Button>
          </Link>
        </div>
        <div className="p-2">
          <Link href="/observability">
            <Button variant="outline" className="w-full flex items-center gap-2">
              <Eye size={16} className="text-cyan-500" />
              Observability
            </Button>
          </Link>
        </div>
        <div className="p-2">
          <Link href="/monitoring">
            <Button variant="outline" className="w-full flex items-center gap-2">
              <Shield size={16} className="text-orange-500" />
              Monitoring
            </Button>
          </Link>
        </div>
        <div className="p-2">
          <Link href="/fine-tuning">
            <Button variant="outline" className="w-full flex items-center gap-2">
              <FlaskConical size={16} className="text-emerald-500" />
              Fine-tuning
            </Button>
          </Link>
        </div>
        <div className="p-2">
          <Link href="/voice-agent">
            <Button variant="outline" className="w-full flex items-center gap-2">
              <Mic size={16} className="text-cyan-500" />
              Voice Agent
            </Button>
          </Link>
        </div>
        <div className="p-2">
          <Link href="/multi-modal">
            <Button variant="outline" className="w-full flex items-center gap-2">
              <Sparkles size={16} className="text-purple-400" />
              Multi-Modal AI
            </Button>
          </Link>
        </div>
        <div className="p-2">
          <Link href="/cross-modal-search">
            <Button variant="outline" className="w-full flex items-center gap-2">
              <Layers size={16} className="text-cyan-400" />
              Cross-Modal RAG
            </Button>
          </Link>
        </div>
        <div className="p-2">
          <Link href="/image-text">
            <Button variant="outline" className="w-full flex items-center gap-2">
              <Type size={16} className="text-emerald-400" />
              Text Replacement
            </Button>
          </Link>
        </div>
        <div className="p-2">
          <Link href="/search">
            <Button variant="outline" className="w-full flex items-center gap-2">
              <Search size={16} className="text-blue-400" />
              AI Search
            </Button>
          </Link>
        </div>
        <div className="p-2">
          <Link href="/mcp">
            <Button variant="outline" className="w-full flex items-center gap-2">
              <LinkIcon size={16} className="text-cyan-500" />
              MCP Dashboard
            </Button>
          </Link>
        </div>
        <div className="p-2">
          <Link href="/model-versioning">
            <Button variant="outline" className="w-full flex items-center gap-2">
              <GitBranch size={16} className="text-violet-500" />
              Model Versioning
            </Button>
          </Link>
        </div>
        <div className="p-2 border-t">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-xs text-muted-foreground">RAG Mode</span>
            <button
              onClick={() => setUseRAG(!useRAG)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                useRAG ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  useRAG ? 'translate-x-4' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
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
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-medium truncate">{activeConversation?.title || 'New Chat'}</span>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 text-destructive text-sm flex items-center justify-between">
            <span className="truncate">{error.message}</span>
            {error.retryable && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleRegenerate}
                className="shrink-0 ml-2"
              >
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
        <ChatInput onSend={handleSend} onStop={stop} isLoading={loadingState.type !== 'idle'} />
      </div>
    </div>
  );
}
