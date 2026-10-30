import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  department: z.string().min(2, "Department is required"),
  role: z.enum(['admin', 'manager', 'user']).optional()
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const workflowSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().optional(),
  category: z.string().min(2, "Category is required"),
  steps: z.array(z.object({
    step_number: z.number(),
    action_name: z.string().min(2, "Action name required"),
    ai_automation_enabled: z.boolean(),
    expected_output: z.string().min(2, "Expected output required")
  })).optional(),
  risk_assessment: z.string().optional()
});

export const workflowGenerateSchema = z.object({
  topic: z.string().min(3, "Please specify a business process or goal"),
  department: z.string().min(2, "Department is required"),
  desired_outcomes: z.string().optional(),
  compliance_level: z.enum(['standard', 'strict', 'mission_critical']).optional()
});

export const analysisSchema = z.object({
  content: z.string().min(10, "Content to analyze must be at least 10 characters"),
  document_type: z.enum(['operational_report', 'financial_ledger', 'logistics_manifest', 'support_tickets', 'general_data']),
  department: z.string().min(2, "Department is required"),
  focus_area: z.string().optional()
});

export const chatSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  department: z.string().optional(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })).optional()
});
