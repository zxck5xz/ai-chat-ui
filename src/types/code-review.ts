export interface CodeReview {
  id: string;
  pr_number: number;
  repo: string;
  status: 'pending' | 'completed' | 'failed';
  total_issues: number;
  issues_by_severity: string | null;
  latency_ms: number | null;
  cost_usd: number | null;
  created_at: string;
}

export interface CodeReviewIssue {
  id: string;
  review_id: string;
  file_path: string;
  line_number: number;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  suggestion: string | null;
  created_at: string;
}

export interface ReviewMetrics {
  total_reviews: number;
  completed: number;
  failed: number;
  avg_issues: number | null;
  avg_latency: number | null;
  total_issues: number | null;
}

export interface SeverityBreakdown {
  severity: string;
  count: number;
}

export interface TopRepo {
  repo: string;
  review_count: number;
  total_issues: number | null;
}
