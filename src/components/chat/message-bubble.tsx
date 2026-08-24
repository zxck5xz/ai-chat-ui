'use client';

import { useState } from 'react';
import type { ChatMessage } from '@/types/chat';
import { SourcesPanel } from './sources-panel';
import { Bot, User, ThumbsUp, ThumbsDown, Copy, Check, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useConversationStore } from '@/hooks/use-conversation';

interface MessageBubbleProps {
  message: ChatMessage;
  conversationId: string;
  isLast?: boolean;
  onEdit?: (messageId: string, newContent: string) => void;
}

export function MessageBubble({ message, conversationId, isLast, onEdit }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const [feedbackGiven, setFeedbackGiven] = useState<'positive' | 'negative' | null>(
    message.feedback?.rating ?? null
  );
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const { updateMessage } = useConversationStore();

  const handleFeedback = (rating: 'positive' | 'negative') => {
    const newRating = feedbackGiven === rating ? null : rating;
    setFeedbackGiven(newRating);
    updateMessage(conversationId, message.id, {
      feedback: { rating: newRating },
    });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit?.(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  return (
    <div className={`flex gap-2 sm:gap-3 py-3 sm:py-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
          <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-foreground" />
        </div>
      )}
      <div className={`max-w-[85%] sm:max-w-[80%] ${isUser ? '' : 'flex flex-col'}`}>
        <div
          className={`rounded-lg px-3 py-2 sm:px-4 sm:py-3 ${
            isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
        >
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[80px] bg-background text-foreground"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveEdit}>
                  Save & Resend
                </Button>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          )}
          {message.sources && message.sources.length > 0 && !isEditing && (
            <div className="mt-3 pt-3 border-t">
              <SourcesPanel sources={message.sources} />
            </div>
          )}
        </div>
        {!isEditing && (
          <div className="flex items-center gap-1 mt-1 ml-1">
            {isUser && isLast && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-3 w-3" />
              </Button>
            )}
            {!isUser && message.content && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleFeedback('positive')}
                >
                  <ThumbsUp
                    className={`h-3 w-3 ${
                      feedbackGiven === 'positive' ? 'fill-green-500 text-green-500' : ''
                    }`}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleFeedback('negative')}
                >
                  <ThumbsDown
                    className={`h-3 w-3 ${
                      feedbackGiven === 'negative' ? 'fill-red-500 text-red-500' : ''
                    }`}
                  />
                </Button>
              </>
            )}
          </div>
        )}
      </div>
      {isUser && !isEditing && (
        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
          <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
      )}
    </div>
  );
}
