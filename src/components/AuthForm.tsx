import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { signupSchema, loginSchema } from '../shared/schemas.ts';
import { UserRole } from '../shared/types.ts';
import { Shield, Lock, Mail, User as UserIcon, Building2, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AuthFormProps {
  mode: 'login' | 'signup';
  onSuccess?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode, onSuccess }) => {
  const { login, signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Operations');
  const [role, setRole] = useState<UserRole>('user');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const departments = [
    'Operations',
    'Finance',
    'Human Resources',
    'Customer Success',
    'Executive',
    'Engineering',
  ];

  const handleDemoFill = (accRole: 'admin' | 'manager' | 'user') => {
    if (accRole === 'admin') {
      setEmail('admin@enterprise.ai');
      setPassword('AdminPass123!');
      setName('Dr. Elena Rostova');
      setDepartment('Executive');
      setRole('admin');
    } else if (accRole === 'manager') {
      setEmail('manager@enterprise.ai');
      setPassword('ManagerPass123!');
      setName('Marcus Vance');
      setDepartment('Operations');
      setRole('manager');
    } else {
      setEmail('user@enterprise.ai');
      setPassword('UserPass123!');
      setName('Sarah Chen');
      setDepartment('Operations');
      setRole('user');
    }
    setErrors({});
    setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError(null);

    if (mode === 'signup') {
      const result = signupSchema.safeParse({ name, email, password, department, role });
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of result.error.issues) {
          const field = issue.path[0] as string;
          fieldErrors[field] = issue.message;
        }
        setErrors(fieldErrors);
        return;
      }

      setLoading(true);
      try {
        await signup({ name, email, password, department, role });
        onSuccess?.();
      } catch (err: any) {
        setApiError(err.response?.data?.error || 'Registration failed. Please check credentials.');
      } finally {
        setLoading(false);
      }
    } else {
      const result = loginSchema.safeParse({ email, password });
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of result.error.issues) {
          const field = issue.path[0] as string;
          fieldErrors[field] = issue.message;
        }
        setErrors(fieldErrors);
        return;
      }

      setLoading(true);
      try {
        await login(email, password);
        onSuccess?.();
      } catch (err: any) {
        setApiError(err.response?.data?.error || 'Authentication failed. Please verify email and password.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Quick Demo Pre-fill Pill Bar */}
      <div className="mb-5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            Quick Demo Autofill:
          </span>
          <span className="text-[10px] text-slate-400">Pre-seeded accounts</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => handleDemoFill('admin')}
            className="px-2 py-1.5 rounded-lg border border-purple-800/60 bg-purple-950/40 text-purple-300 hover:bg-purple-900/50 text-[11px] font-semibold transition"
          >
            Admin (Elena)
          </button>
          <button
            type="button"
            onClick={() => handleDemoFill('manager')}
            className="px-2 py-1.5 rounded-lg border border-blue-800/60 bg-blue-950/40 text-blue-300 hover:bg-blue-900/50 text-[11px] font-semibold transition"
          >
            Manager (Marcus)
          </button>
          <button
            type="button"
            onClick={() => handleDemoFill('user')}
            className="px-2 py-1.5 rounded-lg border border-emerald-800/60 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50 text-[11px] font-semibold transition"
          >
            User (Sarah)
          </button>
        </div>
      </div>

      {apiError && (
        <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Full Legal Name</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Jane Doe"
                className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-900 border ${
                  errors.name ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                } text-white focus:outline-none transition`}
              />
            </div>
            {errors.name && <p className="text-[11px] text-rose-400 mt-1">{errors.name}</p>}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Corporate Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@enterprise.ai"
              className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-900 border ${
                errors.email ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
              } text-white focus:outline-none transition`}
            />
          </div>
          {errors.email && <p className="text-[11px] text-rose-400 mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-900 border ${
                errors.password ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
              } text-white focus:outline-none transition`}
            />
          </div>
          {errors.password && <p className="text-[11px] text-rose-400 mt-1">{errors.password}</p>}
        </div>

        {mode === 'signup' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full pl-9 pr-2 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 transition"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Role / Tier</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="user">User (Standard)</option>
                <option value="manager">Manager (Dept Lead)</option>
                <option value="admin">Admin (Executive)</option>
              </select>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>{mode === 'signup' ? 'Complete Enterprise Registration' : 'Authenticate & Access Suite'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
