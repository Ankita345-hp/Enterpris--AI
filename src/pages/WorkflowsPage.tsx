import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { WorkflowBuilder } from '../components/WorkflowBuilder.tsx';
import { Workflow, WorkflowStep } from '../shared/types.ts';
import {
  GitBranch,
  Play,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Terminal,
  Trash2,
  Layers,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  X,
} from 'lucide-react';

export const WorkflowsPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderTopic, setBuilderTopic] = useState('');
  const [builderDept, setBuilderDept] = useState('');

  // Filtering & Pagination
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Inspector Drawer
  const [activeWorkflow, setActiveWorkflow] = useState<Workflow | null>(null);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    // If navigation passed initial state (e.g. from Assistant)
    if (location.state?.suggestedTitle) {
      setBuilderTopic(location.state.suggestedTitle);
      if (location.state.suggestedDept) {
        setBuilderDept(location.state.suggestedDept);
      }
      setShowBuilder(true);
    }
  }, [location.state]);

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
      });
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (search) params.append('search', search);

      const res = await api.get(`/workflows?${params.toString()}`);
      setWorkflows(res.data.workflows);
      setTotalPages(res.data.pagination.totalPages);

      // Refresh active workflow if open
      if (activeWorkflow) {
        const updated = res.data.workflows.find((w: Workflow) => w.id === activeWorkflow.id);
        if (updated) setActiveWorkflow(updated);
      }
    } catch (err) {
      console.error('Failed to load workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, [page, categoryFilter, statusFilter, search, user]);

  const handleExecuteWorkflow = async (wf: Workflow) => {
    setExecuting(true);
    try {
      const res = await api.post(`/workflows/${wf.id}/execute`);
      setActiveWorkflow(res.data.workflow);
      await loadWorkflows();
    } catch (err) {
      console.error('Execution failed:', err);
    } finally {
      setExecuting(false);
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow pipeline?')) return;
    try {
      await api.delete(`/workflows/${id}`);
      if (activeWorkflow?.id === id) setActiveWorkflow(null);
      await loadWorkflows();
    } catch (err) {
      console.error('Failed to delete workflow:', err);
    }
  };

  const categories = [
    'all',
    'Operations & Supply Chain',
    'Finance & Procurement',
    'Human Resources & Workforce',
    'Customer Success & Support',
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60';
      case 'running':
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60';
      case 'failed':
        return 'bg-rose-950/80 text-rose-300 border-rose-800/60';
      default:
        return 'bg-amber-950/80 text-amber-300 border-amber-800/60';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">AI Workflow Automation Engine</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Build, execute, and monitor deterministic enterprise automations powered by Google Gemini.
          </p>
        </div>

        <button
          onClick={() => setShowBuilder(!showBuilder)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
        >
          {showBuilder ? (
            <>
              <X className="w-4 h-4" />
              <span>Close Studio</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Synthesize New Workflow</span>
            </>
          )}
        </button>
      </div>

      {/* Builder Modal/Drawer if open */}
      {showBuilder && (
        <WorkflowBuilder
          initialTopic={builderTopic}
          initialDepartment={builderDept}
          onWorkflowCreated={(newWf) => {
            setShowBuilder(false);
            setActiveWorkflow(newWf);
            loadWorkflows();
          }}
          onCancel={() => setShowBuilder(false)}
        />
      )}

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workflows by title, category, or description..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-xl text-xs bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 transition"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'all' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 rounded-xl text-xs bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Main Workflows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span>Fetching enterprise workflow pipelines...</span>
            </div>
          </div>
        ) : workflows.length === 0 ? (
          <div className="col-span-full p-12 rounded-2xl bg-slate-900/60 border border-dashed border-slate-800 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-300">No workflows found for the selected filter or permissions.</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Synthesize a new workflow with Gemini or adjust your category and search parameters.
            </p>
            <button
              onClick={() => setShowBuilder(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition"
            >
              Create New Workflow
            </button>
          </div>
        ) : (
          workflows.map((wf) => {
            const steps = wf.ai_metadata?.steps || [];
            const isSelected = activeWorkflow?.id === wf.id;

            return (
              <div
                key={wf.id}
                onClick={() => setActiveWorkflow(wf)}
                className={`p-5 rounded-2xl bg-slate-900/90 border transition cursor-pointer flex flex-col justify-between space-y-4 group ${
                  isSelected
                    ? 'border-indigo-500 shadow-lg shadow-indigo-500/10'
                    : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 font-mono">
                      {wf.category}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getStatusBadge(wf.status)}`}>
                      {wf.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-200 transition line-clamp-2">
                    {wf.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {wf.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>{steps.length} Pipeline Steps</span>
                  </span>

                  <span className="flex items-center gap-1 text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-slate-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Active Workflow Inspector Modal / Slide-out */}
      {activeWorkflow && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end transition-opacity">
          <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto p-6 space-y-6 shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Top Bar */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider font-mono">
                    {activeWorkflow.category}
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getStatusBadge(activeWorkflow.status)}`}>
                    {activeWorkflow.status}
                  </span>
                </div>
                <h2 className="text-base font-bold text-white">{activeWorkflow.title}</h2>
                <p className="text-xs text-slate-400">{activeWorkflow.description}</p>
              </div>

              <button
                onClick={() => setActiveWorkflow(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Execution Trigger Bar */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white block">Execution Engine</span>
                <span className="text-[11px] text-slate-400">
                  {activeWorkflow.ai_metadata?.last_executed_at
                    ? `Last executed: ${new Date(activeWorkflow.ai_metadata.last_executed_at).toLocaleString()}`
                    : 'Awaiting execution trigger'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {(user?.role === 'admin' || activeWorkflow.created_by === user?.id) && (
                  <button
                    onClick={() => handleDeleteWorkflow(activeWorkflow.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                    title="Delete Workflow"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => handleExecuteWorkflow(activeWorkflow)}
                  disabled={executing}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {executing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Executing Agents...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Execute Workflow via Gemini</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Risk Assessment Box */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-indigo-900/40 text-xs space-y-1">
              <span className="text-[11px] uppercase font-bold text-indigo-300">Governance & Risk Analysis</span>
              <p className="text-slate-300 leading-relaxed">
                {activeWorkflow.ai_metadata?.risk_assessment || 'Standard enterprise operational policy.'}
              </p>
            </div>

            {/* Sequential Pipeline Steps */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Pipeline Execution Steps
              </h3>

              <div className="space-y-3">
                {(activeWorkflow.ai_metadata?.steps || []).map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-900/60 text-indigo-300 text-[11px] font-bold flex items-center justify-center border border-indigo-700/60">
                          {step.step_number}
                        </span>
                        <span className="font-semibold text-white">{step.action_name}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {step.ai_automation_enabled && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                            AI Agent
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                            step.status === 'completed'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {step.status || 'pending'}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 pl-7">
                      <strong className="text-slate-300">Expected:</strong> {step.expected_output}
                    </p>

                    {step.execution_output && (
                      <div className="ml-7 p-2.5 rounded-lg bg-slate-900 border border-emerald-900/50 text-[11px] text-emerald-300 font-mono">
                        <strong className="text-emerald-400">Result:</strong> {step.execution_output}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Execution Audit Logs */}
            {activeWorkflow.ai_metadata?.execution_logs && activeWorkflow.ai_metadata.execution_logs.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Agent Execution Console Stream</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                  {activeWorkflow.ai_metadata.execution_logs.map((log, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-indigo-400">&gt;</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
