# AI Chat UI

Frontend cho AI Chat — built với **Next.js 16** + **TypeScript** + **Tailwind CSS** + **shadcn/ui**.

## Live Demo

🔗 https://ai-chat-ui-theta.vercel.app

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 16 (App Router) | React framework |
| Language | TypeScript 5.x | Type safety |
| Styling | Tailwind CSS 4 | Utility-first CSS |
| Components | shadcn/ui | Pre-built UI primitives |
| State | Zustand | Conversation management |
| Icons | Lucide React | Icon library |
| AI | Google Gemini (via BE) | LLM inference |

## Architecture

```
Next.js (Vercel)
      ↓
Cloudflare Workers (Hono)
      ├── D1 Database (conversations, messages)
      └── Google Gemini API (AI responses)
```

## Features

- **Streaming AI Chat**: Real-time token-by-token responses
- **Multi-conversation**: Create, switch, delete conversations
- **Conversation History**: Persisted in localStorage + D1 database
- **Markdown Rendering**: Rich text display for AI responses
- **Source Citations**: Show referenced sources with scores
- **See Reasoning**: Toggle to view retrieved chunks
- **Feedback System**: Thumbs up/down on assistant messages
- **Copy Message**: One-click copy for AI responses
- **Edit Last Message**: Modify and resend last user message
- **Regenerate**: Re-generate last AI response
- **Dark/Light Mode**: Theme toggle with system preference
- **Error Handling**: Retry logic with user-friendly messages
- **Responsive Design**: Works on desktop and mobile

## Setup

### Prerequisites

- Node.js 18+
- Backend API running ([ai-chat-api](https://github.com/zxck5xz/ai-chat-api))

### Installation

```bash
npm install
```

### Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8787
```

### Development

```bash
npm run dev
# Frontend runs at http://localhost:3000
```

### Build

```bash
npm run build
```

### Deploy

```bash
vercel --prod
```

## Project Structure

```
ai-chat-ui/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout + providers
│   │   ├── page.tsx                # Redirect → /chat
│   │   ├── globals.css             # Global styles
│   │   ├── chat/
│   │   │   └── page.tsx            # Main chat page
│   │   └── api/chat/
│   │       └── route.ts            # Local API (fallback)
│   ├── components/
│   │   ├── providers.tsx           # Theme + Tooltip + ErrorBoundary
│   │   ├── ui/                     # shadcn/ui components
│   │   ├── chat/
│   │   │   ├── chat-interface.tsx   # Main container + sidebar
│   │   │   ├── chat-input.tsx       # Input + Send/Stop buttons
│   │   │   ├── message-list.tsx     # ScrollArea + auto-scroll
│   │   │   ├── message-bubble.tsx   # User/Assistant messages
│   │   │   ├── loading-states.tsx   # Loading indicators
│   │   │   └── sources-panel.tsx    # Sources display
│   │   └── shared/
│   │       ├── theme-toggle.tsx     # Dark/Light toggle
│   │       └── error-boundary.tsx   # Error boundary
│   ├── hooks/
│   │   ├── use-chat.ts             # Chat logic (send, regenerate)
│   │   ├── use-abort.ts            # AbortController management
│   │   └── use-conversation.ts     # Zustand store + localStorage
│   ├── lib/
│   │   ├── ai.ts                   # System prompt + config
│   │   ├── errors.ts               # Error parsing
│   │   └── utils.ts                # cn() utility
│   └── types/
│       └── chat.ts                 # TypeScript types
├── .env.example                    # Environment template
└── package.json
```

## Key Hooks

### `useChat`

```typescript
const { sendMessage, regenerate, stop, loadingState, error } = useChat();

// Send a message
await sendMessage(conversationId, 'Hello AI');

// Regenerate last response
await regenerate(conversationId);

// Stop current generation
stop();
```

### `useConversationStore`

```typescript
const { conversations, activeId, create, setActive, deleteConversation } = useConversationStore();

// Create new conversation
const id = create();

// Switch conversation
setActive(id);

// Delete conversation
deleteConversation(id);
```

## Deployment

### Vercel

1. Connect GitHub repo to Vercel
2. Set environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://ai-chat-api.ai-chat-api.workers.dev
   ```
3. Deploy

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8787` |

## License

MIT
