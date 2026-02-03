import { ChannelMetrics } from '@/types/sales';
import { cn } from '@/lib/utils';
import { SmartphoneNfc, ShoppingBasket, Headset, Globe, ShoppingCart, TrendingUp, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '../LanguageProvider';

interface ChannelCardProps {
    channel: ChannelMetrics;
}

const channelConfigs: Record<string, {
    icon: any;
    gradient: string;
    border: string;
    iconBg: string;
}> = {
    'Talabat': {
        icon: SmartphoneNfc,
        gradient: 'from-orange-500/20 to-rose-600/20',
        border: 'border-orange-500/30',
        iconBg: 'bg-orange-500/20 text-orange-600',
    },
    'Instashop': {
        icon: ShoppingBasket,
        gradient: 'from-emerald-500/20 to-teal-600/20',
        border: 'border-emerald-500/30',
        iconBg: 'bg-emerald-500/20 text-emerald-600',
    },
    'Call Center': {
        icon: Headset,
        gradient: 'from-sky-500/20 to-blue-600/20',
        border: 'border-sky-500/30',
        iconBg: 'bg-sky-500/20 text-blue-600',
    },
    'Website & App': {
        icon: Globe,
        gradient: 'from-indigo-500/20 to-purple-600/20',
        border: 'border-indigo-500/30',
        iconBg: 'bg-indigo-500/20 text-purple-600',
    }
};

const defaultIcon = {
    icon: ShoppingCart,
    gradient: 'from-gray-500/20 over-gray-600/20',
    border: 'border-gray-500/30',
    iconBg: 'bg-gray-500/20 text-gray-600',
};

export function ChannelCard({ channel }: ChannelCardProps) {
    const { t, language, isRtl } = useLanguage();
    const config = channelConfigs[channel.channelName] || defaultIcon;
    const Icon = config.icon;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-EG', {
            style: 'currency',
            currency: 'EGP',
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-EG').format(value);
    };

    return (
        <div className={cn(
            "relative group overflow-hidden rounded-2xl border backdrop-blur-md transition-all duration-500",
            "bg-gradient-to-br p-5 hover:shadow-xl hover:-translate-y-1",
            config.gradient,
            config.border
        )}>
            {/* Shimmer effect */}
            <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-20 pointer-events-none transition-opacity duration-500" />

            <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2.5 rounded-xl transition-transform duration-500 group-hover:scale-110", config.iconBg)}>
                            <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-bold tracking-tight">{t(channel.channelName as any) || channel.channelName}</h3>
                    </div>
                    <div className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm",
                        channel.achievementPercentage >= 100 ? "achievement-excellent" : "achievement-warning"
                    )}>
                        {channel.achievementPercentage.toFixed(1)}%
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <TrendingUp className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium uppercase tracking-wider">{t('sales')}</span>
                        </div>
                        <p className="text-base font-bold tabular-nums">{formatCurrency(channel.sales)}</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <ShoppingCart className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium uppercase tracking-wider">{t('orders')}</span>
                        </div>
                        <p className="text-base font-bold tabular-nums">{formatNumber(channel.orders)}</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <TrendingUp className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium uppercase tracking-wider">{t('aov')}</span>
                        </div>
                        <p className="text-base font-bold tabular-nums">{formatCurrency(channel.aov)}</p>
                    </div>
                </div>

                <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs font-medium text-muted-foreground uppercase tracking-widest">
                        <span>{t('achievement')}</span>
                        <span className="text-foreground">{formatCurrency(channel.target)} {t('target')}</span>
                    </div>
                    <Progress
                        value={Math.min(channel.achievementPercentage, 100)}
                        className="h-2 bg-black/5"
                    />
                </div>
            </div>
        </div>
    );
}
