export interface HoldingSchool {
  id: string;
  name: string;
  location: string;
  health_score: number;
  status: 'active' | 'warning' | 'critical';
  trend_data: number[];
  enrollment: number;
  total_goals: number;
  completed_goals: number;
  critical_alerts: number;
}

export interface HoldingSummary {
  total_schools: number;
  global_avg_health: number;
  schools_active: number;
  schools_at_risk: number;
  total_budget?: string;
}
