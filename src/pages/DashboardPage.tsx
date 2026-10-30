import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { AnalyticsChart } from '../components/AnalyticsChart.tsx';
import { Workflow } from '../shared/types.ts';
import {
  GitBranch,
  Play,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Shield,
  FileSearch,
  Bot,
  Plus,
  RefreshCw,
  Building2,
  Activity,
  Layers,
  ChevronRight,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<any>(null);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [executingId, setExecutingId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, wfRes] = await Promise.all([
        api.get('/stats'),
        api.get('/workflows?limit=6'),
      ]);
      setStats(statsRes.data.stats);
      setWorkflows(wfRes.data.workflows);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleQuickExecute = async (wfId: string) => {
    setExecutingId(wfId);
    try {
      await api.post(`/workflows/${wfId}/execute`);
      await fetchDashboardData();
    } catch (err) {
      console.error('Execution failed:', err);
    } finally {
      setExecutingId(null);
    }
  };

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
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 font-mono">
              Operational Command Center
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
              {user?.department}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {user?.role === 'admin'
              ? 'Executive oversight active: All enterprise pipelines and audit logs accessible.'
              : user?.role === 'manager'
              ? `Departmental management active: Supervising ${user?.department} workflows and agents.`
              : `Standard operational privileges active for ${user?.department}.`}
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/workflows"
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New AI Workflow</span>
          </Link>
          <Link
            to="/analytics"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <FileSearch className="w-3.5 h-3.5 text-cyan-400" />
            <span>Analyze Data</span>
          </Link>
          <Link
            to="/assistant"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Strategist</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Workflows</span>
            <GitBranch className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {loading ? '...' : stats?.total_workflows || 0}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+18% from last month</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Completed Runs</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {loading ? '...' : stats?.completed_workflows || 0}
          </div>
          <div className="text-[11px] text-slate-400">Zero error SLA adherence</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Pipelines</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {loading ? '...' : (stats?.running_workflows || 0) + (stats?.pending_workflows || 0)}
          </div>
          <div className="text-[11px] text-indigo-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Autonomous agents live</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Efficiency Yield</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {loading ? '...' : `${stats?.automation_efficiency_rate || 96}%`}
          </div>
          <div className="text-[11px] text-emerald-400">Gemini 3.8 validated</div>
        </div>
      </div>

      {/* Main Grid: Analytics Charts + Active Workflows List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Analytics Graph */}
        <div className="lg:col-span-2">
          <AnalyticsChart
            departmentStats={stats?.department_breakdown}
            efficiencyRate={stats?.automation_efficiency_rate}
          />
        </div>

        {/* Right Col: Active Workflows & Quick Trigger */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Active Pipelines</h3>
            </div>
            <Link to="/workflows" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading workflows...</div>
            ) : workflows.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No active workflows registered for this scope.
              </div>
            ) : (
              workflows.map((wf) => {
                const isExecuting = executingId === wf.id;
                return (
                  <div
                    key={wf.id}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                          {wf.category}
                        </span>
                        <h4 className="text-xs font-semibold text-slate-200 line-clamp-1 group-hover:text-white transition">
                          {wf.title}
                        </h4>
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${getStatusBadge(wf.status)}`}>
                        {wf.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                      <span>{wf.ai_metadata?.steps?.length || 3} steps</span>
                      {wf.status !== 'completed' ? (
                        <button
                          onClick={() => handleQuickExecute(wf.id)}
                          disabled={isExecuting}
                          className="px-2 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-[11px] font-medium transition flex items-center gap-1 disabled:opacity-50"
                        >
                          {isExecuting ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>Running...</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3" />
                              <span>Execute</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Audited</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
