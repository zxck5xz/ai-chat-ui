// Project 19: Agent-as-a-Service + Structured Output — frontend types

export type Tier = 'free' | 'starter' | 'pro' | 'enterprise';

export type Scope =
  | 'agent:run'
  | 'agent:stream'
  | 'structured:generate'
  | 'schema:read'
  | 'schema:write'
  | 'usage:read'
  | 'admin';

export interface TierLimits {
  tier: Tier;
  requests_per_minute: number;
  requests_per_day: number;
  tokens_per_month: number;
  max_keys: number;
  monthly_base_usd: number;
  overage_per_1k_tokens_usd: number;
  overage_allowed: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  email: string | null;
  tier: Tier;
  webhook_url: string | null;
  status: 'active' | 'suspended';
  created_at: string;
}

export interface ApiKey {
  id: string;
  tenant_id: string;
  name: string;
  key_prefix: string;
  tier: Tier;
  scopes: Scope[];
  status: 'active' | 'revoked';
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
  revoked_at: string | null;
}

export interface CreatedKey {
  key: ApiKey;
  plaintext_key: string;
  warning: string;
}

export interface UsageSummary {
  tenant_id: string;
  period_start: string;
  period_end: string;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  total_tokens: number;
  input_tokens: number;
  output_tokens: number;
  total_cost_usd: number;
  avg_duration_ms: number;
  by_endpoint: Array<{ endpoint: string; requests: number; tokens: number; cost_usd: number }>;
  by_day: Array<{ day: string; requests: number; tokens: number; cost_usd: number }>;
}

export interface UsageRecord {
  id: string;
  tenant_id: string;
  api_key_id: string;
  endpoint: string;
  method: string;
  status_code: number;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_usd: number;
  duration_ms: number;
  created_at: string;
}

export interface QuotaStatus {
  tenant_id: string;
  tier: Tier;
  tokens_used: number;
  tokens_included: number;
  tokens_remaining: number;
  percent_used: number;
  warning: boolean;
  exceeded: boolean;
  overage_tokens: number;
  overage_cost_usd: number;
  period_start: string;
  period_end: string;
}

export interface RateLimitStatus {
  allowed: boolean;
  window: 'minute' | 'day';
  limit: number;
  remaining: number;
  reset_at: number;
  retry_after_seconds: number;
}

export interface BillingEvent {
  id: string;
  tenant_id: string;
  type:
    | 'quota_warning'
    | 'quota_exceeded'
    | 'tier_changed'
    | 'key_created'
    | 'key_revoked'
    | 'invoice_generated';
  payload: Record<string, unknown>;
  delivered: boolean;
  created_at: string;
}

export interface Invoice {
  tenant_id: string;
  tier: Tier;
  period_start: string;
  period_end: string;
  base_usd: number;
  included_tokens: number;
  used_tokens: number;
  overage_tokens: number;
  overage_usd: number;
  total_usd: number;
  line_items: Array<{ description: string; quantity: number; amount_usd: number }>;
  generated_at: string;
}

// ---- Structured output ----

export interface JsonSchemaLike {
  type?: string | string[];
  description?: string;
  properties?: Record<string, JsonSchemaLike>;
  required?: string[];
  items?: JsonSchemaLike;
  enum?: unknown[];
  [key: string]: unknown;
}

export interface SchemaRecord {
  id: string;
  name: string;
  version: number;
  description: string | null;
  schema: JsonSchemaLike;
  created_at: string;
  updated_at: string;
}

export interface ValidationError {
  path: string;
  keyword: string;
  message: string;
  expected?: unknown;
  received?: unknown;
}

export type AttemptOutcome =
  'valid' | 'invalid_json' | 'schema_violation' | 'empty_response' | 'llm_error';

export interface StructuredAttempt {
  attempt: number;
  outcome: AttemptOutcome;
  raw_output: string;
  extracted_json: string | null;
  errors: ValidationError[];
  repair_prompt: string | null;
  duration_ms: number;
}

export interface StructuredResult {
  success: boolean;
  data: unknown | null;
  attempts: StructuredAttempt[];
  total_attempts: number;
  schema_name: string | null;
  duration_ms: number;
  error: string | null;
}

export interface StructuredMetrics {
  total_generations: number;
  success_count: number;
  success_rate: number;
  first_attempt_success_rate: number;
  avg_attempts: number;
  avg_duration_ms: number;
  top_error_keywords: Array<{ keyword: string; count: number }>;
}

export interface GenerationRecord {
  id: string;
  schema_name: string | null;
  prompt: string;
  success: number;
  total_attempts: number;
  final_output: string | null;
  errors: string | null;
  duration_ms: number;
  created_at: string;
}
