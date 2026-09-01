# AI Chat UI

Frontend cho AI Chat — built với **Next.js 16** + **TypeScript** + **Tailwind CSS** + **shadcn/ui**.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](https://opensource.org/licenses/MIT)

## Live Demo

🔗 **https://ai-chat-ui-theta.vercel.app**

## Status

| Feature                       | Status  |
| ----------------------------- | ------- |
| Streaming AI Chat             | ✅ Done |
| Conversation CRUD             | ✅ Done |
| Source Citations              | ✅ Done |
| Feedback System               | ✅ Done |
| Dark/Light Mode               | ✅ Done |
| Edit/Regenerate/Stop          | ✅ Done |
| Mobile Responsive             | ✅ Done |
| Keyboard Shortcuts            | ✅ Done |
| RAG Q&A Visualization         | ✅ Done |
| Multi-Agent Orchestrator      | ✅ Done |
| Human-in-the-loop             | ✅ Done |
| Eval Dashboard                | ✅ Done |
| Safety Gates                  | ✅ Done |
| Code Review Bot               | ✅ Done |
| Hybrid Search Dashboard       | ✅ Done |
| Tool Agent (Function Calling) | ✅ Done |
| Production Monitoring         | ✅ Done |

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
│  │ Chat UI     │  │ Orchestrator│  │ Eval        │    │
│  │ (Streaming) │  │ (Multi-Agent│  │ Dashboard   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ Code Review │  │ Hybrid      │  │ Monitoring  │    │
│  │ Bot         │  │ Search      │  │ Dashboard   │    │
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
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ Qdrant      │  │ Orchestrator│  │ Hybrid      │    │
│  │ (Vectors)   │  │ (Agents)    │  │ Search      │    │
│  └─────────────┘  └─────────────┘  │ (BM25+Vec)  │    │
│                                     └─────────────┘    │
│  ┌─────────────┐  ┌─────────────┐                      │
│  │ Observability│  │ Monitoring  │                      │
│  │ (Traces)    │  │ (Anomaly+   │                      │
│  │             │  │  Drift)     │                      │
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

### Eval Dashboard

- **Metrics Cards**: 8 key metrics (runs, cases, accuracy, latency, cost, hallucination, feedback)
- **Timeseries Charts**: Accuracy & latency trends over time
- **Failure Cases**: Expandable table with query, expected/actual output, feedback
- **Safety Gates**: Automatic deploy blocking if metrics degrade
- **Deploy Approvals**: Human-in-the-loop deployment decisions
- **Filters**: Model version, date range filtering

### Code Review Bot

- **GitHub Integration**: Webhook for PR events, inline comments
- **Severity Analysis**: Critical, warning, info issue classification
- **Review Dashboard**: History, metrics, top repositories

### Hybrid Search Dashboard

- **Chunking Comparison**: Compare fixed, recursive, semantic, document-aware strategies
- **Search Comparison**: Side-by-side vector vs BM25 vs hybrid results
- **Overlap Analysis**: See how different methods overlap
- **Evaluation Metrics**: Recall@k, MRR, Precision@k, NDCG, context relevance, faithfulness
- **A/B Testing**: Create and analyze tests for prompts and configurations

### Tool Agent (Function Calling)

- **Reasoning Chain**: Visualize multi-step reasoning with expandable steps
- **Tool Execution**: Real-time tool call cards with input/output/status
- **Progress Bar**: Step count + tool call count progress
- **Example Queries**: Pre-built examples (price comparison, calculations)
- **4 Tools**: Web search (Jina), HTTP request, calculator, get current time

### Production Monitoring

- **System Health**: Real-time health status (healthy/degraded/critical)
- **Anomaly Detection**: Z-score analysis, spike detection with severity badges
- **Drift Detection**: Latency/cost/error rate/accuracy drift with direction indicators
- **Alert Rules**: Create rules with severity, evaluation window, cooldown period
- **One-click Evaluation**: Run full pipeline (snapshots → alerts → anomaly → drift)
- **5 Tabs**: Overview, Anomalies, Drifts, Alert Rules, Evaluate

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
git clone https://github.com/zxck5xz/ai-chat-ui.git
cd ai-chat-ui
npm install
cp .env.example .env.local
```

### Environment Variables

Edit `.env.local`:

```env
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
│   │   ├── eval/
│   │   │   └── page.tsx                # Eval dashboard page
│   │   ├── code-review/
│   │   │   └── page.tsx                # Code review page
│   │   ├── hybrid-search/
│   │   │   └── page.tsx                # Hybrid search page
│   │   ├── tool-agent/
│   │   │   └── page.tsx                # Tool agent page
│   │   ├── monitoring/
│   │   │   └── page.tsx                # Production monitoring page
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
│   │   ├── orchestrator/
│   │   │   ├── orchestrator-panel.tsx   # Main orchestrator UI
│   │   │   ├── progress-bar.tsx         # Multi-step progress
│   │   │   ├── timeline.tsx             # Agent execution timeline
│   │   │   ├── agent-icon.tsx           # Agent type icons
│   │   │   ├── design-spec-viewer.tsx   # Design spec display
│   │   │   ├── code-viewer.tsx          # Code display with copy
│   │   │   └── review-results.tsx       # Review scores display
│   │   ├── eval/
│   │   │   ├── metrics-cards.tsx        # 8 metric cards
│   │   │   ├── timeseries-chart.tsx     # Accuracy & latency charts
│   │   │   ├── failure-cases-table.tsx  # Expandable failure cases
│   │   │   ├── safety-gates.tsx         # Safety gates display
│   │   │   ├── deploy-approvals.tsx     # Deploy approval requests
│   │   │   └── eval-filters.tsx         # Model & date filters
│   │   ├── monitoring/
│   │   │   ├── anomaly-panel.tsx        # Anomaly list with severity
│   │   │   └── drift-panel.tsx          # Drift list with direction
│   │   └── tool-agent/
│   │       ├── tool-agent-panel.tsx     # Main tool agent UI
│   │       ├── reasoning-step.tsx       # Expandable reasoning step
│   │       └── tool-call-card.tsx       # Tool call display
│   ├── hooks/
│   │   ├── use-chat.ts                 # Chat logic
│   │   ├── use-abort.ts                # AbortController management
│   │   ├── use-conversation.ts         # Zustand store
│   │   ├── use-orchestrator.ts         # Orchestrator workflow state
│   │   ├── use-eval-dashboard.ts       # Eval dashboard state
│   │   ├── use-tool-agent.ts           # Tool agent state + SSE
│   │   ├── use-monitoring.ts           # Monitoring state + API calls
│   │   └── use-keyboard-shortcuts.ts   # Keyboard shortcuts
│   ├── lib/
│   │   ├── ai.ts                       # System prompt + config
│   │   ├── errors.ts                   # Error parsing
│   │   └── utils.ts                    # cn() utility
│   └── types/
│       ├── chat.ts                     # Chat types
│       ├── agents.ts                   # Agent types
│       ├── eval.ts                     # Eval types
│       ├── code-review.ts              # Code review types
│       ├── hybrid-search.ts            # Hybrid search types
│       ├── tool-agent.ts               # Tool agent types
│       └── monitoring.ts               # Monitoring types
├── .env.example                        # Environment template
├── components.json                     # shadcn/ui config
├── next.config.ts                      # Next.js config
└── package.json
```

## Key Hooks

### `useChat`

```typescript
const { sendMessage, regenerate, stop, loadingState, error } = useChat();
await sendMessage(conversationId, 'Hello AI');
await regenerate(conversationId);
stop();
```

### `useOrchestrator`

```typescript
const { tasks, status, progress, runWorkflow, approveTask, rejectTask } = useOrchestrator();
await runWorkflow('Create a login form', true);
await approveTask();
await rejectTask();
```

### `useEvalDashboard`

```typescript
const { metrics, timeseries, failures, gates, fetchMetrics, fetchTimeseries } = useEvalDashboard();
await fetchMetrics({ model_version: 'gemini-3.6-flash' });
await fetchTimeseries({ days: 30 });
```

### `useMonitoring`

```typescript
const { overview, anomalies, drifts, rules, fetchOverview, runEvaluation, detectDrifts } =
  useMonitoring();
await fetchOverview(7);
const result = await runEvaluation();
await detectDrifts('gemini-3.6-flash', 7);
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

### Phase 3: Evaluation & Safety ✅

- [x] Eval dashboard
- [x] Safety gates
- [x] Deploy approvals

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
