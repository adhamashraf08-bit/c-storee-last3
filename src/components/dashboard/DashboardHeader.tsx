import { RefreshCw, TrendingUp, Target, ShoppingCart, DollarSign, Shield, Eye, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardSummary, SalesRecord } from '@/types/sales';
import { KPICard } from './KPICard';
import { UserMenu } from './UserMenu';
import { ReportMenu } from './ReportMenu';
import { ModeToggle } from '../mode-toggle';
import { useLanguage } from '../LanguageProvider';

interface DashboardHeaderProps {
  summary: DashboardSummary | null;
  salesData: SalesRecord[];
  isLoading: boolean;
  onRefresh: () => void;
  isAdmin?: boolean;
}

export function DashboardHeader({ summary, salesData, isLoading, onRefresh, isAdmin = false }: DashboardHeaderProps) {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

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

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src="/cstore-logo-new.png" alt="C Store" className="h-12 w-12 hover:scale-110 transition-transform duration-300 rounded-full" />
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              {t('dashboard_title')}
            </h1>
            <p className="text-muted-foreground">{t('dashboard_subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="font-bold min-w-[40px] hover:bg-gradient-to-br hover:from-pink-500 hover:to-purple-600 hover:text-white hover:border-transparent transition-all duration-300"
          >
            {language === 'en' ? 'AR' : 'EN'}
          </Button>

          {/* Role Badge */}
          <Badge
            variant={isAdmin ? "default" : "secondary"}
            className="gap-1.5 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0 shadow-lg"
          >
            {isAdmin ? (
              <>
                <Shield className="h-3 w-3" />
                {t('admin')}
              </>
            ) : (
              <>
                <Eye className="h-3 w-3" />
                {t('viewer_access')}
              </>
            )}
          </Badge>

          {/* Settings Button - Admin Only */}
          {isAdmin && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/settings')}
              title={t('settings')}
              className="hover:bg-gradient-to-br hover:from-pink-500 hover:to-purple-600 hover:text-white hover:border-transparent transition-all duration-300"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}

          {/* Refresh Button - Admin Only */}
          {isAdmin && (
            <Button
              variant="outline"
              onClick={onRefresh}
              disabled={isLoading}
              className="gap-2 hover:bg-gradient-to-br hover:from-pink-500 hover:to-purple-600 hover:text-white hover:border-transparent transition-all duration-300"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {t('refresh_data')}
            </Button>
          )}
          <ModeToggle />
          <ReportMenu summary={summary} salesData={salesData} />
          <UserMenu />
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <KPICard
          title={t('total_sales')}
          value={summary ? formatCurrency(summary.totalSales) : 'EGP 0'}
          subtitle={t('all_branches_combined')}
          icon={DollarSign}
          variant="sales"
        />
        <KPICard
          title={t('total_orders')}
          value={summary ? formatNumber(summary.totalOrders) : '0'}
          subtitle={t('across_channels')}
          icon={ShoppingCart}
          variant="orders"
        />
        <KPICard
          title={t('total_target')}
          value={summary ? formatCurrency(summary.totalTarget) : 'EGP 0'}
          subtitle={t('combined_target')}
          icon={Target}
          variant="target"
        />
        <KPICard
          title={t('achievement')}
          value={summary ? `${summary.overallAchievement.toFixed(1)}%` : '0%'}
          subtitle={t('overall_performance')}
          icon={TrendingUp}
          variant="achievement"
          trend={summary ? {
            value: summary.overallAchievement - 100,
            isPositive: summary.overallAchievement >= 100,
          } : undefined}
        />
        <KPICard
          title={t('aov')}
          value={summary ? formatCurrency(summary.overallAov) : 'EGP 0'}
          subtitle={t('all_branches_combined')}
          icon={TrendingUp}
          variant="sales"
        />
      </div>
    </div>
  );
}
