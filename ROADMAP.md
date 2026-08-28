# Lộ Trình 12 Tháng — AI-Adjacent React Engineer

Mục tiêu: Từ React dev → AI performance/UX engineer cho sản phẩm AI nghiêm túc.

---

## Giai đoạn 1 (Tháng 1-3): AI-Adjacent Baseline

### Kỹ năng trọng tâm

- [x] Streaming LLM responses vào React (Vercel AI SDK / SSE)
- [x] AbortController, cancel request, retry logic
- [x] Conversation state management (user/assistant/system)
- [x] 3 loading states: thinking, streaming, loading sources
- [x] Structured JSON output từ LLM
- [x] Few-shot prompt design cho UI

### Projects

#### Project 1: AI Chat UI ✅

- [x] Streaming chat với Gemini
- [x] Conversation CRUD + persistence
- [x] Sources panel + feedback
- [x] Deploy FE (Vercel) + BE (Cloudflare)
- [x] Streaming SSE (hoàn thiện)
- [x] Edit/Regenerate/Stop
- [x] Responsive mobile
- [x] Keyboard shortcuts

---

## Giai đoạn 2 (Tháng 4-8): RAG & Agent Orchestration

### Kỹ năng trọng tâm

- [x] RAG pipeline: query → embed → retrieve → re-rank → inject → stream
- [x] Vector DB (Qdrant/Pinecone/Weaviate)
- [x] Surface sources + highlight retrieved chunks
- [x] Agent orchestration (multi-step, tool-use)
- [x] Multi-turn state + tool results trong UI
- [x] Feedback collection (thumbs, report hallucination)
- [x] Confidence scores + drill-down

#### Project 2: RAG Q&A Visualization ✅

- [x] Embed query → retrieve top-k chunks (Qdrant + Gemini embedding)
- [x] Stream answer + metadata sources
- [x] Sources panel với expandable chunks + scores
- [x] Toggle "See reasoning" + retrieved chunks
- [x] Document upload UI + RAG mode toggle
- [x] Deploy FE (Vercel) + BE (Cloudflare Workers)

#### Project 3: Multi-Agent Orchestrator

- [x] Planner agent (phân tích yêu cầu, chia task)
- [x] Designer agent (đề xuất layout, màu sắc)
- [x] Coder agent (sinh code React/HTML/CSS)
- [x] Reviewer agent (check accessibility, performance)
- [x] Progress bar multi-step
- [x] Timeline log từng agent
- [x] Human-in-the-loop (approve/reject)

---

## Giai đoạn 3 (Tháng 9-12): Evaluation, Safety & CI

### Kỹ năng trọng tâm

- [x] Thiết kế eval set cho domain cụ thể
- [x] Đo metrics: correctness, hallucination rate, latency, cost
- [x] Gắn eval vào CI/CD
- [x] Safety gates: check accessibility, performance, privacy trước deploy
- [x] Version model outputs + cache TTL
- [x] UI fallback khi model output missing/stale
- [x] Graph RAG visualization

#### Project 4: AI Dashboard với Eval & Safety Gates

- [x] Dashboard hiển thị metrics eval theo thời gian
- [x] Distribution confidence scores
- [x] Top failure cases (thumbs down, flagged hallucination)
- [x] Filter theo model version, prompt variant, date range
- [x] Click failure case → xem query, docs, output, feedback
- [x] Safety gates: block deploy nếu metrics giảm
- [x] Approve/reject deployment (human-in-the-loop)

---

## Giai đoạn 4 (Tháng 9-12): AI Engineer Deep Dive

### Kỹ năng trọng tâm

- [x] GitHub API integration (webhooks, PR diff, inline comments)
- [x] Webhook security (HMAC-SHA256 signature verification)
- [x] Gemini structured output (JSON schema enforcement)
- [x] Hybrid search (BM25 + vector)
- [x] Function calling + tool orchestration
- [x] Custom embedding pipeline + re-ranking
- [x] Eval framework với automated metrics

#### Project 5: AI Code Review Bot

- [x] Webhook endpoint nhận GitHub PR events (opened/synchronize)
- [x] Webhook signature verification (HMAC-SHA256)
- [x] Fetch PR diff via GitHub API (Accept: application/vnd.github.v3.diff)
- [x] Gemini structured output với JSON schema (phân tích code)
- [x] Post inline comments lên GitHub PR
- [x] Lưu review history vào D1 (code_reviews + code_review_issues)
- [x] Review Dashboard: xem lịch sử reviews + metrics
- [x] Safety gate: block bot nếu hallucination rate > threshold
- [x] Deploy FE (Vercel) + BE (Cloudflare Workers)

