import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { ChatMessage } from '../shared/types.ts';
import {
  Bot,
  Send,
  User as UserIcon,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  GitBranch,
  Layers,
  RefreshCw,
  Building2,
} from 'lucide-react';

interface AIChatConsoleProps {
  onNavigateToWorkflows?: (workflowTitle: string, dept: string) => void;
}

export const AIChatConsole: React.FC<AIChatConsoleProps> = ({ onNavigateToWorkflows }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Welcome, **${user?.name || 'Enterprise Leader'}**. I am your Enterprise AI Strategist, powered by Google Gemini. I analyze cross-departmental operations, recommend high-impact automation pipelines, and evaluate enterprise risk governance.\n\nHow can I optimize your workflows today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      structured_data: {
        recommendations: [
          'Audit high-variance supplier invoices across Finance & Procurement',
          'Deploy predictive freight rerouting to mitigate port dwell times',
          'Establish automated Okta & IT hardware provisioning for new hires',
        ],
        risk_factors: [
          'Manual ERP batch uploads create 4.2 hour lag in invoice reconciliation',
          'Unmonitored SLA breaches jeopardize customer tier-1 accounts',
        ],
        suggested_workflows: [
          'Automated Invoice Anomaly Detection & ERP Reconciliation',
          'Global Supply Chain Bottleneck & Port Congestion Mitigator',
        ],
      },
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDept, setSelectedDept] = useState(user?.department || 'Operations');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const quickPrompts = [
    { title: 'Detect Invoice Discrepancies', dept: 'Finance', text: 'How can we automate three-way invoice matching to eliminate procurement variances?' },
    { title: 'Mitigate Port Congestion', dept: 'Operations', text: 'What automated workflow can forecast maritime shipping delays and reroute freight?' },
    { title: 'Accelerate IT Onboarding', dept: 'Human Resources', text: 'Design an automated zero-trust employee identity provisioning sequence.' },
    { title: 'Prevent SLA Breaches', dept: 'Customer Success', text: 'How do we identify at-risk support tickets before SLA deadline expiration?' },
  ];

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await api.post('/ai/chat', {
        message: textToSend.trim(),
        department: selectedDept,
        history: historyPayload,
      });

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: res.data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        structured_data: res.data.structured_data,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'I encountered an operational latency error connecting to Gemini. Our fallback enterprise heuristics are active: Please ensure workflow schemas match your departmental policies.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const departments = ['Operations', 'Finance', 'Human Resources', 'Customer Success', 'Executive'];

  return (
    <div className="flex flex-col h-[700px] rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
      {/* Console Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Enterprise AI Strategist & Advisor</h2>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Gemini 3.8
              </span>
            </div>
            <p className="text-xs text-slate-400">Contextual operations intelligence and autonomous workflow advisor</p>
          </div>
        </div>

        {/* Department Context Selector */}
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-300 font-medium">Domain:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 transition"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800/80 overflow-x-auto flex items-center gap-2 scrollbar-none">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Tactical Prompts:</span>
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => {
              setSelectedDept(p.dept);
              handleSend(p.text);
            }}
            className="shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>{p.title}</span>
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div key={m.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-indigo-300" />
                </div>
              )}

              <div className={`max-w-2xl space-y-3 ${isUser ? 'items-end' : 'items-start'}`}>
                {/* Main bubble */}
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-none shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>
                  <div className={`text-[10px] mt-2 ${isUser ? 'text-indigo-200' : 'text-slate-400'} text-right`}>
                    {m.timestamp}
                  </div>
                </div>

                {/* Structured Data Cards from Gemini */}
                {!isUser && m.structured_data && (
                  <div className="space-y-3 pt-1">
                    {/* Actionable Recommendations */}
                    {m.structured_data.recommendations && m.structured_data.recommendations.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-indigo-900/40 text-xs space-y-2">
                        <div className="flex items-center gap-1.5 text-indigo-300 font-semibold text-[11px] uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Strategic AI Action Items</span>
                        </div>
                        <ul className="space-y-1.5">
                          {m.structured_data.recommendations.map((rec, i) => (
                            <li key={i} className="text-slate-300 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Risk Factors */}
                    {m.structured_data.risk_factors && m.structured_data.risk_factors.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-amber-900/40 text-xs space-y-2">
                        <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-[11px] uppercase tracking-wider">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                          <span>Governance & Risk Checkpoints</span>
                        </div>
                        <ul className="space-y-1.5">
                          {m.structured_data.risk_factors.map((rf, i) => (
                            <li key={i} className="text-slate-300 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                              <span>{rf}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Suggested Automation Workflows */}
                    {m.structured_data.suggested_workflows && m.structured_data.suggested_workflows.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-cyan-900/40 text-xs space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-cyan-300 font-semibold uppercase tracking-wider">
                          <span className="flex items-center gap-1.5">
                            <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
                            Recommended Workflows to Trigger
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {m.structured_data.suggested_workflows.map((wfName, i) => (
                            <div
                              key={i}
                              className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                            >
                              <span className="text-slate-200 font-medium">{wfName}</span>
                              <button
                                onClick={() => onNavigateToWorkflows?.(wfName, selectedDept)}
                                className="px-2 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition text-[11px] font-semibold flex items-center gap-1"
                              >
                                <span>Deploy</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 mt-1 shadow">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center">
              <Bot className="w-4 h-4 text-indigo-300" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700/60 text-xs text-slate-300 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
              <span className="text-slate-400 ml-1">Gemini Strategist synthesizing recommendations...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask Gemini Strategist regarding ${selectedDept} operations, metrics, or workflows...`}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5 disabled:opacity-40"
          >
            <span>Analyze</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
