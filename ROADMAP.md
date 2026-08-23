# AI Chat UI — Roadmap & Progress

## Hoàn thành

### Ngày 1 (2026-08-23)

- [x] Scaffold FE (Next.js 16 + shadcn/ui + Zustand + Tailwind)
- [x] Scaffold BE (Hono + Cloudflare Workers + D1)
- [x] Streaming chat với Google Gemini API
- [x] Conversation CRUD + localStorage + D1 sync
- [x] Feedback (thumbs up/down)
- [x] Markdown rendering
- [x] Sources panel + "See reasoning" toggle
- [x] Theme toggle (dark/light)
- [x] Edit last message UI
- [x] Regenerate last response
- [x] Deploy FE (Vercel) + BE (Cloudflare)
- [x] README cho cả 2 repo

### Production URLs

| Service | URL |
|---------|-----|
| FE | https://ai-chat-ui-theta.vercel.app |
| BE | https://ai-chat-api.ai-chat-api.workers.dev |

---

## Tuần 1-2: Hoàn thiện Project 1

- [ ] Implement streaming SSE thay vì non-streaming
- [ ] Edit last message — BE support cho edited messages
- [ ] Conversation search/filter
- [ ] Typing indicator animation
- [ ] Responsive mobile layout
- [ ] Keyboard shortcuts (Ctrl+Enter, Esc để cancel)
- [ ] Error boundary per message
- [ ] Conversation export (JSON/Markdown)

---

## Tuần 3-4: Bắt đầu Project 2 — RAG Q&A

- [ ] Setup vector DB (Qdrant/Pinecone free tier)
- [ ] Build document ingestion pipeline
- [ ] Implement RAG: query → embed → retrieve → re-rank → answer
- [ ] Visualize sources + highlight retrieved chunks
- [ ] "See reasoning" toggle với actual chunks

---

## Tháng 2: RAG Deep Dive

- [ ] Multi-format ingestion (PDF, Markdown, HTML)
- [ ] Re-ranking retrieved chunks
- [ ] Source attribution UI (click → open source)
- [ ] Confidence scores display
- [ ] Feedback loop (thumbs down → flag hallucination)

---

## Tháng 3: Project 3 — Multi-Agent Orchestrator

- [ ] Planner agent (phân tích yêu cầu)
- [ ] Designer agent (đề xuất layout)
- [ ] Coder agent (sinh code React/HTML/CSS)
- [ ] Reviewer agent (check accessibility, perf)
- [ ] Multi-step progress UI
- [ ] Timeline log từng agent
- [ ] Human-in-the-loop (approve/reject)

---

## Tháng 4-6: Agent Orchestration

- [ ] Typed context giữa các agents
- [ ] Parallel agent execution
- [ ] State management cho multi-step workflows
- [ ] Error recovery & retry per agent step
- [ ] CLI integration (Hermes/OpenCode)

---

## Tháng 7-8: Evaluation & Safety

- [ ] Design eval sets cho domain cụ thể
- [ ] Metrics dashboard (accuracy, latency, cost)
- [ ] Confidence score distribution
- [ ] Safety gates (block deploy nếu metrics giảm)
- [ ] Human-in-the-loop approve/reject deployment

---

## Tháng 9-10: Advanced Features

- [ ] Graph RAG visualization
- [ ] Model versioning + cache TTL
- [ ] CI/CD pipeline cho AI outputs
- [ ] Performance monitoring dashboard

---

## Tháng 11-12: Polish & Portfolio

- [ ] Case studies cho từng project
- [ ] Video demo cho portfolio
- [ ] Blog post về kiến trúc + lessons learned
- [ ] Open source cleanup + documentation

---

## Tech Stack Summary

```
FE:  Next.js 16 + TypeScript + Tailwind + shadcn/ui + Zustand
BE:  Hono + Cloudflare Workers + D1 (SQLite)
AI:  Google Gemini API (free tier)
DB:  Cloudflare D1 + localStorage
```

## Repos

| Repo | URL |
|------|-----|
| FE | https://github.com/zxck5xz/ai-chat-ui |
| BE | https://github.com/zxck5xz/ai-chat-api |
