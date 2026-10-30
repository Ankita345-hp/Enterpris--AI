import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import {
  findUserByEmail,
  createUser,
  listUsers,
  listWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  addAuditLog,
  listAuditLogs,
  getEnterpriseStats,
} from './server/db.ts';
import {
  generateToken,
  requireAuth,
  requireRole,
  getReqIp,
  AuthenticatedRequest,
} from './server/auth.ts';
import {
  generateEnterpriseWorkflow,
  executeWorkflowSteps,
  analyzeEnterpriseDocument,
  chatWithEnterpriseStrategist,
} from './server/gemini.ts';
import {
  signupSchema,
  loginSchema,
  workflowSchema,
  workflowGenerateSchema,
  analysisSchema,
  chatSchema,
} from './src/shared/schemas.ts';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Enterprise AI Suite Platform',
    version: '2.5.0',
  });
});

// ----------------------------------------------------
// Authentication Routes
// ----------------------------------------------------

// POST /api/auth/signup — Register a new enterprise user
app.post('/api/auth/signup', async (req, res) => {
  try {
    const parseResult = signupSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.format(),
      });
      return;
    }

    const { name, email, password, department, role } = parseResult.data;
    const existing = findUserByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'A user with this email address already exists.' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);
    const newUser = createUser({
      name,
      email,
      password_hash,
      department,
      role: role || 'user',
    });

    const token = generateToken(newUser);
    const ip = getReqIp(req);

    addAuditLog({
      user_id: newUser.id,
      user_name: newUser.name,
      user_email: newUser.email,
      action: 'AUTH_SIGNUP',
      details: { department: newUser.department, role: newUser.role },
      ip_address: ip,
    });

    res.status(201).json({
      message: 'Enterprise account created successfully.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        created_at: newUser.created_at,
      },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// POST /api/auth/login — Authenticate user and issue JWT token
app.post('/api/auth/login', async (req, res) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Invalid email or password format.' });
      return;
    }

    const { email, password } = parseResult.data;
    const user = findUserByEmail(email);
    if (!user || !user.password_hash) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(user);
    const ip = getReqIp(req);

    addAuditLog({
      user_id: user.id,
      user_name: user.name,
      user_email: user.email,
      action: 'AUTH_LOGIN',
      details: { role: user.role, department: user.department },
      ip_address: ip,
    });

    res.json({
      message: 'Authentication successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        created_at: user.created_at,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during authentication.' });
  }
});

// GET /api/users/profile — Retrieve authenticated user profile
app.get('/api/users/profile', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    created_at: user.created_at,
  });
});

// GET /api/users — List enterprise users (Admin and Managers)
app.get('/api/users', requireAuth, requireRole(['admin', 'manager']), (req: AuthenticatedRequest, res) => {
  const users = listUsers();
  res.json({ users });
});

// ----------------------------------------------------
// Workflows API Routes
// ----------------------------------------------------

// GET /api/workflows — List all accessible workflows with pagination and filters
app.get('/api/workflows', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const category = req.query.category as string | undefined;
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;

    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 15);

    const allWorkflows = listWorkflows(user, { category, status, search });
    const total = allWorkflows.length;
    const startIndex = (page - 1) * limit;
    const paginated = allWorkflows.slice(startIndex, startIndex + limit);

    res.json({
      workflows: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err: any) {
    console.error('List workflows error:', err);
    res.status(500).json({ error: 'Failed to retrieve workflows.' });
  }
});

// GET /api/workflows/:id — Get workflow details
app.get('/api/workflows/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const wf = getWorkflowById(req.params.id, user);
  if (!wf) {
    res.status(404).json({ error: 'Workflow not found or access restricted.' });
    return;
  }
  res.json({ workflow: wf });
});

// POST /api/workflows — Create and trigger a new AI workflow
app.post('/api/workflows', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const parseResult = workflowSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Validation failed', details: parseResult.error.format() });
      return;
    }

    const { title, description, category, steps, risk_assessment } = parseResult.data;

    const newWorkflow = createWorkflow(
      {
        title,
        description,
        category,
        ai_metadata: {
          workflow_title: title,
          department: user.department,
          steps: steps || [],
          risk_assessment: risk_assessment || 'Standard enterprise operational procedure.',
          confidence_score: 95.0,
          execution_logs: [`Workflow initialized by ${user.name} (${user.role}).`],
        },
      },
      user
    );

    addAuditLog({
      user_id: user.id,
      user_name: user.name,
      user_email: user.email,
      action: 'WORKFLOW_CREATED',
      details: { workflow_id: newWorkflow.id, title: newWorkflow.title, category: newWorkflow.category },
      ip_address: getReqIp(req),
    });

    res.status(201).json({
      message: 'Workflow created successfully.',
      workflow: newWorkflow,
    });
  } catch (err: any) {
    console.error('Create workflow error:', err);
    res.status(500).json({ error: 'Failed to create workflow.' });
  }
});

// PUT /api/workflows/:id — Update workflow
app.put('/api/workflows/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const updated = updateWorkflow(req.params.id, req.body, user);
    if (!updated) {
      res.status(404).json({ error: 'Workflow not found or not permitted to modify.' });
      return;
    }

    addAuditLog({
      user_id: user.id,
      user_name: user.name,
      user_email: user.email,
      action: 'WORKFLOW_UPDATED',
      details: { workflow_id: updated.id, status: updated.status },
      ip_address: getReqIp(req),
    });

    res.json({ message: 'Workflow updated successfully.', workflow: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update workflow.' });
  }
});

