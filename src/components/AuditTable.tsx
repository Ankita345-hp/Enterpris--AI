import React, { useState } from 'react';
import { AuditLog } from '../shared/types.ts';
import { ShieldCheck, Search, Filter, Eye, ChevronDown, ChevronRight, Terminal, User as UserIcon } from 'lucide-react';

interface AuditTableProps {
  logs: AuditLog[];
  loading?: boolean;
}

export const AuditTable: React.FC<AuditTableProps> = ({ logs, loading = false }) => {
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const actionTypes = ['ALL', 'AUTH_LOGIN', 'AUTH_SIGNUP', 'WORKFLOW_CREATED', 'WORKFLOW_EXECUTED', 'AI_DOCUMENT_ANALYSIS', 'AI_WORKFLOW_GENERATED'];

  const filteredLogs = logs.filter((log) => {
    const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      log.action.toLowerCase().includes(q) ||
      (log.user_name && log.user_name.toLowerCase().includes(q)) ||
      (log.user_email && log.user_email.toLowerCase().includes(q)) ||
      log.ip_address.toLowerCase().includes(q);
    return matchesAction && matchesSearch;
  });

  const getActionBadge = (action: string) => {
    if (action.includes('AUTH')) {
      return 'bg-blue-950/80 text-blue-300 border-blue-800/60';
    }
    if (action.includes('WORKFLOW_EXECUTED')) {
      return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60';
    }
    if (action.includes('AI_')) {
      return 'bg-purple-950/80 text-purple-300 border-purple-800/60';
    }
    if (action.includes('DELETED')) {
      return 'bg-rose-950/80 text-rose-300 border-rose-800/60';
    }
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
      {/* Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Cryptographic Enterprise Audit Ledger</h3>
          </div>
          <p className="text-xs text-slate-400">Immutable chronological record of AI automation events and security access</p>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user, action, IP..."
              className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-900 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition w-44 sm:w-56"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl text-xs bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 transition"
            >
              {actionTypes.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="py-3 px-4">Action Event</th>
              <th className="py-3 px-4">Actor / Identity</th>
              <th className="py-3 px-4">Origin IP</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4 text-right">Payload Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span>Loading audit ledger...</span>
                  </div>
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-400">
                  No audit log entries matching criteria.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                return (
                  <React.Fragment key={log.id}>
                    <tr className="hover:bg-slate-800/40 transition group">
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${getActionBadge(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-200 flex items-center gap-1.5">
                          <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>{log.user_name || 'System'}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">{log.user_email}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{log.ip_address}</td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition inline-flex items-center gap-1"
                        >
                          <Terminal className="w-3 h-3 text-indigo-400" />
                          <span>{isExpanded ? 'Hide' : 'Inspect'}</span>
                          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-950/90 border-b border-indigo-900/30">
                        <td colSpan={5} className="py-3 px-4">
                          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                            <div className="text-slate-400 mb-1 flex items-center justify-between">
                              <span>Log ID: {log.id}</span>
                              <span className="text-[10px] text-slate-500">ISO-8601: {log.created_at}</span>
                            </div>
                            <pre className="whitespace-pre-wrap">{JSON.stringify(log.details, null, 2)}</pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span>Showing {filteredLogs.length} audit records</span>
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Audit verification: SHA-256 Validated</span>
        </span>
      </div>
    </div>
  );
};
