export interface StrategicGoal {
  id: string;
  school_id?: string;
  title: string;
  description?: string;
  academic_year?: number;
  status: 'active' | 'completed' | 'archived';
  created_by?: string;
  created_at: string;
  updated_at: string;
  pme_action_link?: string;
  // Anidaciones para UI
  implementation_phases?: ImplementationPhase[];
  pme_actions?: { title: string; dimension: string };
}

export interface ImplementationPhase {
  id: string;
  goal_id: string;
  title: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'in_progress' | 'completed';
  leader_id?: string;
  created_at: string;
  updated_at: string;
  // Anidaciones para UI
  indicators?: Indicator[];
  enablers?: Enabler[];
  phase_tasks?: PhaseTask[];
}

export interface PhaseTask {
  id: string;
  phase_id: string;
  title: string;
  assignee_id?: string;
  status: 'pending' | 'in_progress' | 'completed';
  due_date?: string;
  created_at?: string;
}

export interface Indicator {
  id: string;
  phase_id: string;
  description: string;
  target_value: number;
  current_value: number;
  metric_type?: 'percentage' | 'average_score' | 'count';
  data_source?: 'manual' | 'radar_360';
  radar_axis_reference?: string;
  created_at: string;
  updated_at: string;
}

export interface Enabler {
  id: string;
  phase_id: string;
  description: string;
  resource_type?: 'time' | 'training' | 'technology' | 'material';
  status: 'requested' | 'approved' | 'provided';
  estimated_cost?: number;
  created_at: string;
  updated_at: string;
}

export interface IterationCycle {
  id: string;
  phase_id: string;
  review_date: string;
  impact_measurement: string;
  evaluation_notes: string;
  feedback_action: string;
  decision?: 'maintain' | 'pivot' | 'scale';
  created_by: string;
  created_at: string;
}