#### Project 6: Custom RAG + Hybrid Search

- [x] BM25 (keyword) + Vector search kết hợp
- [x] Re-ranker (Cohere/BGE) để improve quality
- [x] Chunking strategies: semantic, recursive, document-aware
- [x] Evaluation: recall@k, MRR, context relevance
- [x] A/B test prompts và chunking strategies

#### Project 7: AI Agent với Tool Use ✅

- [x] Function calling với structured output (Gemini functionDeclarations)
- [x] Multi-step reasoning với tool loop (ReAct pattern)
- [x] Tool definitions: web search (Jina), HTTP request, calculator, get time
- [x] Agent memory (conversation history across steps)
- [x] SSE streaming cho reasoning steps + tool execution
- [x] Frontend: reasoning chain visualization, tool call cards, progress bar
- [x] Example: "Tìm giá iPhone 15 ở 3 shop, so sánh, gửi email tóm tắt"

---

## Resume Points

### AI-adjacent React Engineer (tháng 1-3)

> "Built streaming chat UIs with Vercel AI SDK, implementing abort/retry logic and multi-state conversation UX."
> "Integrated RAG pipelines into React frontends, visualizing sources and retrieved chunks with user feedback loops."

### AI Engineer Deep Dive (tháng 9-12)

> "Built AI Code Review Bot with GitHub webhook integration, HMAC-SHA256 security, and Gemini structured output for automated PR analysis."
> "Implemented inline review comments on GitHub PRs with severity-based issue detection and suggestions."
> "Designed hybrid search combining BM25 keyword matching with vector similarity for improved RAG retrieval."
> "Built custom AI agent with function calling, tool orchestration, and multi-step reasoning capabilities."
> "Implemented AI Agent with Gemini function calling, ReAct reasoning loop, and multi-step tool execution (web search, HTTP, calculator)."

### AI Orchestration & Evaluation (tháng 4-12)

> "Designed multi-agent workflows for complex tasks (planning, design, code generation) with human-in-the-loop approvals."
> "Implemented eval dashboards and safety gates to monitor accuracy, latency, and hallucination rates in production."
> "Built multi-agent orchestrator with Planner, Designer, Coder, and Reviewer agents using Gemini API."
> "Implemented human-in-the-loop approval system for multi-agent workflows with approve/reject UI."
> "Built eval dashboard with metrics visualization, failure case analysis, and safety gates for production monitoring."

---

## Tài nguyên học tập

### Streaming & AI UI

- Vercel AI SDK docs: https://sdk.vercel.ai
- Next.js App Router: https://nextjs.org/docs/app
- React Server Components: https://react.dev/reference/rsc

### RAG

- LangChain docs: https://docs.langchain.com
- Pinecone getting started: https://docs.pinecone.io
- Qdrant docs: https://qdrant.tech/documentation

### Agents

- OpenAI Assistants API: https://platform.openai.com/docs/assistants
- Vercel AI SDK agents: https://sdk.vercel.ai/docs/ai-sdk-core/agents

### Evaluation

- LangSmith evals: https://docs.smith.langchain.com
- Braintrust: https://www.braintrust.dev
- OpenAI Evals: https://github.com/openai/evals

### GitHub API & Webhooks

- GitHub REST API: https://docs.github.com/en/rest
- GitHub Webhooks: https://docs.github.com/en/webhooks
- GitHub PR API: https://docs.github.com/en/rest/pulls

---

## Tech Stack

```
FE:   Next.js 16 + TypeScript + Tailwind + shadcn/ui + Zustand
BE:   Hono + Cloudflare Workers + D1
AI:   Google Gemini → OpenAI → Claude (tùy task)
DB:   D1 (SQL) + Vector DB (Qdrant/Pinecone)
Eval: Custom dashboard + CI/CD integration
```

---

## Daily Log

### 2026-08-23 (Ngày 1)

- Scaffold FE + BE
- Deploy production
- Gemini API integration
- README cho cả 2 repo
- Lưu roadmap

### 2026-08-24 (Ngày 2)

