import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, Activity } from 'lucide-react';

interface AnalyticsChartProps {
  departmentStats?: Record<string, number>;
  throughputData?: { day: string; value: number; anomalies: number }[];
  efficiencyRate?: number;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  departmentStats = {
    'Operations & Supply Chain': 14,
    'Finance & Procurement': 22,
    'Human Resources': 8,
    'Customer Success': 11,
  },
  throughputData = [
    { day: 'Mon', value: 820, anomalies: 4 },
    { day: 'Tue', value: 940, anomalies: 6 },
    { day: 'Wed', value: 1100, anomalies: 2 },
    { day: 'Thu', value: 1040, anomalies: 3 },
    { day: 'Fri', value: 1280, anomalies: 1 },
    { day: 'Sat', value: 650, anomalies: 0 },
    { day: 'Sun', value: 580, anomalies: 0 },
  ],
  efficiencyRate = 96.4,
}) => {
  const maxValue = Math.max(...throughputData.map((d) => d.value), 1400);
  const chartHeight = 160;
  const chartWidth = 500;
  const paddingX = 40;
  const paddingY = 20;

  const points = throughputData.map((d, index) => {
    const x = paddingX + (index / (throughputData.length - 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - (d.value / maxValue) * (chartHeight - paddingY * 2);
    return { x, y, ...d };
  });

  const linePath = points.reduce(
    (acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ''
  );

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  const totalDepartmentWorkflows = Object.values(departmentStats).reduce((a, b) => a + b, 0) || 1;

  const deptColors: Record<string, { bar: string; badge: string; text: string }> = {
    'Operations & Supply Chain': { bar: 'bg-emerald-500', badge: 'bg-emerald-950 text-emerald-300 border-emerald-800', text: 'text-emerald-400' },
    'Finance & Procurement': { bar: 'bg-indigo-500', badge: 'bg-indigo-950 text-indigo-300 border-indigo-800', text: 'text-indigo-400' },
    'Human Resources': { bar: 'bg-purple-500', badge: 'bg-purple-950 text-purple-300 border-purple-800', text: 'text-purple-400' },
    'Customer Success': { bar: 'bg-cyan-500', badge: 'bg-cyan-950 text-cyan-300 border-cyan-800', text: 'text-cyan-400' },
  };

  return (
    <div className="space-y-6">
      {/* Top Trend Line Chart */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Automated Processing Throughput</h3>
            </div>
            <p className="text-xs text-slate-400">Trailing 7-day operational batch executions & anomaly alerts</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              Throughput Volume
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              Anomalies Flagged
            </span>
          </div>
        </div>

        {/* SVG Graph */}
        <div className="relative w-full overflow-hidden">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-44 overflow-visible">
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {[0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = chartHeight - paddingY - ratio * (chartHeight - paddingY * 2);
              return (
                <line
                  key={ratio}
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="#334155"
                  strokeDasharray="3 3"
                  strokeWidth="0.8"
                />
              );
            })}

            {/* Area & Line */}
            <path d={areaPath} fill="url(#areaGradient)" />
            <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />

            {/* Nodes */}
            {points.map((pt, i) => (
              <g key={i}>
                <circle cx={pt.x} cy={pt.y} r="4" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2" />
                {pt.anomalies > 0 && (
                  <circle
                    cx={pt.x}
                    cy={chartHeight - paddingY}
                    r={Math.min(pt.anomalies * 2 + 1, 7)}
                    fill="#f43f5e"
                    className="animate-pulse"
                  />
                )}
                <text
                  x={pt.x}
                  y={chartHeight - 4}
                  fill="#94a3b8"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {pt.day}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Peak Throughput</span>
            <span className="text-white font-semibold text-sm">1,280 docs/hr</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Efficiency Yield</span>
            <span className="text-emerald-400 font-semibold text-sm flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              {efficiencyRate}%
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Flagged Outliers</span>
            <span className="text-rose-400 font-semibold text-sm">16 total</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">SLA Adherence</span>
            <span className="text-cyan-400 font-semibold text-sm">99.8%</span>
          </div>
        </div>
      </div>

      {/* Department Breakdown Progress Cards */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
        <h3 className="text-sm font-semibold text-white mb-1">Departmental Automation Load</h3>
        <p className="text-xs text-slate-400 mb-4">Active multi-agent pipeline executions segmented by business unit</p>

        <div className="space-y-3.5">
          {Object.entries(departmentStats).map(([dept, count]) => {
            const percentage = Math.round((count / totalDepartmentWorkflows) * 100);
            const styling = deptColors[dept] || {
              bar: 'bg-indigo-500',
              badge: 'bg-indigo-950 text-indigo-300 border-indigo-800',
              text: 'text-indigo-400',
            };

            return (
              <div key={dept} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-200">{dept}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">{count} workflows</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${styling.badge}`}>
                      {percentage}%
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${styling.bar} transition-all duration-500`}
                    style={{ width: `${Math.max(percentage, 5)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
