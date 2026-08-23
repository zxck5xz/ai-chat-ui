# Lộ Trình 12 Tháng — AI-Adjacent React Engineer

Mục tiêu: Từ React dev → AI performance/UX engineer cho sản phẩm AI nghiêm túc.

---

## Giai đoạn 1 (Tháng 1-3): AI-Adjacent Baseline

### Kỹ năng trọng tâm
- [ ] Streaming LLM responses vào React (Vercel AI SDK / SSE)
- [ ] AbortController, cancel request, retry logic
- [ ] Conversation state management (user/assistant/system)
- [ ] 3 loading states: thinking, streaming, loading sources
- [ ] Structured JSON output từ LLM
- [ ] Few-shot prompt design cho UI

### Projects

#### Project 1: AI Chat UI ✅
- [x] Streaming chat với Gemini
- [x] Conversation CRUD + persistence
- [x] Sources panel + feedback
- [x] Deploy FE (Vercel) + BE (Cloudflare)
- [ ] Streaming SSE (hoàn thiện)
- [ ] Edit/Regenerate/Stop
- [ ] Responsive mobile
- [ ] Keyboard shortcuts

---

## Giai đoạn 2 (Tháng 4-8): RAG & Agent Orchestration

### Kỹ năng trọng tâm
- [ ] RAG pipeline: query → embed → retrieve → re-rank → inject → stream
- [ ] Vector DB (Qdrant/Pinecone/Weaviate)
- [ ] Surface sources + highlight retrieved chunks
- [ ] Agent orchestration (multi-step, tool-use)
- [ ] Multi-turn state + tool results trong UI
- [ ] Feedback collection (thumbs, report hallucination)
- [ ] Confidence scores + drill-down

#### Project 2: RAG Q&A Visualization
- [ ] Embed query → retrieve top-k chunks
- [ ] Stream answer + metadata sources
- [ ] Sources panel với click → highlight trong tài liệu gốc
- [ ] Toggle "See reasoning" + retrieved chunks + scores
- [ ] Feedback loop (thumbs up/down)

#### Project 3: Multi-Agent Orchestrator
- [ ] Planner agent (phân tích yêu cầu, chia task)
- [ ] Designer agent (đề xuất layout, màu sắc)
- [ ] Coder agent (sinh code React/HTML/CSS)
- [ ] Reviewer agent (check accessibility, performance)
- [ ] Progress bar multi-step
- [ ] Timeline log từng agent
- [ ] Human-in-the-loop (approve/reject)

---

## Giai đoạn 3 (Tháng 9-12): Evaluation, Safety & CI

### Kỹ năng trọng tâm
- [ ] Thiết kế eval set cho domain cụ thể
- [ ] Đo metrics: correctness, hallucination rate, latency, cost
- [ ] Gắn eval vào CI/CD
- [ ] Safety gates: check accessibility, performance, privacy trước deploy
- [ ] Version model outputs + cache TTL
- [ ] UI fallback khi model output missing/stale
- [ ] Graph RAG visualization

#### Project 4: AI Dashboard với Eval & Safety Gates
- [ ] Dashboard hiển thị metrics eval theo thời gian
- [ ] Distribution confidence scores
- [ ] Top failure cases (thumbs down, flagged hallucination)
- [ ] Filter theo model version, prompt variant, date range
- [ ] Click failure case → xem query, docs, output, feedback
- [ ] Safety gates: block deploy nếu metrics giảm
- [ ] Approve/reject deployment (human-in-the-loop)

---

## Resume Points

### AI-adjacent React Engineer (tháng 1-3)
> "Built streaming chat UIs with Vercel AI SDK, implementing abort/retry logic and multi-state conversation UX."
> "Integrated RAG pipelines into React frontends, visualizing sources and retrieved chunks with user feedback loops."

### AI Orchestration & Evaluation (tháng 4-12)
> "Designed multi-agent workflows for complex tasks (planning, design, code generation) with human-in-the-loop approvals."
> "Implemented eval dashboards and safety gates to monitor accuracy, latency, and hallucination rates in production."

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
