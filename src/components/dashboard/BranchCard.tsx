import { ChevronRight, Store, TrendingUp, ShoppingCart, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BranchMetrics } from '@/types/sales';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '../LanguageProvider';

interface BranchCardProps {
  metrics: BranchMetrics;
  isExpanded: boolean;
  onToggle: () => void;
}

const branchStyles: Record<string, string> = {
  'Dark Store': 'branch-card-dark-store',
  'Maadi': 'branch-card-maadi',
  'Masr El Gededa': 'branch-card-masr-el-gededa',
  'Tagamo3': 'branch-card-tagamo3',
};

const channelColors: Record<string, string> = {
  'Talabat': 'bg-orange-500',
  'Instashop': 'bg-emerald-500',
  'Call Center': 'bg-sky-500',
  'Website & App': 'bg-indigo-500',
};

function getAchievementClass(percentage: number): string {
  if (percentage >= 100) return 'achievement-excellent';
  if (percentage >= 80) return 'achievement-good';
  if (percentage >= 60) return 'achievement-warning';
  return 'achievement-critical';
}

export function BranchCard({ metrics, isExpanded, onToggle }: BranchCardProps) {
  const navigate = useNavigate();
  const { t, language, isRtl } = useLanguage();

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-EG').format(value);
  };

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.toggle-button')) {
      onToggle();
    } else {
      navigate(`/branch/${encodeURIComponent(metrics.branchName)}`);
    }
  };

  return (
    <div
      className={cn(
        'kpi-card cursor-pointer animate-fade-in hover:shadow-2xl transition-all duration-500 group relative overflow-hidden',
        branchStyles[metrics.branchName]
      )}
      onClick={handleClick}
    >
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-white/20 text-white backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">{t(metrics.branchName as any) || metrics.branchName}</h3>
              <p className="text-sm text-white/80">{t('branch_performance')}</p>
            </div>
          </div>
          <ChevronRight
            className={cn(
              'h-5 w-5 text-white/70 transition-transform duration-200 toggle-button',
              isExpanded && 'rotate-90',
              isRtl && !isExpanded && 'rotate-180'
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-white/70">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="text-xs">{t('sales')}</span>
            </div>
            <p className="font-semibold tabular-nums text-white">{formatCurrency(metrics.totalSales)}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-white/70">
              <ShoppingCart className="h-3.5 w-3.5" />
              <span className="text-xs">{t('orders')}</span>
            </div>
            <p className="font-semibold tabular-nums text-white">{formatNumber(metrics.totalOrders)}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-white/70">
              <Target className="h-3.5 w-3.5" />
              <span className="text-xs">{t('target')}</span>
            </div>
            <p className="font-semibold tabular-nums text-white">{formatCurrency(metrics.totalTarget)}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-white/70">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="text-xs">{t('aov')}</span>
            </div>
            <p className="font-semibold tabular-nums text-white">{formatCurrency(metrics.aov)}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/80">{t('achievement')}</span>
            <span className={cn('text-sm font-medium px-2 py-0.5 rounded-full', getAchievementClass(metrics.achievementPercentage))}>
              {metrics.achievementPercentage.toFixed(1)}%
            </span>
          </div>
          <Progress value={Math.min(metrics.achievementPercentage, 100)} className="h-2" />
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-white/20 space-y-3 animate-fade-in">
            <h4 className="text-sm font-medium text-white/80">Breakdown</h4>
            {metrics.channels.map((channel) => (
              <div key={channel.channelName} className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg">
                <div className={cn('w-1 h-10 rounded-full', channelColors[channel.channelName])} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate text-white">{t(channel.channelName as any) || channel.channelName}</span>
                    <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded', getAchievementClass(channel.achievementPercentage))}>
                      {channel.achievementPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/70">
                    <div className="flex flex-col">
                      <span>{formatCurrency(channel.sales)}</span>
                      <span className="text-[10px] font-bold">AOV: {formatCurrency(channel.aov)}</span>
                    </div>
                    <span>{formatNumber(channel.orders)} {t('orders')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
