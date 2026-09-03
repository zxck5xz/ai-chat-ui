export interface MultiModalDocument {
  id: string;
  title: string;
  type: 'image' | 'text' | 'mixed';
  content: string;
  image_url?: string;
  mime_type?: string;
  metadata: string;
  created_at: string;
}

export interface CrossModalSearchResult {
  id: string;
  documentId: string;
  title: string;
  type: 'image' | 'text' | 'mixed';
  content: string;
  imageUrl?: string;
  score: number;
  matchType: 'text-to-image' | 'image-to-text' | 'text-to-text' | 'image-to-image';
}

export interface MultiModalRAGMetrics {
  totalDocuments: number;
  documentsByType: Record<string, number>;
  totalSearches: number;
  avgLatencyMs: number;
}
