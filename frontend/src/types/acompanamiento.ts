export type ObservationContent = {
  tags_selected?: string[];
  audio_transcription?: string;
  general_notes?: string;
  scores?: Record<string, number>; // Ej: { "activacion_cognitiva": 4 }
}

export interface ObservationCycle {
  id: string;
  teacher_id: string;
  observer_id: string;
  status: 'planned' | 'in_progress' | 'completed';
  scheduled_at?: string; // ISO String for timestamptz
  subject_context?: string; // Asignatura y curso
  teacher_agreed?: boolean;
  teacher_declared_focus?: any; // jsonb para tags seleccionados en pre-observación
  created_at: string;
  updated_at: string;
}

export interface ObservationData {
  id: string;
  cycle_id: string;
  stage: 'pre' | 'execution' | 'reflection';
  content: ObservationContent;
  created_at: string;
  updated_at: string;
}

export interface TeacherSkill {
  id: string;
  teacher_id: string;
  skill_name: string;
  xp_points: number;
  level: string;
  created_at: string;
  updated_at: string;
}
