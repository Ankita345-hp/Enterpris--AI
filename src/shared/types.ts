export type UserRole = 'admin' | 'manager' | 'user';

export type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash?: string;
  role: UserRole;
  department: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStep {
  step_number: number;
  action_name: string;
  ai_automation_enabled: boolean;
  expected_output: string;
  status?: 'pending' | 'running' | 'completed' | 'failed';
  execution_output?: string;
  executed_at?: string;
}

export interface WorkflowAIMetadata {
  workflow_title?: string;
  department?: string;
  steps: WorkflowStep[];
  risk_assessment: string;
  confidence_score?: number;
  execution_logs?: string[];
  last_executed_at?: string;
}

export interface Workflow {
  id: string;
  title: string;
  description: string;
  category: string;
  status: WorkflowStatus;
  created_by: string;
  creator_name?: string;
  creator_email?: string;
  creator_department?: string;
  ai_metadata: WorkflowAIMetadata;
  created_at: string;
  updated_at?: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_name?: string;
  user_email?: string;
  action: string;
  details: Record<string, any>;
  ip_address: string;
  created_at: string;
}

export interface DocumentAnalysisResult {
  report_title: string;
  department: string;
  executive_summary: string;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  confidence_score: number;
  key_metrics: {
    metric: string;
    value: string;
    trend: 'positive' | 'negative' | 'neutral';
  }[];
  detected_anomalies: {
    severity: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    potential_impact: string;
  }[];
  strategic_recommendations: {
    action: string;
    urgency: 'immediate' | 'short-term' | 'medium-term';
    estimated_roi: string;
    recommended_workflow?: string;
  }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  structured_data?: {
    recommendations?: string[];
    risk_factors?: string[];
    suggested_workflows?: string[];
    key_metrics?: Record<string, string>;
  };
}
