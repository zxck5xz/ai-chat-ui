/**
 * Hybrid Search Types
 */

export interface HybridSearchResult {
  id: string;
  content: string;
  documentId: string;
  documentTitle: string;
  documentUrl: string;
  chunkIndex: number;
  vectorScore: number;
  bm25Score: number;
  finalScore: number;
  fusionMethod: string;
}

export interface HybridSearchResponse {
  query: string;
  searchMethod: string;
  results: HybridSearchResult[];
  totalResults: number;
}

export interface ChunkingStrategy {
  name: string;
  label: string;
  description: string;
}

export const CHUNKING_STRATEGIES: ChunkingStrategy[] = [
  {
    name: 'fixed',
    label: 'Fixed Size',
    description: 'Split text into fixed-size chunks with overlap',
  },
  {
    name: 'recursive',
    label: 'Recursive',
    description: 'Recursively split by separators (\\n\\n, \\n, ., space)',
  },
  {
    name: 'semantic',
    label: 'Semantic',
    description: 'Split by sentences, keeping related content together',
  },
  {
    name: 'document-aware',
    label: 'Document-Aware',
    description: 'Respects document structure (headers, code blocks)',
  },
];

export interface ChunkPreview {
  index: number;
  content: string;
  tokenCount: number;
  startOffset: number;
  endOffset: number;
}

export interface ChunkingStats {
  totalChunks: number;
  avgChunkSize: number;
  minChunkSize: number;
  maxChunkSize: number;
  totalTokens: number;
}

export interface ChunkingComparison {
  [strategy: string]: {
    chunks: ChunkPreview[];
    stats: ChunkingStats;
  };
}

export interface SearchComparison {
  [method: string]: Array<{
    id: string;
    content: string;
    documentTitle: string;
    score: number;
  }>;
}

export interface EvalMetrics {
  recallAtK: number;
  mrr: number;
  precisionAtK: number;
  ndcg: number;
  contextRelevance: number;
  answerRelevance: number;
  faithfulness: number;
}

export interface EvalSummary {
  totalQueries: number;
  avgMetrics: EvalMetrics;
  minMetrics: EvalMetrics;
  maxMetrics: EvalMetrics;
  stdMetrics: EvalMetrics;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: ABVariant[];
  trafficSplit: number[];
  status: 'draft' | 'running' | 'paused' | 'completed';
  createdAt: string;
  endedAt?: string;
}

export interface ABVariant {
  id: string;
  name: string;
  config: {
    promptTemplate?: string;
    chunkingStrategy?: string;
    chunkSize?: number;
    chunkOverlap?: number;
    searchMethod?: 'vector' | 'bm25' | 'hybrid';
    topK?: number;
    temperature?: number;
  };
}

export interface ABTestSummary {
  testId: string;
  variantSummaries: VariantSummary[];
  winner?: string;
  confidence?: number;
}

export interface VariantSummary {
  variantId: string;
  variantName: string;
  totalQueries: number;
  avgLatencyMs: number;
  avgRelevance: number;
  avgFaithfulness: number;
  positiveRatio: number;
}