- Implement Streaming SSE endpoint-to-endpoint
  - Backend: Chuyển Gemini API từ `generateContent` sang `streamGenerateContent`
  - Backend: SSE response format (text/event-stream) với token-by-token streaming
  - Frontend: Sửa useChat hook để đọc SSE stream qua ReadableStream
  - Frontend: Real-time message content updates trong quá trình streaming
  - Frontend: Sources panel hiển thị ở cuối stream
- Code changes:
  - `ai-chat-api/src/routes/messages.ts`: Streaming endpoint với retry/fallback
  - `ai-chat-ui/src/hooks/use-chat.ts`: SSE reader với progressive content updates

### 2026-08-24 (Ngày 2) - Edit/Regenerate/Stop

- Implement Edit message: User edit tin nhắn cuối → resend với context mới
- Implement Regenerate: Nút "Regenerate response" dưới assistant message
- Implement Stop: Nút Stop (Square icon) khi streaming
- Code changes:
  - `ai-chat-ui/src/components/chat/chat-interface.tsx`: handleEdit logic
  - `ai-chat-ui/src/components/chat/message-list.tsx`: onEdit + Regenerate button
  - `ai-chat-ui/src/hooks/use-conversation.ts`: removeMessages function

### 2026-08-24 (Ngày 2) - Responsive Mobile

- Mobile sidebar: slide-in/out với hamburger menu (Menu/X icons)
- Backdrop overlay khi sidebar mở trên mobile
- Đóng sidebar tự động khi chọn conversation
- Mobile header: hiển thị title + hamburger button
- Responsive padding, avatar sizes, gap cho mobile
- Code changes:
  - `ai-chat-ui/src/components/chat/chat-interface.tsx`: Mobile sidebar + header
  - `ai-chat-ui/src/components/chat/message-list.tsx`: Responsive padding
  - `ai-chat-ui/src/components/chat/message-bubble.tsx`: Responsive sizes

### 2026-08-24 (Ngày 2) - Keyboard Shortcuts + Pre-commit Hooks

- Keyboard shortcuts:
  - Ctrl/Cmd+K: Focus input
  - Ctrl/Cmd+N: New chat
  - Escape: Stop streaming / close sidebar
- Pre-commit hooks (husky + lint-staged):
  - Frontend: ESLint + Prettier on staged .ts/.tsx files
  - Backend: TypeScript check on staged .ts files
- Code changes:
  - `ai-chat-ui/src/hooks/use-keyboard-shortcuts.ts`: New hook
  - `ai-chat-ui/.prettierrc`: Prettier config

### 2026-08-24 (Ngày 2) - RAG Q&A (Project 2) ✅

- Backend: Qdrant vector DB integration
  - `ai-chat-api/src/services/qdrant.ts`: Collection management, upsert/search (dimension 3072)
  - `ai-chat-api/src/services/embedder.ts`: Gemini embedding-001 + text chunking
  - `ai-chat-api/src/routes/rag.ts`: Documents CRUD + streaming query endpoint
- Frontend: RAG UI integration
  - `ai-chat-ui/src/components/chat/document-upload.tsx`: Upload/embed documents
  - `ai-chat-ui/src/hooks/use-chat.ts`: sendRAGQuery function
  - `ai-chat-ui/src/components/chat/chat-interface.tsx`: RAG mode toggle
  - `ai-chat-ui/src/components/chat/sources-panel.tsx`: Expandable chunks + reasoning toggle
- Deploy: Backend Cloudflare Workers + Frontend Vercel
- Test: Document upload + RAG query streaming ✅

### 2026-08-25 (Ngày 3) - Multi-Agent Orchestrator (Project 3) 🚀

- Backend: Multi-agent orchestration system
  - `ai-chat-api/src/types/agents.ts`: Agent type definitions (AgentType, TaskStatus, WorkflowRun, WorkflowEvent)
  - `ai-chat-api/src/services/agents/base-agent.ts`: Base agent class with Gemini API + retry logic
  - `ai-chat-api/src/services/agents/planner-agent.ts`: Planner agent - analyzes requests, breaks into tasks
  - `ai-chat-api/src/services/agents/designer-agent.ts`: Designer agent - creates design specs (layout, colors, typography)
  - `ai-chat-api/src/services/agents/coder-agent.ts`: Coder agent - generates React/TypeScript code (code block format)
  - `ai-chat-api/src/services/agents/reviewer-agent.ts`: Reviewer agent - reviews code for accessibility, performance
  - `ai-chat-api/src/services/agents/orchestrator.ts`: Orchestrator service - manages agent workflow execution
  - `ai-chat-api/src/routes/orchestrator.ts`: SSE streaming endpoint for workflow events
