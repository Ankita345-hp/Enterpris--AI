import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { AuditTable } from '../components/AuditTable.tsx';
import { AuditLog, User } from '../shared/types.ts';
import {
  Settings,
  Shield,
  User as UserIcon,
  Building2,
  Lock,
  Users,
  CheckCircle2,
  RefreshCw,
  Clock,
  Terminal,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, isAdmin, isManager } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'audit' | 'users' | 'security'>('profile');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs();
    } else if (activeTab === 'users' && isManager) {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await api.get('/audit-logs');
      setLogs(res.data.logs);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get('/users');
      setUsersList(res.data.users);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">Settings & Security Governance</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Manage your enterprise profile, department scopes, cryptographic audit logs, and access control policies.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition shrink-0 ${
            activeTab === 'profile'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Profile & Department</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition shrink-0 ${
            activeTab === 'audit'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Audit Logs ({logs.length || '•'})</span>
        </button>

        {isManager && (
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition shrink-0 ${
              activeTab === 'users'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Enterprise User Roster</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition shrink-0 ${
            activeTab === 'security'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Security & RLS Policies</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold uppercase shadow-lg shadow-indigo-600/20">
              {user?.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{user?.name}</h3>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  {user?.role}
                </span>
              </div>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <p className="text-xs text-slate-500 mt-1">ID: {user?.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Assigned Department</label>
              <div className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span>{user?.department}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Access Role & Tier</label>
              <div className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-400" />
                <span className="capitalize">{user?.role} Access Rights</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Registration Timestamp</label>
              <div className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>{user?.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Authentication Method</label>
              <div className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>JWT Bearer (HMAC-SHA256, 7-day TTL)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={fetchAuditLogs}
              disabled={loadingLogs}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
              <span>Refresh Logs</span>
            </button>
          </div>
          <AuditTable logs={logs} loading={loadingLogs} />
        </div>
      )}

      {activeTab === 'users' && isManager && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Enterprise User Roster</h3>
              <p className="text-xs text-slate-400">All registered corporate identities across organizational units</p>
            </div>
            <button
              onClick={fetchUsers}
              disabled={loadingUsers}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
              <span>Refresh Roster</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/70 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-4">Corporate Email</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Role Tier</th>
                  <th className="py-3 px-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-semibold text-slate-200">{u.name}</td>
                    <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">{u.email}</td>
                    <td className="py-3 px-4 text-slate-300">{u.department}</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border bg-indigo-950 text-indigo-300 border-indigo-800">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">Zero-Trust Enterprise Security Governance</h3>
            <p className="text-xs text-slate-400">Security configuration enforced on server and client</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                Row-Level Security (RLS)
              </span>
              <p className="text-xs text-slate-200">
                Active & Enforced: Departmental isolation verified at API routing and database queries.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                Password Encryption
              </span>
              <p className="text-xs text-slate-200">
                bcrypt salted hashing with factor 10. Passwords never stored in plain text.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                API Key Protection
              </span>
              <p className="text-xs text-slate-200">
                Google Gemini API keys isolated exclusively in server environment variables. Never sent to browser.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                Input Validation
              </span>
              <p className="text-xs text-slate-200">
                Strict Zod schema enforcement across client-side forms and server-side request parsing.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
