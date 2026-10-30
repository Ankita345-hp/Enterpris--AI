import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AIChatConsole } from '../components/AIChatConsole.tsx';
import { Bot, Sparkles, Shield, Cpu, Zap } from 'lucide-react';

export const AssistantPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLaunchWorkflow = (workflowTitle: string, dept: string) => {
    navigate('/workflows', {
      state: {
        suggestedTitle: workflowTitle,
        suggestedDept: dept,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Enterprise AI Strategist & Advisor
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time operations consultation, risk governance audits, and automated workflow synthesis powered by Gemini 3.8.
          </p>
        </div>
      </div>

      <AIChatConsole onNavigateToWorkflows={handleLaunchWorkflow} />
    </div>
  );
};