- Frontend: Multi-agent orchestration UI
  - `ai-chat-ui/src/types/agents.ts`: Frontend type definitions
  - `ai-chat-ui/src/hooks/use-orchestrator.ts`: Hook for managing workflow state and SSE streaming
  - `ai-chat-ui/src/components/orchestrator/orchestrator-panel.tsx`: Main orchestrator UI panel
  - `ai-chat-ui/src/components/orchestrator/progress-bar.tsx`: Multi-step progress bar
  - `ai-chat-ui/src/components/orchestrator/timeline.tsx`: Visual timeline of agent execution
  - `ai-chat-ui/src/components/orchestrator/agent-icon.tsx`: Agent type icons with colors
  - `ai-chat-ui/src/components/orchestrator/design-spec-viewer.tsx`: Display design specifications
  - `ai-chat-ui/src/components/orchestrator/code-viewer.tsx`: Display generated code with copy
  - `ai-chat-ui/src/components/orchestrator/review-results.tsx`: Display review scores and issues
  - `ai-chat-ui/src/app/orchestrator/page.tsx`: Orchestrator page route
- UI Components: Added Card and Progress components
  - `ai-chat-ui/src/components/ui/card.tsx`: Card component for UI panels
  - `ai-chat-ui/src/components/ui/progress.tsx`: Progress bar component
- Navigation: Added orchestrator link in chat sidebar
- Coder agent fix: Changed from JSON to code block format (avoids nested escaping issues)
- Retry logic: Exponential backoff for Gemini API rate limits (429 errors)
- TypeScript: All type checks pass ✅
- Build: Frontend builds successfully ✅

### 2026-08-25 (Ngày 3) - Human-in-the-loop + Deploy ✅

- Human-in-the-loop feature:
  - Backend: Added approval/rejection endpoints (`/api/orchestrator/approve`, `/api/orchestrator/reject`)
  - Backend: In-memory approval store with workflow pause/resume
  - Backend: `requireApproval` option in workflow run
  - Frontend: Approval panel with Approve/Reject buttons
  - Frontend: Checkbox to toggle requireApproval mode
  - Frontend: `awaiting_approval` status support
- Deploy:
  - Backend: Cloudflare Workers (`https://ai-chat-api.ai-chat-api.workers.dev`)
  - Frontend: Vercel (`https://ai-chat-ui-theta.vercel.app`)
- Test: Production orchestrator endpoint working ✅
- Test: Frontend /orchestrator page accessible ✅

### 2026-08-25 (Ngày 3) - Project 4: Eval Dashboard ✅

- Backend: Eval & Safety Gates API
  - `ai-chat-api/schema.sql`: Added eval_runs, eval_results, safety_gates, deploy_approvals tables
  - `ai-chat-api/src/types/eval.ts`: Eval type definitions
  - `ai-chat-api/src/routes/eval.ts`: Eval API endpoints (metrics, timeseries, runs, results, failures, models)
  - `ai-chat-api/src/routes/safety.ts`: Safety gates + deploy approval endpoints
  - `ai-chat-api/src/index.ts`: Added eval and safety routes
- Frontend: Eval Dashboard
  - `ai-chat-ui/src/types/eval.ts`: Frontend eval type definitions
  - `ai-chat-ui/src/hooks/use-eval-dashboard.ts`: Hook for eval dashboard state and API calls
  - `ai-chat-ui/src/components/eval/metrics-cards.tsx`: 8 metric cards (runs, cases, accuracy, latency, cost, hallucination, feedback)
  - `ai-chat-ui/src/components/eval/timeseries-chart.tsx`: Accuracy & latency charts over time
  - `ai-chat-ui/src/components/eval/failure-cases-table.tsx`: Expandable failure cases with query, expected, actual, feedback
  - `ai-chat-ui/src/components/eval/safety-gates.tsx`: Safety gates display with pass/fail status
  - `ai-chat-ui/src/components/eval/deploy-approvals.tsx`: Deploy approval requests with approve/reject
  - `ai-chat-ui/src/components/eval/eval-filters.tsx`: Model version + date range filters
  - `ai-chat-ui/src/app/eval/page.tsx`: Eval dashboard page
  - `ai-chat-ui/src/components/ui/badge.tsx`: Badge component
