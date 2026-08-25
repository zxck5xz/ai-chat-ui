# AI Chat UI

Frontend cho AI Chat — built với **Next.js 16** + **TypeScript** + **Tailwind CSS** + **shadcn/ui**.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](https://opensource.org/licenses/MIT)

## Live Demo

🔗 **https://ai-chat-ui-theta.vercel.app**

## Status

| Feature                  | Status  |
| ------------------------ | ------- |
| Streaming AI Chat        | ✅ Done |
| Conversation CRUD        | ✅ Done |
| Source Citations         | ✅ Done |
| Feedback System          | ✅ Done |
| Dark/Light Mode          | ✅ Done |
| Edit/Regenerate/Stop     | ✅ Done |
| Mobile Responsive        | ✅ Done |
| Keyboard Shortcuts       | ✅ Done |
| RAG Q&A Visualization    | ✅ Done |
| Multi-Agent Orchestrator | ✅ Done |
| Human-in-the-loop        | ✅ Done |
| Eval Dashboard           | 📋 Todo |

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
│  │ Chat UI     │  │ Orchestrator│  │ RAG Q&A     │    │
│  │ (Streaming) │  │ (Multi-Agent│  │ (Vector DB) │    │
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
│                                                         │
│  ┌─────────────┐  ┌─────────────┐                      │
│  │ Qdrant      │  │ Orchestrator│                      │
│  │ (Vectors)   │  │ (Agents)    │                      │
│  └─────────────┘  └─────────────┘                      │
└─────────────────────────────────────────────────────────┘
```

## Features

### Chat

- **Streaming AI Chat**: Real-time token-by-token responses via SSE
- **Multi-conversation**: Create, switch, delete conversations
- **Conversation History**: Persisted in D1 database
- **Edit/Regenerate/Stop**: Edit last message, regenerate response, stop streaming
- **Markdown Rendering**: Rich text display for AI responses

### RAG Q&A

- **Document Upload**: Upload and embed documents for RAG
- **RAG Mode Toggle**: Switch between chat and RAG modes
- **Source Citations**: Show retrieved chunks with similarity scores
- **See Reasoning**: Toggle to view retrieved chunks and reasoning

### Multi-Agent Orchestrator

- **Planner Agent**: Analyzes requests and breaks into tasks
- **Designer Agent**: Creates design specs (layout, colors, typography)
- **Coder Agent**: Generates React/TypeScript code
- **Reviewer Agent**: Reviews code for accessibility, performance
- **Progress Bar**: Multi-step progress visualization
- **Timeline**: Visual timeline of agent execution
- **Human-in-the-loop**: Approve/reject tasks before execution

### UI/UX

- **Dark/Light Mode**: Theme toggle with system preference
- **Mobile Responsive**: Works on desktop and mobile
- **Keyboard Shortcuts**: Ctrl+K (focus input), Ctrl+N (new chat), Escape (stop/close)
- **Copy Message**: One-click copy for AI responses
- **Feedback System**: Thumbs up/down on assistant messages

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running ([ai-chat-api](../ai-chat-api/))

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
│   │   ├── layout.tsx                  # Root layout + providers
│   │   ├── page.tsx                    # Redirect → /chat
│   │   ├── globals.css                 # Global styles
│   │   ├── chat/
│   │   │   └── page.tsx                # Main chat page
│   │   ├── orchestrator/
│   │   │   └── page.tsx                # Orchestrator page
│   │   └── api/chat/
│   │       └── route.ts                # Local API (fallback)
│   ├── components/
│   │   ├── providers.tsx               # Theme + Tooltip + ErrorBoundary
│   │   ├── ui/                         # shadcn/ui components
│   │   ├── chat/
│   │   │   ├── chat-interface.tsx       # Main container + sidebar
│   │   │   ├── chat-input.tsx           # Input + Send/Stop buttons
│   │   │   ├── message-list.tsx         # ScrollArea + auto-scroll
│   │   │   ├── message-bubble.tsx       # User/Assistant messages
│   │   │   ├── loading-states.tsx       # Loading indicators
│   │   │   ├── sources-panel.tsx        # Sources display
│   │   │   └── document-upload.tsx      # RAG document upload
│   │   └── orchestrator/
│   │       ├── orchestrator-panel.tsx   # Main orchestrator UI
│   │       ├── progress-bar.tsx         # Multi-step progress
│   │       ├── timeline.tsx             # Agent execution timeline
│   │       ├── agent-icon.tsx           # Agent type icons
│   │       ├── design-spec-viewer.tsx   # Design spec display
│   │       ├── code-viewer.tsx          # Code display with copy
│   │       └── review-results.tsx       # Review scores display
│   ├── hooks/
│   │   ├── use-chat.ts                 # Chat logic (send, regenerate)
│   │   ├── use-abort.ts                # AbortController management
│   │   ├── use-conversation.ts         # Zustand store + localStorage
│   │   ├── use-orchestrator.ts         # Orchestrator workflow state
│   │   └── use-keyboard-shortcuts.ts   # Keyboard shortcuts
│   ├── lib/
│   │   ├── ai.ts                       # System prompt + config
│   │   ├── errors.ts                   # Error parsing
│   │   └── utils.ts                    # cn() utility
│   └── types/
│       ├── chat.ts                     # Chat TypeScript types
│       └── agents.ts                   # Agent TypeScript types
├── .env.example                        # Environment template
├── components.json                     # shadcn/ui config
├── next.config.ts                      # Next.js config
├── tailwind.config.ts                  # Tailwind config
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

### `useOrchestrator`

```typescript
const { tasks, status, progress, runWorkflow, approveTask, rejectTask } = useOrchestrator();

// Run workflow
await runWorkflow('Create a login form', true); // true = requireApproval

// Approve/Reject task
await approveTask();
await rejectTask();
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

### Run Orchestrator Workflow

```typescript
POST /api/orchestrator/run
Content-Type: application/json

{
  "input": "Create a login form",
  "requireApproval": true
}
```

### Approve/Reject Task

```typescript
POST /api/orchestrator/approve
Content-Type: application/json

{
  "approvalId": "uuid"
}
```

## Roadmap

### Phase 1: AI-Adjacent Baseline ✅

- [x] Streaming chat với Gemini
- [x] Conversation CRUD + persistence
- [x] Sources panel + feedback
- [x] Deploy FE (Vercel) + BE (Cloudflare)
- [x] Streaming SSE optimization
- [x] Edit/Regenerate/Stop
- [x] Mobile responsive
- [x] Keyboard shortcuts

### Phase 2: RAG & Agent Orchestration ✅

- [x] RAG pipeline integration
- [x] Vector DB (Qdrant)
- [x] Agent orchestration (multi-step)
- [x] Human-in-the-loop approvals

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
