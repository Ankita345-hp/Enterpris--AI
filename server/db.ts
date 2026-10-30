import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User, Workflow, AuditLog } from '../src/shared/types.ts';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'enterprise_store.json');

interface DatabaseStore {
  users: User[];
  workflows: Workflow[];
  audit_logs: AuditLog[];
}

function ensureDbFile(): DatabaseStore {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (err) {
      console.warn('Failed to parse database file, re-initializing store.', err);
    }
  }

  const initialStore = seedDatabase();
  fs.writeFileSync(DB_FILE, JSON.stringify(initialStore, null, 2), 'utf-8');
  return initialStore;
}

let storeCache: DatabaseStore | null = null;

function getStore(): DatabaseStore {
  if (!storeCache) {
    storeCache = ensureDbFile();
  }
  return storeCache;
}

function saveStore(store: DatabaseStore) {
  storeCache = store;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write database store:', err);
  }
}

function seedDatabase(): DatabaseStore {
  const adminPassHash = bcrypt.hashSync('AdminPass123!', 10);
  const managerPassHash = bcrypt.hashSync('ManagerPass123!', 10);
  const userPassHash = bcrypt.hashSync('UserPass123!', 10);

  const adminId = 'd87c2b3e-1111-4444-9999-000000000001';
  const managerId = 'd87c2b3e-2222-4444-9999-000000000002';
  const userId = 'd87c2b3e-3333-4444-9999-000000000003';
  const hrManagerId = 'd87c2b3e-4444-4444-9999-000000000004';
  const financeManagerId = 'd87c2b3e-5555-4444-9999-000000000005';

  const users: User[] = [
    {
      id: adminId,
      name: 'Dr. Elena Rostova',
      email: 'admin@enterprise.ai',
      password_hash: adminPassHash,
      role: 'admin',
      department: 'Executive',
      created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    },
    {
      id: managerId,
      name: 'Marcus Vance',
      email: 'manager@enterprise.ai',
      password_hash: managerPassHash,
      role: 'manager',
      department: 'Operations',
      created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 20).toISOString(),
    },
    {
      id: userId,
      name: 'Sarah Chen',
      email: 'user@enterprise.ai',
      password_hash: userPassHash,
      role: 'user',
      department: 'Operations',
      created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    },
    {
      id: hrManagerId,
      name: 'Devon Miller',
      email: 'hr.lead@enterprise.ai',
      password_hash: managerPassHash,
      role: 'manager',
      department: 'Human Resources',
      created_at: new Date(Date.now() - 86400000 * 18).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 18).toISOString(),
    },
    {
      id: financeManagerId,
      name: 'Alicia Zhang',
      email: 'finance@enterprise.ai',
      password_hash: managerPassHash,
      role: 'manager',
      department: 'Finance',
      created_at: new Date(Date.now() - 86400000 * 25).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 25).toISOString(),
    },
  ];

  const workflows: Workflow[] = [
    {
      id: 'wf-1001-invoice-reconcile',
      title: 'Automated Invoice Anomaly Detection & ERP Reconciliation',
      description: 'Ingests vendor accounts payable invoices, parses line items via Gemini OCR, detects variance anomalies, and auto-posts compliant entries to SAP.',
      category: 'Finance & Procurement',
      status: 'completed',
      created_by: financeManagerId,
      creator_name: 'Alicia Zhang',
      creator_email: 'finance@enterprise.ai',
      creator_department: 'Finance',
      ai_metadata: {
        workflow_title: 'Automated Invoice Anomaly Detection & ERP Reconciliation',
        department: 'Finance',
        risk_assessment: 'Low risk. Automatic human-in-the-loop escalation triggered for variance discrepancies exceeding 5% or $10,000 threshold.',
        confidence_score: 98.4,
        steps: [
          {
            step_number: 1,
            action_name: 'Ingest and Normalize Multi-Format Invoices (PDF/EDI)',
            ai_automation_enabled: true,
            expected_output: 'Structured JSON payload with normalized supplier IDs, PO reference, and tax subtotals.',
            status: 'completed',
            execution_output: '142 incoming invoices normalized. 100% field extraction confidence.',
            executed_at: new Date(Date.now() - 3600000 * 4).toISOString(),
          },
          {
            step_number: 2,
            action_name: 'Three-Way Matching against Open Purchase Orders & Receipt Slips',
            ai_automation_enabled: true,
            expected_output: 'Line-by-line price and quantity variance matrix.',
            status: 'completed',
            execution_output: 'Matched 139 invoices cleanly. 3 invoices flagged for price discrepancy ($4,120 net variance).',
            executed_at: new Date(Date.now() - 3600000 * 3).toISOString(),
          },
          {
            step_number: 3,
            action_name: 'Audit Trail Signature & SAP Journal Entry Auto-Post',
            ai_automation_enabled: true,
            expected_output: 'ERP transaction reference ID and immutable cryptographic audit timestamp.',
            status: 'completed',
            execution_output: 'Entries committed to SAP S/4HANA (Batch ID #SAP-88219). Clean audit receipt generated.',
            executed_at: new Date(Date.now() - 3600000 * 2).toISOString(),
          },
        ],
        execution_logs: [
          'Workflow triggered on scheduled procurement cycle.',
          'OCR parser extracted line items with 99.2% accuracy.',
          'Three-way match completed in 1.4 seconds.',
          'Audit trail written with SHA-256 batch signature.',
        ],
        last_executed_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 'wf-1002-logistics-delay',
      title: 'Global Supply Chain Bottleneck & Port Congestion Mitigator',
      description: 'Monitors real-time trans-Pacific freight schedules, port customs dwell times, and generates dynamic multi-modal rerouting plans.',
      category: 'Operations & Supply Chain',
      status: 'running',
      created_by: managerId,
      creator_name: 'Marcus Vance',
      creator_email: 'manager@enterprise.ai',
      creator_department: 'Operations',
      ai_metadata: {
        workflow_title: 'Global Supply Chain Bottleneck & Port Congestion Mitigator',
        department: 'Operations',
        risk_assessment: 'Moderate risk. Rerouting air freight incurs incremental expense requiring operations VP sign-off.',
        confidence_score: 94.2,
        steps: [
          {
            step_number: 1,
            action_name: 'Telemetry Ingestion from AIS Marine Transponders & Port Authorities',
            ai_automation_enabled: true,
            expected_output: 'Estimated Time of Berthing (ETB) delta matrix across 12 primary hub ports.',
            status: 'completed',
            execution_output: 'Long Beach & Rotterdam berths reporting 4.2 day average queue delays.',
            executed_at: new Date(Date.now() - 3600000 * 1).toISOString(),
          },
          {
            step_number: 2,
            action_name: 'Predictive ETA Slippage Impact Modeling on Assembly Lines',
            ai_automation_enabled: true,
            expected_output: 'Stockout probability risk scores per manufacturing plant.',
            status: 'running',
            execution_output: 'Evaluating 18 SKU clusters for Plant Beta (Austin, TX).',
          },
          {
            step_number: 3,
            action_name: 'Dynamic Intermodal Freight Reallocation & Carrier Tender',
            ai_automation_enabled: true,
            expected_output: 'Optimized dry-van and rail intermodal dispatch assignments with cost impact.',
            status: 'pending',
          },
        ],
        execution_logs: [
          'Carrier AIS feed streaming active.',
          'Container dwell time at Port of Long Beach exceeding threshold (+48h).',
          'Agent initiating predictive stockout simulation...',
        ],
        last_executed_at: new Date(Date.now() - 3600000 * 1).toISOString(),
      },
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'wf-1003-onboarding-automation',
      title: 'Enterprise Employee Onboarding & Cross-System Provisioning',
      description: 'Automates identity provisioning across Okta, GitHub Enterprise, Jira, and generates role-tailored technical 30-day learning curricula.',
      category: 'Human Resources & Workforce',
      status: 'completed',
      created_by: hrManagerId,
      creator_name: 'Devon Miller',
      creator_email: 'hr.lead@enterprise.ai',
      creator_department: 'Human Resources',
      ai_metadata: {
        workflow_title: 'Enterprise Employee Onboarding & Cross-System Provisioning',
        department: 'Human Resources',
        risk_assessment: 'Low risk. Enforces least-privilege RBAC role templates approved by Information Security.',
        confidence_score: 99.1,
        steps: [
          {
            step_number: 1,
            action_name: 'HRIS New Hire Ingestion & Identity Record Creation',
            ai_automation_enabled: true,
            expected_output: 'Enterprise employee profile with assigned department and role taxonomy.',
            status: 'completed',
            execution_output: 'Provisioned 8 new hires for Q4 engineering and product cohorts.',
            executed_at: new Date(Date.now() - 86400000 * 1).toISOString(),
          },
          {
            step_number: 2,
            action_name: 'Automated Zero-Trust RBAC & Hardware Dispatch Order',
            ai_automation_enabled: true,
            expected_output: 'Okta group memberships assigned and IT asset serial logged.',
            status: 'completed',
            execution_output: 'SSO access granted to Slack, Jira, and Figma. MacBook Pro dispatch confirmed via FedEx.',
            executed_at: new Date(Date.now() - 86400000 * 1).toISOString(),
          },
          {
            step_number: 3,
            action_name: 'AI-Generated Departmental Onboarding Roadmap & Mentor Pairing',
            ai_automation_enabled: true,
            expected_output: 'Personalized 30-60-90 day milestone dashboard with buddy assignment.',
            status: 'completed',
            execution_output: 'Personalized onboarding roadmap delivered to new hires via enterprise portal.',
            executed_at: new Date(Date.now() - 86400000 * 1).toISOString(),
          },
        ],
        execution_logs: [
          'HRIS webhook received from Workday.',
          'Zero-trust policy checked with SecOps agent.',
          'Accounts generated with SSO MFA enforcement.',
        ],
        last_executed_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'wf-1004-sla-breach-prevention',
      title: 'Customer Success SLA Breach Prevention & Sentiment Triage',
      description: 'Continuously monitors Zendesk and Salesforce Service Cloud ticket backlogs, detects customer churn sentiment, and escalates high-risk accounts.',
      category: 'Customer Success & Support',
      status: 'pending',
      created_by: adminId,
      creator_name: 'Dr. Elena Rostova',
      creator_email: 'admin@enterprise.ai',
      creator_department: 'Executive',
      ai_metadata: {
        workflow_title: 'Customer Success SLA Breach Prevention & Sentiment Triage',
        department: 'Customer Success',
        risk_assessment: 'Low risk. Automatic re-assignment to Tier-3 support engineers with Slack alert.',
        confidence_score: 96.0,
        steps: [
          {
            step_number: 1,
            action_name: 'Real-time NLP Sentiment and Urgency Scoring',
            ai_automation_enabled: true,
            expected_output: 'Aggregated sentiment score (-1.0 to +1.0) and contract ARR impact weighting with tickets flagged for immediate escalation.',
            status: 'pending',
          },
          {
            step_number: 2,
            action_name: 'Automated Draft Solution Synthesis from Internal Knowledge Base',
            ai_automation_enabled: true,
            expected_output: 'Context-grounded resolution draft with verified documentation citations.',
            status: 'pending',
          },
          {
            step_number: 3,
            action_name: 'CSM Slack Incident Bridge & SLA Countdown Timer',
            ai_automation_enabled: true,
            expected_output: 'Urgent incident war-room creation if SLA expiry is < 45 minutes.',
            status: 'pending',
          },
        ],
        execution_logs: [
          'Workflow configured for continuous polling every 15 minutes.',
          'Awaiting scheduled batch trigger.',
        ],
      },
      created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: 'wf-1005-freight-fuel-audit',
      title: 'Ocean & Air Freight Fuel Surcharge Compliance Audit',
      description: 'Audits carrier invoices against Platts Bunker Index and agreed contractual fuel surcharges to recover carrier over-billing.',
      category: 'Operations & Supply Chain',
      status: 'completed',
      created_by: userId,
      creator_name: 'Sarah Chen',
      creator_email: 'user@enterprise.ai',
      creator_department: 'Operations',
      ai_metadata: {
        workflow_title: 'Ocean & Air Freight Fuel Surcharge Compliance Audit',
        department: 'Operations',
        risk_assessment: 'Very low risk. Disputed amounts generate pre-formatted credit note requests to 3PL partners.',
        confidence_score: 99.5,
        steps: [
          {
            step_number: 1,
            action_name: 'Carrier Rate Sheet Ingestion & Benchmark Rate Lookup',
            ai_automation_enabled: true,
            expected_output: 'Parsed monthly BAF (Bunker Adjustment Factor) index parameters.',
            status: 'completed',
            execution_output: 'Parsed 31 ocean freight contract schedules. Benchmarks verified.',
            executed_at: new Date(Date.now() - 86400000 * 4).toISOString(),
          },
          {
            step_number: 2,
            action_name: 'Audit Calculation across 480 Bill-of-Ladings',
            ai_automation_enabled: true,
            expected_output: 'Variance report flagging non-compliant surcharge calculations.',
            status: 'completed',
            execution_output: 'Discovered $34,800 in overbilled BAF fuel surcharges across 4 major carriers.',
            executed_at: new Date(Date.now() - 86400000 * 4).toISOString(),
          },
          {
            step_number: 3,
            action_name: 'Automated Credit Claim Generation & Carrier Notification',
            ai_automation_enabled: true,
            expected_output: 'Generated dispute letters with supporting BOL receipts.',
            status: 'completed',
            execution_output: 'Dispute letters dispatched to carriers. $28,400 already credited.',
            executed_at: new Date(Date.now() - 86400000 * 3).toISOString(),
          },
        ],
        execution_logs: [
          'Carrier rate audit completed successfully.',
          'Over-billing identified on Asia-Europe maritime routes.',
          'Credit recovery rate: 81.6%.',
        ],
        last_executed_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    },
  ];

  const audit_logs: AuditLog[] = [
    {
      id: 'log-001',
      user_id: adminId,
      user_name: 'Dr. Elena Rostova',
      user_email: 'admin@enterprise.ai',
      action: 'SYSTEM_INITIALIZATION',
      details: { component: 'Enterprise AI Suite Kernel', version: '2.5.0', security_policy: 'RBAC_ENFORCED' },
      ip_address: '10.0.4.12',
      created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    },
    {
      id: 'log-002',
      user_id: financeManagerId,
      user_name: 'Alicia Zhang',
      user_email: 'finance@enterprise.ai',
      action: 'WORKFLOW_CREATED',
      details: { workflow_id: 'wf-1001-invoice-reconcile', title: 'Automated Invoice Anomaly Detection & ERP Reconciliation' },
      ip_address: '10.0.12.88',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 'log-003',
      user_id: financeManagerId,
      user_name: 'Alicia Zhang',
      user_email: 'finance@enterprise.ai',
      action: 'WORKFLOW_EXECUTED',
      details: { workflow_id: 'wf-1001-invoice-reconcile', invoices_processed: 142, discrepancies_flagged: 3 },
      ip_address: '10.0.12.88',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'log-004',
      user_id: managerId,
      user_name: 'Marcus Vance',
      user_email: 'manager@enterprise.ai',
      action: 'AI_ANALYSIS_RUN',
      details: { document_type: 'logistics_manifest', report_name: 'Q3 Trans-Pacific Container Manifests' },
      ip_address: '10.0.8.44',
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'log-005',
      user_id: userId,
      user_name: 'Sarah Chen',
      user_email: 'user@enterprise.ai',
      action: 'WORKFLOW_EXECUTED',
      details: { workflow_id: 'wf-1005-freight-fuel-audit', recovery_amount: '$34,800' },
      ip_address: '10.0.8.52',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ];

  return { users, workflows, audit_logs };
}

// User operations
export function findUserByEmail(email: string): User | undefined {
  const store = getStore();
  return store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string): User | undefined {
  const store = getStore();
  return store.users.find((u) => u.id === id);
}

export function createUser(userData: {
  name: string;
  email: string;
  password_hash: string;
  role?: 'admin' | 'manager' | 'user';
  department: string;
}): User {
  const store = getStore();
  const newUser: User = {
    id: crypto.randomUUID(),
    name: userData.name,
    email: userData.email,
    password_hash: userData.password_hash,
    role: userData.role || 'user',
    department: userData.department,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  store.users.push(newUser);
  saveStore(store);
  return newUser;
}

export function listUsers(): Omit<User, 'password_hash'>[] {
  const store = getStore();
  return store.users.map(({ password_hash, ...rest }) => rest);
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const store = getStore();
  const index = store.users.findIndex((u) => u.id === id);
  if (index === -1) return null;

  store.users[index] = {
    ...store.users[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  saveStore(store);
  return store.users[index];
}

// Workflow operations with RLS
export function listWorkflows(user: User, filters?: { category?: string; status?: string; search?: string }): Workflow[] {
  const store = getStore();
  let workflows = [...store.workflows];

  // Apply Row-Level Security:
  // - Admin: read/write across all workflows
  // - Manager: can view & manage workflows within their department
  // - User: can only view & manage workflows created by them or in their department
  if (user.role === 'manager') {
    workflows = workflows.filter((w) => w.creator_department === user.department || w.created_by === user.id);
  } else if (user.role === 'user') {
    workflows = workflows.filter((w) => w.created_by === user.id);
  }

  if (filters?.category && filters.category !== 'all') {
    workflows = workflows.filter((w) => w.category.toLowerCase().includes(filters.category!.toLowerCase()));
  }

  if (filters?.status && filters.status !== 'all') {
    workflows = workflows.filter((w) => w.status === filters.status);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    workflows = workflows.filter(
      (w) => w.title.toLowerCase().includes(q) || w.description.toLowerCase().includes(q) || w.category.toLowerCase().includes(q)
    );
  }

  // Sort latest first
  workflows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return workflows;
}

export function getWorkflowById(id: string, user: User): Workflow | null {
  const store = getStore();
  const wf = store.workflows.find((w) => w.id === id);
  if (!wf) return null;

  // Access check
  if (user.role === 'admin') return wf;
  if (user.role === 'manager' && (wf.creator_department === user.department || wf.created_by === user.id)) return wf;
  if (user.role === 'user' && wf.created_by === user.id) return wf;

  return null;
}

export function createWorkflow(
  workflowData: {
    title: string;
    description?: string;
    category: string;
    ai_metadata?: any;
  },
  user: User
): Workflow {
  const store = getStore();
  const newWf: Workflow = {
    id: `wf-${crypto.randomUUID().slice(0, 8)}`,
    title: workflowData.title,
    description: workflowData.description || 'AI-generated enterprise automation workflow.',
    category: workflowData.category,
    status: 'pending',
    created_by: user.id,
    creator_name: user.name,
    creator_email: user.email,
    creator_department: user.department,
    ai_metadata: workflowData.ai_metadata || {
      workflow_title: workflowData.title,
      department: user.department,
      steps: [],
      risk_assessment: 'Standard operational workflow.',
    },
    created_at: new Date().toISOString(),
  };

  store.workflows.unshift(newWf);
  saveStore(store);
  return newWf;
}

export function updateWorkflow(id: string, updates: Partial<Workflow>, user: User): Workflow | null {
  const store = getStore();
  const index = store.workflows.findIndex((w) => w.id === id);
  if (index === -1) return null;

  const current = store.workflows[index];
  // Check permission
  if (user.role !== 'admin' && user.role !== 'manager' && current.created_by !== user.id) {
    return null;
  }
  if (user.role === 'manager' && current.creator_department !== user.department && current.created_by !== user.id) {
    return null;
  }

  store.workflows[index] = {
    ...current,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  saveStore(store);
  return store.workflows[index];
}

export function deleteWorkflow(id: string, user: User): boolean {
  const store = getStore();
  const index = store.workflows.findIndex((w) => w.id === id);
  if (index === -1) return false;

  const current = store.workflows[index];
  if (user.role !== 'admin' && current.created_by !== user.id) {
    return false;
  }

  store.workflows.splice(index, 1);
  saveStore(store);
  return true;
}

// Audit logs
export function addAuditLog(entry: {
  user_id: string | null;
  user_name?: string;
  user_email?: string;
  action: string;
  details: Record<string, any>;
  ip_address: string;
}): AuditLog {
  const store = getStore();
  const newLog: AuditLog = {
    id: `log-${crypto.randomUUID().slice(0, 8)}`,
    user_id: entry.user_id,
    user_name: entry.user_name || 'System / Guest',
    user_email: entry.user_email || 'system@enterprise.ai',
    action: entry.action,
    details: entry.details,
    ip_address: entry.ip_address || '127.0.0.1',
    created_at: new Date().toISOString(),
  };

  store.audit_logs.unshift(newLog);
  // Cap at 200 logs
  if (store.audit_logs.length > 200) {
    store.audit_logs = store.audit_logs.slice(0, 200);
  }
  saveStore(store);
  return newLog;
}

export function listAuditLogs(user: User): AuditLog[] {
  const store = getStore();
  if (user.role === 'admin') {
    return store.audit_logs;
  }
  if (user.role === 'manager') {
    return store.audit_logs.filter((log) => log.user_id === user.id || log.details?.department === user.department);
  }
  return store.audit_logs.filter((log) => log.user_id === user.id);
}

// Enterprise Metrics & Statistics
export function getEnterpriseStats(user: User) {
  const store = getStore();
  const allWorkflows = store.workflows;
  const userWorkflows = listWorkflows(user);

  const completedCount = userWorkflows.filter((w) => w.status === 'completed').length;
  const runningCount = userWorkflows.filter((w) => w.status === 'running').length;
  const pendingCount = userWorkflows.filter((w) => w.status === 'pending').length;
  const failedCount = userWorkflows.filter((w) => w.status === 'failed').length;

  return {
    total_workflows: userWorkflows.length,
    completed_workflows: completedCount,
    running_workflows: runningCount,
    pending_workflows: pendingCount,
    failed_workflows: failedCount,
    automation_efficiency_rate: userWorkflows.length > 0 ? Math.round((completedCount / userWorkflows.length) * 100) : 92,
    active_users_count: store.users.length,
    recent_logs: listAuditLogs(user).slice(0, 8),
    department_breakdown: {
      'Operations & Supply Chain': allWorkflows.filter((w) => w.category.includes('Operations')).length,
      'Finance & Procurement': allWorkflows.filter((w) => w.category.includes('Finance')).length,
      'Human Resources & Workforce': allWorkflows.filter((w) => w.category.includes('Human Resources')).length,
      'Customer Success & Support': allWorkflows.filter((w) => w.category.includes('Customer Success')).length,
    },
  };
}
