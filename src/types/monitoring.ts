export interface AnomalyEvent {
  id: string;
  metric: string;
  model: string | null;
  anomaly_type: 'spike' | 'drop' | 'drift' | 'outlier';
  severity: 'info' | 'warning' | 'critical';
  actual_value: number;
  expected_min: number | null;
  expected_max: number | null;
  z_score: number | null;
  description: string;
  acknowledged: number;
  created_at: string;
}

export interface DriftEvent {
  id: string;
  metric: string;
  model: string | null;
  drift_type: 'accuracy' | 'cost' | 'latency' | 'quality';
  direction: 'improving' | 'degrading';
  baseline_value: number;
  current_value: number;
  change_pct: number;
  window_days: number;
  description: string;
  acknowledged: number;
  created_at: string;
}

export interface MonitoringOverview {
  anomalyStats: {
    total: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
    unacknowledged: number;
  };
  driftStats: {
    total: number;
    degrading: number;
    improving: number;
    byType: Record<string, number>;
    unacknowledged: number;
  };
  recentAnomalies: AnomalyEvent[];
  recentDrifts: DriftEvent[];
  systemHealth: 'healthy' | 'degraded' | 'critical';
}

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: 'gt' | 'lt' | 'eq';
  threshold: number;
  enabled: number;
  severity: string;
  evaluation_window_minutes: number;
  cooldown_minutes: number;
  last_evaluated_at: string | null;
  created_at: string;
}

export interface AlertEvent {
  id: string;
  rule_id: string;
  rule_name: string;
  metric: string;
  actual_value: number;
  threshold: number;
  acknowledged: number;
  created_at: string;
}

export interface EvaluationResult {
  rule_id: string;
  rule_name: string;
  triggered: boolean;
  actual_value: number;
  threshold: number;
  severity: string;
  message: string;
}

export interface MetricSnapshot {
  id: string;
  metric: string;
  model: string | null;
  value: number;
  sample_count: number;
  window_minutes: number;
  created_at: string;
}

export interface DriftResult {
  has_drift: boolean;
  direction: 'improving' | 'degrading' | 'stable';
  baseline_value: number;
  current_value: number;
  change_pct: number;
  description: string;
}
