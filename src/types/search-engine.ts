export type QueryComplexity = 'simple' | 'moderate' | 'complex' | 'ambiguous';

export interface ClassifiedQuery {
  originalQuery: string;
  complexity: QueryComplexity;
  confidence: number;
  reasoning: string;
  keywords: string[];
  entities: string[];
}

export interface ExpandedQuery {
  originalQuery: string;
  strategy: 'hyde' | 'multi_query' | 'decomposition' | 'step_back' | 'alias_only';
  expandedQueries: string[];
  hydeDocument?: string;
  subQuestions?: string[];
  latencyMs: number;
}

export interface RewrittenQuery {
  originalQuery: string;
  rewrittenQuery: string;
  contextInjected: boolean;
  pronounsResolved: string[];
  chatHistoryUsed: number;
}

export interface QueryUnderstandingResult {
  classified: ClassifiedQuery;
  expanded: ExpandedQuery;
  rewritten: RewrittenQuery;
  finalQueries: string[];
  totalLatencyMs: number;
}

export interface SearchResult {
  id: string;
  documentId: string;
  documentTitle: string;
  chunkIndex: number;
  content: string;
  score: number;
  rerankScore?: number;
  highlight?: string;
  metadata?: Record<string, unknown>;
}

export interface SearchResponse {
  query: string;
  expandedQuery?: string;
  strategy: string;
  results: SearchResult[];
  totalResults: number;
  latencyMs: number;
  llmAnswer?: string;
}

export interface SearchAnalytics {
  totalQueries: number;
  avgLatencyMs: number;
  ctr: number;
  mrr: number;
  zeroClickRate: number;
  queriesByComplexity: Record<QueryComplexity, number>;
  topQueries: { query: string; count: number; ctr: number }[];
  worstQueries: { query: string; count: number; ctr: number; avgPosition: number }[];
  clicksByPosition: { position: number; count: number }[];
}