- Navigation: Added Eval Dashboard link in chat sidebar
- Deploy:
  - Backend: Cloudflare Workers (new schema deployed)
  - Frontend: Vercel (`https://ai-chat-ui-theta.vercel.app/eval`)
- Test: Backend eval/metrics endpoint returning empty metrics ✅
- Test: Frontend /eval page accessible ✅

### 2026-08-26 (Ngày 4) - Project 5: AI Code Review Bot 🚀

- Backend: Code Review Bot API
  - `ai-chat-api/schema.sql`: Added code_reviews + code_review_issues tables
  - `ai-chat-api/src/types/code-review.ts`: ReviewIssue, ReviewResult, GitHubWebhookPayload types
  - `ai-chat-api/src/services/github.ts`: GitHub API - fetch PR diff, post PR review comments
  - `ai-chat-api/src/services/code-review-agent.ts`: Gemini structured output with JSON schema
  - `ai-chat-api/src/routes/code-review.ts`: Webhook endpoint, reviews CRUD, metrics, manual analyze
  - `ai-chat-api/src/index.ts`: Mounted code-review route
  - `ai-chat-api/wrangler.toml`: Added GITHUB_TOKEN, GITHUB_WEBHOOK_SECRET vars
- Security: HMAC-SHA256 webhook signature verification
- AI: Gemini structured output với JSON schema enforcement
- Frontend: Code Review Dashboard
  - `ai-chat-ui/src/types/code-review.ts`: Frontend type definitions
  - `ai-chat-ui/src/hooks/use-code-review.ts`: Hook for reviews state, metrics, analyze
  - `ai-chat-ui/src/components/code-review/metrics-cards.tsx`: 6 metric cards
  - `ai-chat-ui/src/components/code-review/review-list.tsx`: Review list with severity badges
  - `ai-chat-ui/src/components/code-review/review-detail.tsx`: Detailed review with issues
  - `ai-chat-ui/src/components/code-review/severity-chart.tsx`: Severity breakdown chart
  - `ai-chat-ui/src/components/code-review/top-repos.tsx`: Top repositories by review count
  - `ai-chat-ui/src/app/code-review/page.tsx`: Code review dashboard page
- Navigation: Added Code Review Bot link in chat sidebar
- TypeScript: All type checks pass ✅
- Test: Backend /api/code-review/metrics endpoint working ✅
- Test: Frontend /code-review page accessible ✅

### 2026-08-27 (Ngày 4) - Project 6: Custom RAG + Hybrid Search 🚀

- Backend: Hybrid Search API
  - `ai-chat-api/src/services/bm25.ts`: BM25 keyword search implementation (Okapi BM25 algorithm)
  - `ai-chat-api/src/services/hybrid-search.ts`: Hybrid search combining BM25 + Vector with fusion methods (RRF, weighted, CombMNZ)
  - `ai-chat-api/src/services/reranker.ts`: Re-ranking service (Cohere API + local fallback)
  - `ai-chat-api/src/services/chunking.ts`: 4 chunking strategies (fixed, recursive, semantic, document-aware)
  - `ai-chat-api/src/services/eval-metrics.ts`: Evaluation metrics (Recall@k, MRR, Precision@k, NDCG, context relevance, faithfulness)
  - `ai-chat-api/src/services/ab-testing.ts`: A/B testing framework for prompts and chunking strategies
  - `ai-chat-api/src/routes/hybrid-search.ts`: 11 API endpoints (documents, search, query, compare, evaluate, chunk, ab-test)
  - `ai-chat-api/src/types.ts`: Added COHERE_API_KEY to Env type
- Frontend: Hybrid Search Dashboard
  - `ai-chat-ui/src/types/hybrid-search.ts`: Frontend type definitions
  - `ai-chat-ui/src/hooks/use-hybrid-search.ts`: Hook for hybrid search state and API calls
  - `ai-chat-ui/src/components/hybrid-search/chunking-comparison.tsx`: Chunking strategy comparison with preview
  - `ai-chat-ui/src/components/hybrid-search/search-comparison.tsx`: Search method comparison (vector vs BM25 vs hybrid)
  - `ai-chat-ui/src/components/hybrid-search/eval-metrics.tsx`: Evaluation metrics dashboard
  - `ai-chat-ui/src/components/hybrid-search/ab-testing.tsx`: A/B testing interface
  - `ai-chat-ui/src/components/ui/input.tsx`: Input component
  - `ai-chat-ui/src/components/ui/tabs.tsx`: Tabs component
  - `ai-chat-ui/src/app/hybrid-search/page.tsx`: Hybrid search page
