import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Sparkles,
  Shield,
  GitBranch,
  BarChart3,
  Bot,
  Layers,
  ArrowRight,
  CheckCircle2,
  Lock,
  Cpu,
  Building2,
  Activity,
  Zap,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  const corePillars = [
    {
      icon: GitBranch,
      title: 'AI Workflow Engine',
      desc: 'Autonomous multi-step pipeline synthesis powered by Google Gemini with strict enterprise JSON schemas.',
    },
    {
      icon: BarChart3,
      title: 'Diagnostic Anomaly Analyzer',
      desc: 'Ingests complex operational reports, invoice batches, and freight manifests with real-time variance detection.',
    },
    {
      icon: Bot,
      title: 'Contextual AI Strategist',
      desc: 'Department-grounded executive advisor evaluating SLA adherence, risk factors, and automated remediation.',
    },
    {
      icon: Shield,
      title: 'Enterprise RBAC & Audit Ledger',
      desc: 'Granular permissions (Admin, Manager, User) paired with immutable cryptographic audit logging.',
    },
  ];

  const departments = [
    { name: 'Operations & Supply Chain', metric: '18% Dock Dwell Reduction', tag: 'Logistics Optimization' },
    { name: 'Finance & Procurement', metric: '$125K Annual Leakage Mitigated', tag: '3-Way ERP Reconciliation' },
    { name: 'Human Resources & Workforce', metric: '4.2x Faster Onboarding', tag: 'Zero-Trust Provisioning' },
    { name: 'Customer Success & Support', metric: '99.8% SLA Adherence', tag: 'Automated Tier-3 Triage' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-600/15 via-cyan-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 space-y-24">
        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-700/60 bg-indigo-950/60 text-indigo-300 text-xs font-semibold shadow-inner">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Enterprise AI Suite • Powered by Google Gemini 3.8</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Centralized Workflow &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-indigo-200">
              Intelligence Automation
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Eliminate operational silos, automate cross-departmental execution, and detect systemic anomalies with
            secure, role-isolated AI orchestration.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            {user ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2"
              >
                <span>Enter Enterprise Console</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2"
                >
                  <span>Launch Operations Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/signup"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm transition"
                >
                  Request Enterprise Account
                </Link>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Pre-seeded RBAC Personas
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Zero-Trust Audit Trails
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Validated JSON Schema Enforcement
            </span>
          </div>
        </div>

        {/* Live System Preview Terminal Card */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-xs text-slate-400">
                enterprise_orchestrator://cluster-alpha.prod
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
              RLS Isolation: ENFORCED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {departments.map((dept, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">{dept.tag}</span>
                <h4 className="text-xs font-semibold text-white">{dept.name}</h4>
                <div className="text-emerald-400 font-mono text-xs font-semibold pt-1">{dept.metric}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Enterprise Architecture Pillars</h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Built specifically for large-scale enterprise workflows requiring deterministic compliance and verifiable audits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {corePillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 transition space-y-3 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-800/80 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">{pillar.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{pillar.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Gateway Card */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-950/40 border border-indigo-800/50 text-center space-y-4 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ready to Automate Your Departmental Pipelines?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            Test as Executive Admin, Operations Manager, Finance Lead, or standard user with instant pre-configured credentials.
          </p>
          <div className="pt-2 flex justify-center">
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
            >
              <span>Access System Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-400">
        <p>Enterprise AI Suite • SOC-2 & ISO-27001 Compliance Architecture • Powered by Google Gemini</p>
      </footer>
    </div>
  );
};
