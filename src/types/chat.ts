export interface Source {
  id: string;
  title: string;
  url: string;
  snippet: string;
  score: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: Source[];
  createdAt: Date;
}

export type LoadingState =
  | { type: 'idle' }
  | { type: 'thinking' }
  | { type: 'streaming'; tokens: string }
  | { type: 'loading-sources' };

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatError {
  type: 'rate_limit' | 'network' | 'abort' | 'unknown';
  message: string;
  retryable: boolean;
}
