import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Calendar, TrendingUp, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SalesRecord, BranchTarget } from '@/types/sales';
import { useLanguage } from '../LanguageProvider';
import { cn } from '@/lib/utils';

interface MonthlyReportsProps {
    salesData: SalesRecord[];
    onMonthSelect: (month: string) => void;
}

export function MonthlyReports({ salesData, onMonthSelect }: MonthlyReportsProps) {
    const { t, isRtl, language } = useLanguage();

    const monthlySummaries = useMemo(() => {
        if (!salesData || !Array.isArray(salesData)) return [];

        const monthsMap: Record<string, {
            sales: number;
            orders: number;
            target: number;
            records: SalesRecord[];
        }> = {};

        salesData.forEach(record => {
            if (!record.date) return;

            const monthKey = record.date.substring(0, 7); // YYYY-MM
            if (monthKey.length < 7) return; // Basic validation

            if (!monthsMap[monthKey]) {
                monthsMap[monthKey] = { sales: 0, orders: 0, target: 0, records: [] };
            }
            monthsMap[monthKey].sales += Number(record.sales_value || 0);
            monthsMap[monthKey].orders += Number(record.orders_count || 0);
            monthsMap[monthKey].target += Number(record.target_value || 0);
            monthsMap[monthKey].records.push(record);
        });

        return Object.entries(monthsMap)
            .map(([month, data]) => {
                let label = month;
                try {
                    const date = parseISO(`${month}-01`);
                    if (!isNaN(date.getTime())) {
                        label = format(date, 'MMMM yyyy', {
                            locale: language === 'ar' ? ar : undefined
                        });
                    }
                } catch (e) {
                    console.error('Error formatting month:', month, e);
                }

                return {
                    month,
                    ...data,
                    achievement: data.target > 0 ? (data.sales / data.target) * 100 : 0,
                    label
                };
            })
            .sort((a, b) => b.month.localeCompare(a.month));
    }, [salesData, language]);

    if (monthlySummaries.length === 0) {
        return (
            <div className="text-center py-12 glass-card rounded-2xl border-white/10">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">No data available to generate reports.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {monthlySummaries.map((summary) => (
                <Card
                    key={summary.month}
                    className="glass-card border-white/10 hover:border-primary/50 transition-all cursor-pointer group"
                    onClick={() => onMonthSelect(summary.month)}
                >
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-bold">{summary.label}</CardTitle>
                        <Calendar className="h-5 w-5 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{t('sales')}</p>
                                <p className="text-xl font-bold font-mono">
                                    {summary.sales.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{t('orders')}</p>
                                <p className="text-xl font-bold font-mono">
                                    {summary.orders.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">{t('achievement')}</span>
                                <span className={cn(
                                    "font-bold",
                                    summary.achievement >= 100 ? "text-green-500" : "text-primary"
                                )}>
                                    {summary.achievement.toFixed(1)}%
                                </span>
                            </div>
                            <Progress value={Math.min(summary.achievement, 100)} className="h-2" />
                        </div>

                        <div className="flex items-center justify-end text-sm text-primary font-medium group-hover:gap-2 transition-all">
                            <span>{isRtl ? 'عرض التفاصيل' : 'View Details'}</span>
                            <ChevronRight className={cn("h-4 w-4", isRtl && "rotate-180")} />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
