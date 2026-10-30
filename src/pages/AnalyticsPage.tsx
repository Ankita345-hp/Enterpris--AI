import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { DocumentAnalysisResult } from '../shared/types.ts';
import {
  FileSearch,
  Upload,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Sparkles,
  CheckCircle2,
  GitBranch,
  Download,
  Building2,
  RefreshCw,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [documentType, setDocumentType] = useState<
    'operational_report' | 'financial_ledger' | 'logistics_manifest' | 'support_tickets' | 'general_data'
  >('operational_report');
  const [department, setDepartment] = useState(user?.department || 'Operations');
  const [focusArea, setFocusArea] = useState('Anomaly detection, cost leakage, and SLA adherence');
  const [content, setContent] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DocumentAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleReports: Record<
    string,
    { title: string; type: typeof documentType; dept: string; focus: string; data: string }
  > = {
    logistics: {
      title: 'Q3 Trans-Pacific Container Manifest & Port Dwell Audit',
      type: 'logistics_manifest',
      dept: 'Operations',
      focus: 'Port dwell slippage, vessel queue delays, and fuel surcharges',
      data: `[MANIFEST AUDIT LOG: Q3 Trailing 30 Days]
Vessel: Ever Fortune (IMO: 9811002) - Origin: Shanghai | Destination: Port of Long Beach
Scheduled Berth: Oct 12, 08:00 UTC | Actual Berth: Oct 16, 21:30 UTC (Delay: +109.5 hrs)
Containers Ingested: 1,420 TEU. Primary Cargo: Tier-1 EV Battery Modules & Microcontrollers.

Anomaly Flags:
- Dwell time at Terminal Pier 400 averaged 5.8 days (Contract SLA: <= 2.2 days).
- Incurred Demurrage & Detention fees: $84,200 billed by Ocean Carrier MSC.
- Carrier BAF Fuel Surcharge applied at $680/TEU vs contractually capped Platts index rate of $615/TEU. Total overcharge: $92,300 across 1,420 units.
- 3 inland dry-van trucking tenders rejected due to driver shortage at Ontario, CA railhead.`,
    },
    finance: {
      title: 'Procurement Ledger & Accounts Payable Discrepancy Sample',
      type: 'financial_ledger',
      dept: 'Finance',
      focus: 'Three-way PO variance, duplicate invoice references, and pricing drifts',
      data: `[AP INVOICE BATCH #2026-OCT-AP9]
Vendor: Micron Technologies Global Corp (Vendor ID: V-99021)
Contract PO: PO-88319-2026 ($450,000 baseline blanket order)

Invoices Submitted for Payment:
- Inv #INV-10992: 50,000 units DDR5 DRAM @ $4.20/unit ($210,000). PO Rate: $3.95/unit. Variance: +$12,500 over contract.
- Inv #INV-10994: Expedited Air Freight Courier surcharge: $18,400. Not authorized on purchase order.
- Inv #INV-10998: Duplicate submission of line items from Sep 28 batch ($6,200).
Net unbudgeted variance in batch: $37,100 across 3 of 12 line items.`,
    },
    support: {
      title: 'Enterprise Customer Success SLA & Incident Escalations',
      type: 'support_tickets',
      dept: 'Customer Success',
      focus: 'Tier-1 client churn risk, response time breaches, and recurrent bugs',
      data: `[SERVICE DESK TELEMETRY - OCT WEEK 4]
Active Enterprise Clients Monitored: 418 Accounts. Tier-1 ARR: $64M.
Total Tickets Received: 890. SLA Met: 94.1% (Enterprise target: 99.5%).

Critical Escalations:
- Client: Apex FinTech Global (ARR: $1.8M) - Ticket #TCK-9441: Core API timeout in Sydney AWS region. Resolution time: 4.8 hrs (SLA: 1 hr). Executive sponsor flagged high churn risk.
- Client: OmniLogistics UK (ARR: $840k) - Ticket #TCK-9488: EDI billing format divergence after v2.4 upgrade.
Negative sentiment score detected in 18% of enterprise correspondence over trailing 72 hours.`,
    },
  };

  const handleLoadSample = (key: keyof typeof sampleReports) => {
    const s = sampleReports[key];
    setContent(s.data);
    setDocumentType(s.type);
    setDepartment(s.dept);
    setFocusArea(s.focus);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!content.trim()) {
      setError('Please provide document text or load a sample dataset first.');
      return;
    }

    setError(null);
    setAnalyzing(true);
    try {
      const res = await api.post('/ai/analyze', {
        content,
        document_type: documentType,
        department,
        focus_area: focusArea,
      });

      setResult(res.data.result);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Analysis failed. Please check payload.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConvertRecommendationToWorkflow = (rec: { action: string; recommended_workflow?: string }) => {
    const title = rec.recommended_workflow || rec.action;
    navigate('/workflows', {
      state: {
        suggestedTitle: title,
        suggestedDept: department,
      },
    });
  };

  const getRiskBadge = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'critical':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      case 'high':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'medium':
        return 'bg-yellow-950 text-yellow-300 border-yellow-800';
      default:
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Intelligent Document & Data Analyzer
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gemini-powered deep extraction, variance auditing, and automated anomaly detection for enterprise data
          </p>
        </div>
      </div>

      {/* Input Card */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Load Pre-configured Enterprise Datasets:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleLoadSample('logistics')}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 transition"
            >
              Operations (Port Manifest)
            </button>
            <button
              onClick={() => handleLoadSample('finance')}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-800/60 transition"
            >
              Finance (AP Ledger & POs)
            </button>
            <button
              onClick={() => handleLoadSample('support')}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/60 transition"
            >
              Customer SLA (Incident Triage)
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Document Category</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="operational_report">Operational Report</option>
              <option value="financial_ledger">Financial Ledger / Invoices</option>
              <option value="logistics_manifest">Logistics Manifest / BOL</option>
              <option value="support_tickets">Customer Support Tickets</option>
              <option value="general_data">General Telemetry Stream</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Target Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="Operations">Operations</option>
              <option value="Finance">Finance</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Customer Success">Customer Success</option>
              <option value="Executive">Executive</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Analysis Focus</label>
            <input
              type="text"
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              placeholder="e.g. Anomaly detection, pricing variance, SLA slippage"
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Raw Document Content / Log Text Payload
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={7}
            placeholder="Paste text from enterprise reports, invoice batches, support logs, or click a preloaded sample above..."
            className="w-full p-3.5 rounded-xl text-xs font-mono bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={analyzing || !content.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Gemini Diagnostic Processing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run Intelligent Anomaly Diagnostic</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Structured Analysis Results Output */}
      {result && (
        <div className="p-6 rounded-2xl bg-slate-900/95 border border-indigo-900/50 shadow-2xl space-y-6 animate-in fade-in duration-300">
          {/* Top Result Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider font-mono">
                  {result.department} Diagnostic Complete
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getRiskBadge(result.risk_level)}`}>
                  Risk Rating: {result.risk_level}
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-1">{result.report_title}</h2>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>Confidence: {result.confidence_score}%</span>
              <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded text-[11px]">
                Gemini 3.8 Flash
              </span>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
              Executive Strategic Summary
            </span>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{result.executive_summary}</p>
          </div>

          {/* Key Metrics Grid */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Extracted Key Metrics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {result.key_metrics.map((m, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 block truncate">{m.metric}</span>
                  <div className="text-base font-bold text-white font-mono">{m.value}</div>
                  <div
                    className={`text-[10px] font-semibold flex items-center gap-1 ${
                      m.trend === 'positive'
                        ? 'text-emerald-400'
                        : m.trend === 'negative'
                        ? 'text-rose-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {m.trend === 'positive' ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : m.trend === 'negative' ? (
                      <TrendingDown className="w-3 h-3" />
                    ) : null}
                    <span>{m.trend.toUpperCase()} TREND</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detected Anomalies Table */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Identified Operational Anomalies ({result.detected_anomalies.length})
              </h3>
            </div>

            <div className="space-y-2.5">
              {result.detected_anomalies.map((anom, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      {anom.title}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                        anom.severity === 'critical'
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : anom.severity === 'high'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-yellow-950 text-yellow-300 border-yellow-800'
                      }`}
                    >
                      {anom.severity} Severity
                    </span>
                  </div>

                  <p className="text-slate-300 pl-4">{anom.description}</p>
                  <p className="text-[11px] text-amber-400/90 pl-4">
                    <strong>Financial/Operational Impact:</strong> {anom.potential_impact}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Strategic Recommendations & 1-Click Workflow Conversion */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Actionable Strategic Recommendations & Recommended Pipelines
              </h3>
            </div>

            <div className="space-y-3">
              {result.strategic_recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950 border border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{rec.action}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {rec.urgency}
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-400">
                      <strong>Projected Return:</strong> {rec.estimated_roi}
                    </div>
                    {rec.recommended_workflow && (
                      <div className="text-[11px] text-slate-400">
                        Suggested Blueprint: <span className="text-cyan-300">{rec.recommended_workflow}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleConvertRecommendationToWorkflow(rec)}
                    className="shrink-0 px-3 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 transition text-xs font-semibold flex items-center gap-1.5"
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                    <span>Launch as Workflow</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