// DELETE /api/workflows/:id — Delete workflow
app.delete('/api/workflows/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const success = deleteWorkflow(req.params.id, user);
  if (!success) {
    res.status(403).json({ error: 'Cannot delete workflow. Insufficient permissions.' });
    return;
  }

  addAuditLog({
    user_id: user.id,
    user_name: user.name,
    user_email: user.email,
    action: 'WORKFLOW_DELETED',
    details: { workflow_id: req.params.id },
    ip_address: getReqIp(req),
  });

  res.json({ message: 'Workflow deleted successfully.' });
});

// POST /api/workflows/:id/execute — Execute workflow with Gemini Agent
app.post('/api/workflows/:id/execute', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const wf = getWorkflowById(req.params.id, user);
    if (!wf) {
      res.status(404).json({ error: 'Workflow not found or access restricted.' });
      return;
    }

    // Set to running
    updateWorkflow(wf.id, { status: 'running' }, user);

    const steps = wf.ai_metadata?.steps || [];
    const executionResult = await executeWorkflowSteps(wf.title, wf.category, steps);

    const updatedWf = updateWorkflow(
      wf.id,
      {
        status: executionResult.overallSuccess ? 'completed' : 'failed',
        ai_metadata: {
          ...wf.ai_metadata,
          steps: executionResult.updatedSteps,
          execution_logs: [...(wf.ai_metadata.execution_logs || []), ...executionResult.logs],
          last_executed_at: new Date().toISOString(),
        },
      },
      user
    );

    addAuditLog({
      user_id: user.id,
      user_name: user.name,
      user_email: user.email,
      action: 'WORKFLOW_EXECUTED',
      details: { workflow_id: wf.id, status: updatedWf?.status, steps_count: steps.length },
      ip_address: getReqIp(req),
    });

    res.json({
      message: 'Workflow executed successfully.',
      workflow: updatedWf,
      logs: executionResult.logs,
    });
  } catch (err: any) {
    console.error('Execute workflow error:', err);
    res.status(500).json({ error: 'Failed to execute workflow execution engine.' });
  }
});

// POST /api/ai/generate-workflow — Automated generation of business workflows via Gemini
app.post('/api/ai/generate-workflow', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const parseResult = workflowGenerateSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Validation failed', details: parseResult.error.format() });
      return;
    }

    const { topic, department, desired_outcomes, compliance_level } = parseResult.data;

    const generatedMetadata = await generateEnterpriseWorkflow({
      topic,
      department: department || user.department,
      desired_outcomes,
      compliance_level,
    });

    addAuditLog({
      user_id: user.id,
      user_name: user.name,
      user_email: user.email,
      action: 'AI_WORKFLOW_GENERATED',
      details: { topic, department },
      ip_address: getReqIp(req),
    });

    res.json({
      message: 'Enterprise workflow synthesized by Gemini.',
      metadata: generatedMetadata,
    });
  } catch (err: any) {
    console.error('Generate workflow error:', err);
    res.status(500).json({ error: 'Failed to generate workflow with Gemini.' });
  }
});

// ----------------------------------------------------
// AI Document & Data Analyzer Routes
// ----------------------------------------------------

// POST /api/ai/analyze — Process operational data or documents using Gemini
app.post('/api/ai/analyze', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const parseResult = analysisSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Validation failed', details: parseResult.error.format() });
      return;
    }

    const { content, document_type, department, focus_area } = parseResult.data;

    const analysisResult = await analyzeEnterpriseDocument({
      content,
      document_type,
      department,
      focus_area,
    });

    addAuditLog({
      user_id: user.id,
      user_name: user.name,
      user_email: user.email,
      action: 'AI_DOCUMENT_ANALYSIS',
      details: {
        document_type,
        department,
        risk_level: analysisResult.risk_level,
        anomalies_detected: analysisResult.detected_anomalies.length,
      },
      ip_address: getReqIp(req),
    });

    res.json({
      message: 'Document and telemetry analysis completed.',
      result: analysisResult,
    });
  } catch (err: any) {
    console.error('Analyze document error:', err);
    res.status(500).json({ error: 'Failed to analyze enterprise data.' });
  }
});

// ----------------------------------------------------
// Contextual AI Enterprise Assistant Routes
// ----------------------------------------------------

// POST /api/ai/chat — Contextual enterprise assistant endpoint
app.post('/api/ai/chat', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const parseResult = chatSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Validation failed', details: parseResult.error.format() });
      return;
    }

    const { message, department, history } = parseResult.data;

    const chatResponse = await chatWithEnterpriseStrategist({
      message,
      department: department || user.department,
      history,
    });

    addAuditLog({
      user_id: user.id,
      user_name: user.name,
      user_email: user.email,
      action: 'AI_STRATEGIST_CONSULTATION',
      details: { department: user.department, prompt_preview: message.slice(0, 50) },
      ip_address: getReqIp(req),
    });

    res.json({
      reply: chatResponse.content,
      structured_data: chatResponse.structured_data,
    });
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Failed to communicate with Enterprise AI Advisor.' });
  }
});

// ----------------------------------------------------
// Audit Trail & Metrics Routes
// ----------------------------------------------------

// GET /api/audit-logs — Retrieve audit trails
app.get('/api/audit-logs', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const logs = listAuditLogs(user);
    res.json({ logs });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve audit trail.' });
  }
});

// GET /api/stats — Retrieve enterprise high-level KPIs
app.get('/api/stats', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const stats = getEnterpriseStats(user);
    res.json({ stats });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to calculate enterprise metrics.' });
  }
});

// ----------------------------------------------------
// Frontend Serving Setup (Vite in Dev / Static in Prod)
// ----------------------------------------------------

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Enterprise AI Suite] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup failed:', err);
});
