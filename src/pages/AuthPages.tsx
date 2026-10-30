import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthForm } from '../components/AuthForm.tsx';
import { Cpu, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2 mb-6">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Cpu className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Enterprise AI Suite Access Portal</h2>
        <p className="text-xs text-slate-400">Authenticate with corporate credentials or use quick RBAC test presets</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-900/90 py-8 px-6 sm:px-8 border border-slate-800 shadow-2xl rounded-2xl">
          <AuthForm mode="login" onSuccess={() => navigate('/dashboard')} />

          <div className="mt-6 pt-5 border-t border-slate-800 text-center text-xs text-slate-400">
            <span>New organizational user? </span>
            <Link to="/signup" className="font-semibold text-indigo-400 hover:text-indigo-300">
              Create Enterprise Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2 mb-6">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Register Corporate Identity</h2>
        <p className="text-xs text-slate-400">Join your department workflow cluster with zero-trust RBAC</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-900/90 py-8 px-6 sm:px-8 border border-slate-800 shadow-2xl rounded-2xl">
          <AuthForm mode="signup" onSuccess={() => navigate('/dashboard')} />

          <div className="mt-6 pt-5 border-t border-slate-800 text-center text-xs text-slate-400">
            <span>Already have credentials? </span>
            <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
              Sign In to Suite
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
