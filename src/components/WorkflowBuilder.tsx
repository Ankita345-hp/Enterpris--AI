import React, { useState } from 'react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { Workflow, WorkflowStep } from '../shared/types.ts';
import {
  Sparkles,
  Play,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  ArrowRight,
  Shield,
  RefreshCw,
  Building2,
  Cpu,
} from 'lucide-react';

interface WorkflowBuilderProps {
  onWorkflowCreated: (newWorkflow: Workflow) => void;
  initialTopic?: string;
  initialDepartment?: string;
  onCancel?: () => void;
}

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  onWorkflowCreated,
  initialTopic = '',
  initialDepartment,
  onCancel,
}) => {
  const { user } = useAuth();
  const [topic, setTopic] = useState(initialTopic);
  const [department, setDepartment] = useState(initialDepartment || user?.department || 'Operations');
  const [category, setCategory] = useState('Operations & Supply Chain');
  const [complianceLevel, setComplianceLevel] = useState<'standard' | 'strict' | 'mission_critical'>('strict');

  const [synthesizing, setSynthesizing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [riskAssessment, setRiskAssessment] = useState('');
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    'Operations & Supply Chain',
    'Finance & Procurement',
    'Human Resources & Workforce',
    'Customer Success & Support',
    'Executive & Compliance',
  ];

  const handleSynthesizeWithGemini = async () => {
    if (!topic.trim()) {
      setError('Please describe the business process or operational goal first.');
      return;
    }

    setError(null);
    setSynthesizing(true);
    try {
      const res = await api.post('/ai/generate-workflow', {
        topic,
        department,
        compliance_level: complianceLevel,
      });

      const meta = res.data.metadata;
      setTitle(meta.workflow_title || `${department} Intelligent Workflow: ${topic}`);
      setDescription(`Automated enterprise workflow synthesized by Gemini AI for ${department} optimization.`);
      setRiskAssessment(meta.risk_assessment || 'Standard enterprise operational procedure with automated checkpoints.');
      setSteps(meta.steps || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to synthesize workflow with Gemini.');
    } finally {
      setSynthesizing(false);
    }
  };

  const handleAddStep = () => {
    const nextNum = steps.length + 1;
    setSteps([
      ...steps,
      {
        step_number: nextNum,
        action_name: `Step ${nextNum}: Enterprise Validation Node`,
        ai_automation_enabled: true,
        expected_output: 'Structured JSON validation payload and downstream event dispatch.',
        status: 'pending',
      },
    ]);
  };

  const handleRemoveStep = (index: number) => {
    const updated = steps.filter((_, i) => i !== index).map((s, idx) => ({ ...s, step_number: idx + 1 }));
    setSteps(updated);
  };

  const handleStepChange = (index: number, field: keyof WorkflowStep, val: any) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: val };
    setSteps(updated);
  };

  const handleSaveWorkflow = async () => {
    if (!title.trim()) {
      setError('Workflow title is required.');
      return;
    }
    if (steps.length === 0) {
      setError('Workflow requires at least one automated step.');
      return;
    }

    try {
      const res = await api.post('/workflows', {
        title,
        description,
        category,
        steps,
        risk_assessment: riskAssessment,
      });

      onWorkflowCreated(res.data.workflow);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to persist workflow.');
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">AI Workflow Architecture Studio</h2>
          </div>
          <p className="text-xs text-slate-400">
            Synthesize multi-step autonomous pipelines with Google Gemini or configure customized process blueprints
          </p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 transition"
          >
            Cancel
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Gemini AI Synthesis Engine Box */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 via-slate-950/50 to-slate-900/60 border border-indigo-900/50 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">
              Gemini AI Auto-Synthesis Engine
            </span>
          </div>
          <span className="text-[10px] text-cyan-400 font-mono">Structured JSON Schema Enforcement</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Operational Objective / Business Process Goal
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Automated Supplier Invoice 3-Way Variance Matching & SAP Auto-Post"
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
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
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Risk Governance:</span>
            <div className="flex gap-1">
              {(['standard', 'strict', 'mission_critical'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setComplianceLevel(lvl)}
                  className={`px-2 py-1 rounded text-[10px] font-semibold uppercase border transition ${
                    complianceLevel === lvl
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {lvl.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSynthesizeWithGemini}
            disabled={synthesizing}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {synthesizing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing Schema...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Workflow with Gemini</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Blueprint Details Form */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Workflow Blueprint Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Workflow Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Dynamic Port Dwell Optimization Pipeline"
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Operational Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 transition"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Operational Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Provide architectural context for this automated workflow..."
            className="w-full px-3 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Risk Assessment & Compliance Guardrails
          </label>
          <input
            type="text"
            value={riskAssessment}
            onChange={(e) => setRiskAssessment(e.target.value)}
            placeholder="e.g. Low risk. Escalation to VP Operations triggered on variance > 5%."
            className="w-full px-3 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Multi-Step Pipeline Editor */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Execution Steps ({steps.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={handleAddStep}
            className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Step</span>
          </button>
        </div>

        {steps.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-slate-800 text-center text-slate-500 text-xs">
            No pipeline steps configured yet. Use the Gemini AI Generator above or click "Add Step" to manually construct your workflow.
          </div>
        ) : (
          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 relative group hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-900/60 text-indigo-300 text-[11px] font-bold flex items-center justify-center border border-indigo-700/60">
                      {step.step_number}
                    </span>
                    <input
                      type="text"
                      value={step.action_name}
                      onChange={(e) => handleStepChange(idx, 'action_name', e.target.value)}
                      placeholder="Step action name"
                      className="font-medium text-xs text-white bg-transparent border-b border-transparent focus:border-indigo-500 focus:outline-none w-64 sm:w-96"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={step.ai_automation_enabled}
                        onChange={(e) => handleStepChange(idx, 'ai_automation_enabled', e.target.checked)}
                        className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-900"
                      />
                      <span>AI Autonomous</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleRemoveStep(idx)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                      title="Remove Step"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-1">
                  <label className="block text-[10px] text-slate-400 mb-0.5">Expected Output Specification</label>
                  <input
                    type="text"
                    value={step.expected_output}
                    onChange={(e) => handleStepChange(idx, 'expected_output', e.target.value)}
                    placeholder="e.g. Validated SAP S/4HANA journal receipt ID"
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            Discard
          </button>
        )}
        <button
          type="button"
          onClick={handleSaveWorkflow}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Save & Register Workflow Pipeline</span>
        </button>
      </div>
    </div>
  );
};
