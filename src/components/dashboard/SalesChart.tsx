import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { DashboardSummary } from '@/types/sales';
import { useLanguage } from '../LanguageProvider';

interface SalesChartProps {
  summary: DashboardSummary | null;
  branchName?: string;
}

const CHANNEL_COLORS: Record<string, string> = {
  'Talabat': '#f97316',
  'Instashop': '#10b981',
  'Call Center': '#0ea5e9',
  'Website & App': '#8b5cf6',
};

const BRANCH_COLORS: Record<string, string> = {
  'Dark Store': '#e31782',
  'Maadi': '#a855f7',
  'Masr El Gededa': '#fb7185',
  'Tagamo3': '#ec4899',
};

const CustomTooltip = ({ active, payload, label, t }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-4 rounded-xl border-white/20 shadow-2xl animate-in zoom-in-95 duration-200">
        <p className="font-bold mb-2 text-foreground">{t(label) || label}</p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: entry.color || entry.fill }}
                />
                <span className="text-sm text-muted-foreground">{t(entry.name) || entry.name}:</span>
              </div>
              <span className="text-sm font-bold tabular-nums">
                EGP {entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function SalesChart({ summary, branchName }: SalesChartProps) {
  const { t, language, isRtl } = useLanguage();

  const formatCurrencyFull = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  const branchData = useMemo(() => {
    if (!summary) return [];

    if (branchName) {
      const branch = summary.branchMetrics.find(b => b.branchName === branchName);
      if (!branch) return [];

      return branch.channels.map(c => ({
        name: t(c.channelName as any) || c.channelName,
        Sales: c.sales,
        Target: c.target,
        color: CHANNEL_COLORS[c.channelName] || '#6366f1',
      }));
    }

    return summary.branchMetrics.map((b) => ({
      name: t(b.branchName as any) || b.branchName,
      Sales: b.totalSales,
      Target: b.totalTarget,
      color: BRANCH_COLORS[b.branchName] || '#6366f1',
    }));
  }, [summary, branchName, t]);

  const totalSales = useMemo(() => {
    if (!summary) return 0;
    if (branchName) {
      return summary.branchMetrics.find(b => b.branchName === branchName)?.totalSales || 0;
    }
    return summary.totalSales;
  }, [summary, branchName]);

  const channelData = useMemo(() => {
    if (!summary) return [];

    if (branchName) {
      const branch = summary.branchMetrics.find(b => b.branchName === branchName);
      if (!branch) return [];

      return branch.channels.map(c => ({
        name: t(c.channelName as any) || c.channelName,
        value: c.sales,
        color: CHANNEL_COLORS[c.channelName] || '#6366f1',
      }));
    }

    const channelTotals: Record<string, number> = {};
    summary.branchMetrics.forEach((branch) => {
      branch.channels.forEach((channel) => {
        channelTotals[channel.channelName] = (channelTotals[channel.channelName] || 0) + channel.sales;
      });
    });

    return Object.entries(channelTotals).map(([name, value]) => ({
      name: t(name as any) || name,
      value,
      color: CHANNEL_COLORS[name] || '#6366f1',
    }));
  }, [summary, branchName, t]);

  if (!summary) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-2">
      <div className="space-y-4">
        <h3 className="text-xl font-bold tracking-tight">
          {branchName ? `${t(branchName as any) || branchName} - ${t('channel_mastery')}` : t('branch_mastery')}
        </h3>
        <div className="h-80 glass-card p-4 rounded-2xl border-white/10 overflow-hidden relative group">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={branchData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(227, 23, 130, 0.1)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
              <Tooltip content={<CustomTooltip t={t} />} />
              <Bar dataKey="Sales" radius={[8, 8, 8, 8]}>
                {branchData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold tracking-tight">
          {branchName ? `${t(branchName as any) || branchName} - ${t('sales_mix')}` : t('total_sales_dist')}
        </h3>
        <div className="h-80 glass-card p-4 rounded-2xl border-white/10 overflow-hidden relative group">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={channelData} cx="50%" cy="50%" innerRadius={75} outerRadius={105} paddingAngle={8} dataKey="value" stroke="none">
                {channelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip t={t} />} />
              <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground font-bold text-lg">{t('total_sales')}</text>
              <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" className="fill-primary font-black text-xl tabular-nums">{formatCurrencyFull(totalSales)}</text>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
