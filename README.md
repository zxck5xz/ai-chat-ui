# AI Chat UI

Frontend cho AI Chat — built với **Next.js 16** + **TypeScript** + **Tailwind CSS** + **shadcn/ui**.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](https://opensource.org/licenses/MIT)

## Live Demo

🔗 **https://ai-chat-ui-theta.vercel.app**

## Status

| Feature                    | Status         |
| -------------------------- | -------------- |
| Streaming AI Chat          | ✅ Done        |
| Conversation CRUD          | ✅ Done        |
| Source Citations           | ✅ Done        |
| Feedback System            | ✅ Done        |
| Dark/Light Mode            | ✅ Done        |
| Deploy FE + BE             | ✅ Done        |
| SSE Streaming Optimization | 🔄 In Progress |
| Edit/Regenerate/Stop       | 📋 Todo        |
| Mobile Responsive          | 📋 Todo        |
| Keyboard Shortcuts         | 📋 Todo        |

## Tech Stack

| Layer      | Technology              | Purpose                 |
| ---------- | ----------------------- | ----------------------- |
| Framework  | Next.js 16 (App Router) | React framework         |
| Language   | TypeScript 5.x          | Type safety             |
| Styling    | Tailwind CSS 4          | Utility-first CSS       |
| Components | shadcn/ui               | Pre-built UI primitives |
| State      | Zustand                 | Conversation management |
| Icons      | Lucide React            | Icon library            |
| AI         | Google Gemini (via BE)  | LLM inference           |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js (Vercel)                     │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ Chat UI     │  │ Conversation│  │ Sources     │    │
│  │ (Streaming) │  │ Manager     │  │ Panel       │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│                       │                                 │
└───────────────────────┼─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Cloudflare Workers (Hono)                  │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ API Routes  │  │ D1 Database │  │ Gemini API  │    │
│  │             │  │ (Messages)  │  │ (AI)        │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────┘
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
- **Dark/Light Mode**: Theme toggle with system preference
- **Error Handling**: Retry logic with user-friendly messages
- **Responsive Design**: Works on desktop and mobile

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running ([ai-chat-api](https://github.com/zxck5xz/ai-chat-api))

### Installation

```bash
# Clone the repository
git clone https://github.com/zxck5xz/ai-chat-ui.git

# Navigate to project directory
cd ai-chat-ui

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

### Environment Variables

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
├── components.json                 # shadcn/ui config
├── next.config.ts                  # Next.js config
├── tailwind.config.ts              # Tailwind config
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

## API Reference

### Send Message

```typescript
POST /api/chat
Content-Type: application/json

{
  "conversationId": "string",
  "message": "string"
}
```

### Response (Streaming)

```typescript
// SSE stream with token-by-token responses
data: {"type": "token", "content": "Hello"}
data: {"type": "token", "content": ", how"}
data: {"type": "done"}
```

## Roadmap

### Phase 1: AI-Adjacent Baseline ✅

- [x] Streaming chat với Gemini
- [x] Conversation CRUD + persistence
- [x] Sources panel + feedback
- [x] Deploy FE (Vercel) + BE (Cloudflare)
- [ ] Streaming SSE optimization
- [ ] Edit/Regenerate/Stop
- [ ] Mobile responsive
- [ ] Keyboard shortcuts

### Phase 2: RAG & Agent Orchestration (Planned)

- [ ] RAG pipeline integration
- [ ] Vector DB (Qdrant/Pinecone)
- [ ] Agent orchestration (multi-step)
- [ ] Human-in-the-loop approvals

### Phase 3: Evaluation & Safety (Planned)

- [ ] Eval dashboard
- [ ] Safety gates
- [ ] CI/CD integration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

**Do Tuong Van** — tuongvan92@gmail.com

Project Link: [https://github.com/zxck5xz/ai-chat-ui](https://github.com/zxck5xz/ai-chat-ui)
