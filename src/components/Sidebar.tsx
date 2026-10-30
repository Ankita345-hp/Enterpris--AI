import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import {
  LayoutDashboard,
  GitBranch,
  BarChart3,
  BotMessageSquare,
  Settings,
  ShieldCheck,
  Building2,
  Sparkles,
  Layers,
} from 'lucide-react';

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user, isAdmin, isManager } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Workflows', path: '/workflows', icon: GitBranch, badge: 'Active' },
    { name: 'Analytics & Reports', path: '/analytics', icon: BarChart3 },
    { name: 'AI Strategist', path: '/assistant', icon: BotMessageSquare, badge: 'Gemini' },
    { name: 'Settings & Security', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-35 w-64 border-r border-slate-800 bg-slate-950/95 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6">
          {/* Active Context Card */}
          {user && (
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 shadow-sm">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Department Unit</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                  {user.role.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-200 truncate">{user.department}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">User: {user.name}</p>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1">
            <p className="px-3 text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">Platform Navigation</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600/20 to-indigo-500/10 text-indigo-300 border border-indigo-700/50 shadow-sm'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/40">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom AI Suite Engine badge */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-900/60 border border-indigo-900/40 text-xs">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Governance Core</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Autonomous agents bounded by strict enterprise JSON schemas & RLS isolation.
            </p>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              API Status: Online
            </span>
            <span>v2.5.0-prod</span>
          </div>
        </div>
      </aside>
    </>
  );
};
