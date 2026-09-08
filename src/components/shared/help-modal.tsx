'use client';

import { useState } from 'react';
import { Dialog, DialogHeader, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HelpSection {
  title: string;
  items: string[];
}

export interface HelpContent {
  title: string;
  description: string;
  sections: HelpSection[];
  tips?: string[];
}

const HELP_DATA: Record<string, HelpContent> = {
  orchestrator: {
    title: 'Multi-Agent Orchestrator',
    description: 'Coordinate multiple AI agents to work together on complex tasks. Each agent specializes in one domain (planning, design, coding, reviewing).',
    sections: [
      {
        title: 'How to Use',
        items: [
          'Type a task description in the input field (e.g., "Build a landing page for a SaaS product")',
          'Click "Run" to start the orchestration pipeline',
          'Watch each agent execute their step in the timeline',
          'Enable "Require Approval" to manually approve/reject each step',
        ],
      },
      {
        title: 'Agent Types',
        items: [
          'Planner — Analyzes the request and breaks it into actionable tasks',
          'Designer — Creates design specs (layout, colors, typography)',
          'Coder — Generates React/TypeScript code based on the design',
          'Reviewer — Reviews generated code for accessibility & performance',
        ],
      },
      {
        title: 'Features',
        items: [
          'Real-time progress bar showing multi-step execution',
          'Timeline view of each agent\'s contribution',
          'Human-in-the-loop approval for sensitive steps',
          'SSE streaming for live updates',
        ],
      },
    ],
    tips: [
      'Try complex tasks like "Create a dashboard with charts and a data table" to see multiple agents collaborate',
      'Enable approval mode to review each agent\'s output before proceeding',
    ],
  },
  langgraph: {
    title: 'LangGraph Multi-Agent',
    description: 'Build stateful multi-agent workflows using LangGraph patterns — Supervisor, Swarm, and Hierarchical orchestration.',
    sections: [
      {
        title: 'How to Use',
        items: [
          'Select an orchestration pattern from the available cards',
          'Enter your task in the input field',
          'Click "Run" to execute the workflow',
          'View the execution trace to see each node\'s input/output',
        ],
      },
      {
        title: 'Patterns',
        items: [
          'Supervisor — Central agent routes tasks to specialist sub-agents',
          'Swarm — Decentralized agent collaboration with handoffs',
          'Hierarchical — Manager decomposes task → parallel workers → aggregator',
        ],
      },
      {
        title: 'Advanced',
        items: [
          'Checkpointing saves state for durable execution across failures',
          'Human-in-the-loop approval gates pause workflow for manual review',
          'Per-node observability tracks timing, state diffs, and cost',
        ],
      },
    ],
    tips: [
      'Use Supervisor for clear task delegation scenarios',
      'Use Swarm when agents need to hand off work to each other dynamically',
      'Use Hierarchical for large tasks that can be parallelized',
    ],
  },
  eval: {
    title: 'Eval Dashboard',
    description: 'Monitor AI model performance with evaluation metrics, safety gates, and deployment approvals.',
    sections: [
      {
        title: 'How to Use',
        items: [
          'View overview metrics: total runs, accuracy, latency, cost, hallucination rate',
          'Filter by model version and date range using the filter bar',
          'Click on failure cases to see query, expected vs actual output, and feedback',
          'Check safety gates to see pass/fail status before deployment',
        ],
      },
      {
        title: 'Metrics Explained',
        items: [
          'Accuracy — Percentage of eval cases that passed',
          'Latency — Average response time (ms)',
          'Cost — Average cost per request (USD)',
          'Hallucination Rate — Percentage of outputs with detected hallucinations',
        ],
      },
      {
        title: 'Safety Gates',
        items: [
          'Automated checks that block deployment if metrics degrade',
          'Configure thresholds for accuracy, latency, and hallucination rate',
          'Human approval required for production deployments',
        ],
      },
    ],
    tips: [
      'Use the model version filter to compare performance across different models',
      'Review failure cases regularly to identify patterns and improve prompts',
    ],
  },
  'code-review': {
    title: 'AI Code Review Bot',
    description: 'Automated PR review using AI. Receives GitHub webhooks, analyzes code changes, and posts inline comments.',
    sections: [
      {
        title: 'How to Use',
        items: [
          'Connect your GitHub repo by setting up a webhook pointing to /api/code-review/webhook',
          'When a PR is opened or updated, the bot automatically reviews it',
          'View review history and metrics on this dashboard',
          'Click on a review to see detailed issues with severity levels',
        ],
      },
      {
        title: 'Severity Levels',
        items: [
          'Critical — Must fix before merge (security vulnerabilities, data loss risks)',
          'Warning — Should fix (performance issues, bad practices)',
          'Info — Nice to have (code style, minor improvements)',
          'Suggestion — Optional improvements (readability, naming)',
        ],
      },
      {
        title: 'Setup',
        items: [
          'Set GITHUB_TOKEN environment variable for API access',
          'Set GITHUB_WEBHOOK_SECRET for webhook signature verification',
          'Configure webhook events: pull_request (opened, synchronize)',
        ],
      },
    ],
    tips: [
      'The bot uses HMAC-SHA256 signature verification for webhook security',
      'Review the top repositories panel to see which repos have the most issues',
    ],
  },
  'hybrid-search': {
    title: 'Hybrid Search',
    description: 'Combine BM25 keyword search with vector similarity search for better retrieval quality.',
    sections: [
      {
        title: 'How to Use',
        items: [
          'Upload documents via the Document Management tab',
          'Search using the Search tab — results combine BM25 + vector scores',
          'Compare search methods side-by-side in the Comparison tab',
          'Run A/B tests to evaluate different chunking strategies',
        ],
      },
      {
        title: 'Search Methods',
        items: [
          'Vector Search — Semantic similarity using embeddings',
          'BM25 — Keyword matching with TF-IDF scoring',
          'Hybrid — Fuses both scores using Reciprocal Rank Fusion (RRF)',
        ],
      },
      {
        title: 'Chunking Strategies',
        items: [
          'Fixed — Split by character/word count',
          'Recursive — Split by paragraphs, then sentences',
          'Semantic — Split at semantic boundaries',
          'Document-Aware — Respects headers, code blocks, lists',
        ],
      },
    ],
    tips: [
      'Hybrid search typically outperforms either method alone',
      'Use the evaluation metrics (Recall@k, MRR) to measure retrieval quality',
      'Try different chunk sizes to find the optimal balance for your data',
    ],
  },
  'tool-agent': {
    title: 'AI Agent with Tool Use',
    description: 'An AI agent that can use external tools (web search, HTTP requests, calculator) to answer complex questions.',
    sections: [
      {
        title: 'How to Use',
        items: [
          'Enter a question that requires tool use (e.g., "What\'s the weather in Tokyo?")',
          'Click "Run" to start the agent',
          'Watch the reasoning chain: the agent thinks, calls tools, observes results, and iterates',
          'View final answer with supporting evidence',
        ],
      },
      {
        title: 'Available Tools',
        items: [
          'Web Search — Search the web using Jina API',
          'HTTP Request — Make HTTP calls to any URL',
          'Calculate — Evaluate mathematical expressions',
          'Get Current Time — Get the current date and time',
        ],
      },
      {
        title: 'Reasoning Pattern',
        items: [
          'The agent uses ReAct (Reasoning + Acting) pattern',
          'Each step: Think → Act (call tool) → Observe (get result) → Repeat',
          'Stops when the agent has enough information to answer',
        ],
      },
    ],
    tips: [
      'Try multi-step questions like "Find the population of France and divide by the population of Germany"',
      'The agent will automatically retry if a tool call fails',
      'View the reasoning chain to understand how the agent arrived at its answer',
    ],
  },
  observability: {
    title: 'AI Observability Platform',
    description: 'Track, debug, and optimize your AI system with full request tracing, cost tracking, and latency profiling.',
    sections: [
      {
        title: 'How to Use',
        items: [
          'Overview tab — See key metrics: traces, tokens, cost, latency, error rate',
          'Traces tab — Browse individual requests with full lifecycle',
          'Cost tab — Breakdown by model, view total spending',
          'Latency tab — P50/P90/P95/P99 percentiles, slow requests',
          'Alerts tab — Create rules and manage alert events',
        ],
      },
      {
        title: 'Trace Viewer',
        items: [
          'Click on any trace to see the full request lifecycle',
          'Each span shows timing, input/output, and metadata',
          'Identify bottlenecks by finding the longest spans',
        ],
      },
      {
        title: 'Alert Rules',
        items: [
          'Create rules with conditions (e.g., latency > 5000ms)',
          'Set cooldown periods to avoid alert fatigue',
          'Alert events are automatically created when conditions are met',
        ],
      },
    ],
    tips: [
      'Use the latency profiler to identify slow model calls',
      'Set up alerts for cost anomalies to avoid surprise bills',
      'Compare traces across time to spot performance regressions',
    ],
  },
  monitoring: {
    title: 'Production Monitoring',
    description: 'Detect anomalies, drift, and issues in your AI system with automated monitoring and alerting.',
    sections: [
      {
        title: 'How to Use',
        items: [
          'Overview tab — System health status, anomaly/drift counts',
          'Anomalies tab — Z-score and spike detection results',
          'Drifts tab — Latency, cost, error rate, and accuracy drift',
          'Alert Rules tab — Create and manage monitoring rules',
          'Evaluate tab — Run one-click evaluation pipeline',
        ],
      },
      {
        title: 'Anomaly Detection',
        items: [
          'Z-score — Statistical outlier detection (z > 2 = warning, z > 3 = critical)',
          'Spike — Moving average comparison (25%/50%/100% change thresholds)',
          'Automatic acknowledgment workflow for investigating anomalies',
        ],
      },
      {
        title: 'Drift Detection',
        items: [
          'Latency drift — Compare baseline vs current average latency',
          'Cost drift — Compare baseline vs current average cost',
          'Error rate drift — Compare baseline vs current error percentage',
          'Direction detection: improving / degrading / stable',
        ],
      },
    ],
    tips: [
      'Run the evaluation pipeline regularly to detect accuracy drift',
      'Set up cooldown periods on alert rules to avoid alert storms',
      'Use the metric snapshots to track trends over time',
    ],
  },
  'fine-tuning': {
    title: 'Fine-tuning Pipeline',
    description: 'Curate datasets, train models with LoRA/QLoRA, evaluate results, and A/B test against base models.',
    sections: [
      {
        title: 'How to Use',
        items: [
          'Datasets tab — Create datasets and add training entries',
          'Training tab — Create and monitor training jobs',
          'Evaluation tab — Compare base vs fine-tuned model performance',
          'A/B Testing tab — Route traffic between models and measure results',
        ],
      },
      {
        title: 'Dataset Management',
        items: [
          'Create datasets with name and description',
          'Add prompt-completion pairs as training entries',
          'Validate datasets to check for duplicates and empty entries',
        ],
      },
      {
        title: 'Training Jobs',
        items: [
          'Configure hyperparameters: learning rate, epochs, batch size',
          'Monitor training progress with loss curves',
          'Automatic failure handling with retry logic',
        ],
      },
    ],
    tips: [
      'Start with a small dataset (100-500 examples) to test your fine-tuning approach',
      'Compare pass rate, latency, and cost between base and fine-tuned models',
      'Use A/B testing to validate improvements before full deployment',
    ],
  },
  'voice-agent': {
    title: 'Voice AI Agent',
    description: 'Real-time voice conversations with AI. Uses Whisper for speech-to-text and ElevenLabs/OpenAI for text-to-speech.',
    sections: [
      {
        title: 'How to Use',
        items: [
          'Click the microphone button or press Space to start speaking',
          'Speak your question — audio is streamed to Whisper for transcription',
          'AI processes your question and responds with audio',
          'Click the interrupt button to stop the AI mid-response',
        ],
      },
      {
        title: 'Voice Pipeline',
        items: [
          'STT — Whisper API transcribes your speech to text',
          'LLM — Gemini generates a response (with function calling)',
          'TTS — ElevenLabs/OpenAI converts response to audio',
          'All steps stream in real-time via WebSocket',
        ],
      },
      {
        title: 'Features',
        items: [
          'Push-to-talk with visual waveform',
          'Real-time transcript display',
          'Interruption handling (stop AI mid-sentence)',
          'Session history and metrics',
        ],
      },
    ],
    tips: [
      'Speak clearly for best transcription accuracy',
      'Use the interrupt button when the AI goes off-track',
      'Check the transcript to review what was said',
    ],
  },
  'multi-modal': {
    title: 'Multi-Modal AI',
    description: 'Analyze images, understand documents, and compare visuals using Gemini Vision.',
    sections: [
      {
        title: 'How to Use',
        items: [
          'Upload an image for analysis (describe, OCR, code extraction)',
          'Compare two images side-by-side',
          'Upload documents (PDF/images) for structure extraction',
          'Use the chat tab for multi-modal conversations',
        ],
      },
      {
        title: 'Analysis Types',
        items: [
          'Describe — Get a detailed description of the image',
          'OCR — Extract text from the image',
          'Code — Extract code from screenshots',
          'Receipt — Parse receipt/invoice data',
          'Chart — Read and interpret charts/graphs',
          'Compare — Find differences between two images',
        ],
      },
      {
        title: 'Document Understanding',
        items: [
          'Extract text while preserving structure',
          'Identify tables, images, and layout elements',
          'Support for PDF and image-based documents',
        ],
      },
    ],
    tips: [
      'Use the image comparison feature to spot differences between designs',
      'Code extraction works well with screenshots of IDEs and code editors',
      'Upload high-resolution images for better OCR accuracy',
    ],
  },
  'cross-modal-search': {
    title: 'Cross-Modal RAG Search',
    description: 'Search across text and images using shared embeddings. Find images from text queries and vice versa.',
    sections: [
      {
        title: 'How to Use',
        items: [
          'Index documents (text, image, or mixed) via the Index tab',
          'Search using text queries to find relevant images',
          'Upload an image to find similar content',
          'View indexed documents in the Documents tab',
        ],
      },
      {
        title: 'Search Types',
        items: [
          'Text → Image — Find images matching a text description',
          'Image → Text — Find text content similar to an image',
          'Cross-modal — Search across both modalities',
          'Text → Text — Traditional text similarity search',
          'Image → Image — Find visually similar images',
        ],
      },
      {
        title: 'How It Works',
        items: [
          'Images are embedded using Gemini multimodal embedding',
          'Text is embedded using Gemini text embedding',
          'Both are stored in Qdrant vector database',
          'Search uses hybrid score fusion for best results',
        ],
      },
    ],
    tips: [
      'Index a mix of text and images for the best cross-modal search experience',
      'Use descriptive text queries for better image retrieval',
      'Check the Metrics tab to monitor search quality and latency',
    ],
  },
  'image-text': {
    title: 'Image Text Replacement',
    description: 'Detect text in images using OCR, then replace it with AI-generated text while preserving the visual style.',
    sections: [
      {
        title: 'How to Use',
        items: [
          'Upload an image containing text',
          'Click "Detect Text" to find all text regions with bounding boxes',
          'Click on a detected region to edit the text',
          'Click "Replace" to generate a new image with updated text',
          'Use the comparison slider to compare before/after',
        ],
      },
      {
        title: 'Steps',
        items: [
          'OCR Detection — Gemini Vision identifies text regions with bounding boxes',
          'Region Selection — Click on any detected text region to edit',
          'AI Regeneration — Gemini generates a new image with the replacement text',
          'Before/After — Compare original and edited images with a slider',
        ],
      },
      {
        title: 'Features',
        items: [
          'Bounding box overlay shows detected text positions',
          'Inline edit popup for entering new text',
          'Style preservation — AI maintains the original visual style',
          'Download edited image',
        ],
      },
    ],
    tips: [
      'Works best with clear, readable text in images',
          'Use high-contrast text for better OCR detection',
          'Short text replacements produce better results than long ones',
    ],
  },
  search: {
    title: 'AI Search Engine',
    description: 'Intelligent search with query understanding, multi-strategy expansion, and analytics.',
    sections: [
      {
        title: 'How to Use',
        items: [
          'Type a search query in the search bar',
          'View results with relevance scores and source attribution',
          'Check the Query Info panel to see how your query was analyzed',
          'View analytics in the Analytics tab',
        ],
      },
      {
        title: 'Query Understanding',
        items: [
          'Classification — Determines query complexity and type',
          'Expansion — HyDE, multi-query, decomposition, step-back',
          'Rewriting — Resolves pronouns, injects context',
          'Routing — Different strategies for simple vs complex queries',
        ],
      },
      {
        title: 'Analytics',
        items: [
          'Click-through rate (CTR) tracking',
          'Mean Reciprocal Rank (MRR) measurement',
          'Zero-click detection',
          'Top and worst performing queries',
        ],
      },
    ],
    tips: [
      'Try complex queries to see decomposition in action',
      'Check the Query Info panel to understand how the search engine processed your query',
      'Use analytics to identify queries that need improvement',
    ],
  },
  mcp: {
    title: 'MCP Dashboard',
    description: 'Manage Model Context Protocol connections — expose your tools to AI clients and consume external tools.',
    sections: [
      {
        title: 'How to Use',
        items: [
          'Overview tab — See connected servers, tool usage stats',
          'Servers tab — Connect/disconnect external MCP servers',
          'Tools tab — Browse available tools and execute them',
          'Call Log tab — View history of tool invocations',
        ],
      },
      {
        title: 'MCP Server',
        items: [
          'Exposes your tools (search, code-review, etc.) via MCP protocol',
          'Works with Claude Desktop, Cursor, and other MCP clients',
          'JSON Schema definitions for each tool',
        ],
      },
      {
        title: 'MCP Client',
        items: [
          'Connect to external MCP servers (GitHub, filesystem, etc.)',
          'List and call remote tools',
          'Automatic call logging with latency tracking',
        ],
      },
    ],
    tips: [
      'Use the MCP Server to make your tools available to Claude Desktop',
      'Monitor tool usage statistics to understand which tools are most used',
      'Check the call log for debugging failed tool invocations',
    ],
  },
  'model-versioning': {
    title: 'Model Versioning',
    description: 'Track model versions, manage deployments, and rollback when needed.',
    sections: [
      {
        title: 'How to Use',
        items: [
          'Versions tab — Create and manage model versions',
          'Deployments tab — Deploy versions to environments',
          'Rollbacks tab — Revert to previous versions with reason tracking',
          'Overview tab — See version status and deployment summary',
        ],
      },
      {
        title: 'Deployment Strategies',
        items: [
          'Rolling — Gradually replace old version with new',
          'Canary — Deploy to small percentage first',
          'Blue-Green — Two identical environments, switch traffic',
          'Instant — Immediate switch to new version',
        ],
      },
      {
        title: 'Rollback',
        items: [
          'One-click rollback to any previous version',
          'Reason tracking for audit trail',
          'Automatic reversion if metrics degrade',
        ],
      },
    ],
    tips: [
      'Use canary deployments to test new models with minimal risk',
      'Always set a reason when rolling back for audit purposes',
      'Compare versions side-by-side before deploying',
    ],
  },
  'agentic-rag': {
    title: 'Agentic RAG with Self-Correction',
    description: 'Self-correcting retrieval system that evaluates its own answers and iterates until confident.',
    sections: [
      {
        title: 'How to Use',
        items: [
          'Enter a question that needs retrieval',
          'Click "Run" to start the agentic RAG pipeline',
          'Watch the system analyze, retrieve, generate, evaluate, and self-correct',
          'View the final answer with confidence score',
        ],
      },
      {
        title: 'Pipeline Steps',
        items: [
          'Classify — Analyze query intent and determine if retrieval is needed',
          'Retrieve — Fetch relevant chunks from vector database',
          'Generate — Create answer from retrieved sources',
          'Evaluate — Check for hallucinations and citation accuracy',
          'Correct — If low confidence, expand query and re-retrieve',
          'Synthesize — Combine multiple rounds into final answer',
        ],
      },
      {
        title: 'Verification',
        items: [
          'Hallucination Check — Verify claims against source documents',
          'Citation Mapping — Each claim mapped to specific source',
          'Confidence Score — Overall reliability rating',
          'Run History — View and compare past runs',
        ],
      },
      {
        title: 'Metrics',
        items: [
          'Total Runs — Number of queries processed',
          'Average Confidence — Mean confidence score across runs',
          'Hallucination Rate — Percentage of runs with detected hallucinations',
          'Correction Rate — Percentage of runs requiring multiple rounds',
        ],
      },
    ],
    tips: [
      'Enable "Require Approval" to review each step before proceeding',
      'Use the Verify tab to run hallucination checks on any answer',
      'Check the Metrics tab to track system performance over time',
      'Try queries of varying complexity to see different retrieval strategies',
    ],
  },
};

interface HelpModalProps {
  feature: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpModal({ feature, open, onOpenChange }: HelpModalProps) {
  const content = HELP_DATA[feature];

  if (!content) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader onClose={() => onOpenChange(false)}>
        <div className="flex items-center gap-2">
          <HelpCircle size={18} className="text-primary" />
          <h2 className="text-lg font-semibold">{content.title}</h2>
        </div>
      </DialogHeader>
      <DialogContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{content.description}</p>

        {content.sections.map((section, i) => (
          <div key={i}>
            <h3 className="text-sm font-medium mb-2">{section.title}</h3>
            <ul className="space-y-1.5">
              {section.items.map((item, j) => (
                <li key={j} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {content.tips && content.tips.length > 0 && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
            <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <span>Tips</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">PRO</Badge>
            </h3>
            <ul className="space-y-1.5">
              {content.tips.map((tip, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">→</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface HelpButtonProps {
  feature: string;
  className?: string;
}

export function HelpButton({ feature, className }: HelpButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors',
          className
        )}
      >
        <HelpCircle size={14} />
        Help
      </button>
      <HelpModal feature={feature} open={open} onOpenChange={setOpen} />
    </>
  );
}
