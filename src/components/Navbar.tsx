import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Sparkles,
  Shield,
  UserCheck,
  LogOut,
  ChevronDown,
  Building2,
  Cpu,
  Menu,
  X,
  BellRing,
} from 'lucide-react';

export const Navbar: React.FC<{ onToggleSidebar?: () => void }> = ({ onToggleSidebar }) => {
  const { user, logout, quickLogin } = useAuth();
  const navigate = useNavigate();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const demoAccounts = [
    { name: 'Dr. Elena Rostova', role: 'admin', dept: 'Executive', email: 'admin@enterprise.ai', pass: 'AdminPass123!' },
    { name: 'Marcus Vance', role: 'manager', dept: 'Operations', email: 'manager@enterprise.ai', pass: 'ManagerPass123!' },
    { name: 'Alicia Zhang', role: 'manager', dept: 'Finance', email: 'finance@enterprise.ai', pass: 'ManagerPass123!' },
    { name: 'Devon Miller', role: 'manager', dept: 'Human Resources', email: 'hr.lead@enterprise.ai', pass: 'ManagerPass123!' },
    { name: 'Sarah Chen', role: 'user', dept: 'Operations', email: 'user@enterprise.ai', pass: 'UserPass123!' },
  ];

  const handleSwitchAccount = async (acc: typeof demoAccounts[0]) => {
    try {
      await quickLogin(acc.email, acc.pass);
      setShowRoleMenu(false);
      navigate('/dashboard');
    } catch (err) {
      console.error('Quick switch failed:', err);
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-900/60 text-purple-300 border-purple-700/60';
      case 'manager':
        return 'bg-blue-900/60 text-blue-300 border-blue-700/60';
      default:
        return 'bg-emerald-900/60 text-emerald-300 border-emerald-700/60';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-tight text-base sm:text-lg">
                  Enterprise<span className="text-indigo-400 font-extrabold">AI</span> Suite
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded border border-emerald-700/60 bg-emerald-950/50 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Gemini 3.8
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Quick Persona Switcher */}
              <div className="relative">
                <button
                  onClick={() => setShowRoleMenu(!showRoleMenu)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-700/70 bg-slate-900/80 hover:bg-slate-800 text-xs text-slate-300 transition"
                  title="Switch RBAC test persona"
                >
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline font-medium">Switch Role:</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase border ${getRoleBadge(user.role)}`}>
                    {user.role}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showRoleMenu && (
                  <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                    <div className="px-2.5 py-2 border-b border-slate-800 text-xs text-slate-400">
                      <p className="font-semibold text-white">RBAC Demo Switcher</p>
                      <p className="text-[11px] text-slate-400">Switch persona to test permissions & RLS</p>
                    </div>
                    <div className="py-1 space-y-1">
                      {demoAccounts.map((acc) => {
                        const isCurrent = acc.email.toLowerCase() === user.email.toLowerCase();
                        return (
                          <button
                            key={acc.email}
                            onClick={() => handleSwitchAccount(acc)}
                            className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition ${
                              isCurrent
                                ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-800/60'
                                : 'text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <div>
                              <div className="font-medium text-slate-100 flex items-center gap-1.5">
                                {acc.name}
                                {isCurrent && <UserCheck className="w-3.5 h-3.5 text-indigo-400" />}
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Building2 className="w-3 h-3" />
                                {acc.dept}
                              </div>
                            </div>
                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${getRoleBadge(acc.role)}`}>
                              {acc.role}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Notification icon */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition relative"
                  title="Alerts"
                >
                  <BellRing className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400"></span>
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-800 bg-slate-900 p-3 shadow-2xl z-50">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                      <span className="text-xs font-semibold text-white">Enterprise Alerts</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.5 rounded">All Systems Green</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="p-2 rounded bg-slate-800/60 border border-slate-700/50">
                        <p className="font-medium text-slate-200">Port Bottleneck Alert</p>
                        <p className="text-[11px] text-slate-400">Operations agent rerouted 3 dry-van tenders via rail.</p>
                      </div>
                      <div className="p-2 rounded bg-slate-800/60 border border-slate-700/50">
                        <p className="font-medium text-slate-200">Invoice Reconciliation Complete</p>
                        <p className="text-[11px] text-slate-400">142 vendor invoices auto-posted to SAP ledger.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* User profile capsule */}
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold uppercase shadow">
                  {user.name.charAt(0)}
                </div>
                <div className="text-left text-xs">
                  <div className="font-semibold text-slate-100 leading-tight">{user.name}</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <span>{user.department}</span>
                  </div>
                </div>
              </div>

              {/* Logout button */}
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/25 transition"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
