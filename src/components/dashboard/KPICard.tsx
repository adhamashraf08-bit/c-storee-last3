import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '../LanguageProvider';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'sales' | 'orders' | 'target' | 'achievement';
  className?: string;
}

const variantGradients = {
  sales: 'bg-gradient-to-br from-pink-500 via-pink-600 to-purple-600',
  orders: 'bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600',
  target: 'bg-gradient-to-br from-rose-500 via-rose-600 to-pink-600',
  achievement: 'bg-gradient-to-br from-fuchsia-500 via-fuchsia-600 to-purple-600',
};

const iconContainerStyles = {
  sales: 'bg-white/20 text-white backdrop-blur-sm',
  orders: 'bg-white/20 text-white backdrop-blur-sm',
  target: 'bg-white/20 text-white backdrop-blur-sm',
  achievement: 'bg-white/20 text-white backdrop-blur-sm',
};

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'sales',
  className,
}: KPICardProps) {
  const { t, isRtl } = useLanguage();

  return (
    <div
      className={cn(
        'kpi-card animate-fade-in group',
        variantGradients[variant],
        className
      )}
      style={{
        animationDelay: `${['sales', 'orders', 'target', 'achievement'].indexOf(variant) * 100}ms`
      }}
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl" />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1 min-w-0">
            <p className="text-sm font-medium text-white/90">{title}</p>
            <p className="text-lg sm:text-xl font-bold tabular-nums text-white drop-shadow-lg whitespace-nowrap overflow-x-auto">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-white/80">{subtitle}</p>
            )}
          </div>
          <div className={cn(
            'p-3 rounded-xl transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 flex-shrink-0',
            iconContainerStyles[variant]
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        {trend && (
          <div className="mt-3 pt-3 border-t border-white/20">
            <span
              className={cn(
                'text-sm font-semibold',
                trend.isPositive ? 'text-white' : 'text-white/80'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value).toFixed(1)}%
            </span>
            <span className={cn("text-sm text-white/70", isRtl ? 'mr-1' : 'ml-1')}>
              {t('vs_target')}
            </span>
          </div>
        )}
      </div>

      {/* Decorative glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-white/0 via-white/20 to-white/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
    </div>
  );
}