- Navigation: Added Hybrid Search link in chat sidebar
- TypeScript: All type checks pass ✅
- Build: Frontend builds successfully ✅
- Deploy: Backend Cloudflare Workers + Frontend Vercel ✅
- Resume: Updated resume_ai_native_fullstack.md and optimized_resume_reactjs.md ✅

### 2026-08-28 (Ngày 5) - Project 7: AI Agent với Tool Use 🚀

- Backend: Tool Agent API
  - `ai-chat-api/src/types/tool-agent.ts`: ToolDefinition, ToolCall, ToolAgentStep, ToolAgentRun, ToolAgentEvent types
  - `ai-chat-api/src/services/tool-agent/tools.ts`: Tool registry with 4 tools (search_web via Jina, http_request, calculate, get_current_time)
  - `ai-chat-api/src/services/tool-agent/tool-agent.ts`: ToolAgent class - Gemini function calling + ReAct reasoning loop with multi-step tool execution
  - `ai-chat-api/src/services/tool-agent/index.ts`: Service exports
  - `ai-chat-api/src/routes/tool-agent.ts`: SSE streaming endpoint (/run), tools list, runs history
  - `ai-chat-api/src/index.ts`: Mounted /api/tool-agent route
- Frontend: Tool Agent UI
  - `ai-chat-ui/src/types/tool-agent.ts`: Frontend type definitions
  - `ai-chat-ui/src/hooks/use-tool-agent.ts`: Hook for tool agent state, SSE streaming, reasoning steps
  - `ai-chat-ui/src/components/tool-agent/tool-call-card.tsx`: Tool call display with input/output/status
  - `ai-chat-ui/src/components/tool-agent/reasoning-step.tsx`: Expandable reasoning step with thought + tool calls
  - `ai-chat-ui/src/components/tool-agent/tool-agent-panel.tsx`: Main panel with input, example queries, progress, reasoning chain, final answer
  - `ai-chat-ui/src/components/tool-agent/index.ts`: Component exports
  - `ai-chat-ui/src/app/tool-agent/page.tsx`: Tool agent page route
- Navigation: Added Tool Agent link in chat sidebar (Wrench icon)
- TypeScript: All type checks pass ✅
- Build: Frontend builds successfully with /tool-agent route ✅

### 2026-08-28 (Ngày 5) - Production Hardening 🚀

- Authentication: API key middleware
  - `ai-chat-api/src/middleware/auth.ts`: API key validation via X-API-Key header or ?api_key= query param
  - Public paths: health check (/) always accessible
  - CORS: Added X-API-Key to allowed headers
  - Env: Added API_KEY to Env type (optional - skips auth if not set)
- Persistence: Tool Agent runs saved to D1
  - `ai-chat-api/schema.sql`: Added tool_agent_runs table (id, query, steps, final_answer, status, total_tool_calls, created_at, completed_at)
  - `ai-chat-api/src/services/tool-agent/tool-agent.ts`: Refactored to use D1 for saveRun, getRun, getRecentRuns
  - `ai-chat-api/src/routes/tool-agent.ts`: Updated to create new ToolAgent per request with D1 binding
- Testing: Vitest test suite
  - `ai-chat-api/vitest.config.ts`: Vitest configuration
  - `ai-chat-api/src/middleware/auth.test.ts`: 5 tests for auth middleware (public paths, reject, valid key, invalid key, CORS)
  - `ai-chat-api/src/services/tool-agent/tools.test.ts`: 11 tests for tool registry and calculate tool
  - Results: 16/16 tests passing ✅
- CI/CD: GitHub Actions workflows
  - `ai-chat-api/.github/workflows/ci-cd.yml`: Backend CI/CD (typecheck → test → deploy to Cloudflare Workers)
  - `ai-chat-ui/.github/workflows/ci-cd.yml`: Frontend CI/CD (typecheck → lint → build → deploy to Vercel)
- Deploy: Backend Cloudflare Workers + D1 schema updated ✅
