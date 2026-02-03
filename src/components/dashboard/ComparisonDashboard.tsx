import { useState, useMemo } from "react";
import { SalesRecord, BRANCHES } from "@/types/sales";
import {
    calculateTodayVsYesterday,
    calculateMonthVsMonth,
    compareBranches,
    getMonthlyTrendComparison,
    prepareHeatmapData
} from "@/utils/comparisonUtils";
import { ComparisonBarChart } from "./ComparisonBarChart";
import { TrendLineChart } from "./TrendLineChart";
import { PerformanceHeatmap } from "./PerformanceHeatmap";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, GitCompare, LayoutGrid } from "lucide-react";
import { useLanguage } from "../LanguageProvider";

interface ComparisonDashboardProps {
    salesData: SalesRecord[];
}

export function ComparisonDashboard({ salesData }: ComparisonDashboardProps) {
    const [mode, setMode] = useState<'time' | 'branch' | 'heatmap'>('time');
    const [timeMode, setTimeMode] = useState<'day' | 'month'>('day');
    const [branchA, setBranchA] = useState(BRANCHES[0]);
    const [branchB, setBranchB] = useState(BRANCHES[1]);
    const { t, isRtl } = useLanguage();

    const todayData = useMemo(() => calculateTodayVsYesterday(salesData), [salesData]);
    const monthData = useMemo(() => calculateMonthVsMonth(salesData), [salesData]);
    const trendData = useMemo(() => getMonthlyTrendComparison(salesData), [salesData]);

    const branchCompData = useMemo(() => {
        const data = compareBranches(salesData, branchA, branchB);
        return data.map(item => ({
            ...item,
            name: t(item.name as any) || item.name
        }));
    }, [salesData, branchA, branchB, t]);

    const heatmapData = useMemo(() => prepareHeatmapData(salesData), [salesData]);

    return (
        <div className="space-y-6 animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-card p-4 rounded-2xl border-white/10">
                <div className="flex bg-muted/50 p-1 rounded-xl">
                    <Button
                        variant={mode === 'time' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setMode('time')}
                        className="rounded-lg gap-2"
                    >
                        <Calendar className="h-4 w-4" /> {t('time')}
                    </Button>
                    <Button
                        variant={mode === 'branch' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setMode('branch')}
                        className="rounded-lg gap-2"
                    >
                        <GitCompare className="h-4 w-4" /> {t('branch')}
                    </Button>
                    <Button
                        variant={mode === 'heatmap' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setMode('heatmap')}
                        className="rounded-lg gap-2"
                    >
                        <LayoutGrid className="h-4 w-4" /> {t('heatmap')}
                    </Button>
                </div>

                {mode === 'time' && (
                    <div className="flex gap-2 bg-muted/50 p-1 rounded-xl">
                        <Button
                            variant={timeMode === 'day' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setTimeMode('day')}
                            className="text-xs px-3"
                        >
                            {t('day')}
                        </Button>
                        <Button
                            variant={timeMode === 'month' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setTimeMode('month')}
                            className="text-xs px-3"
                        >
                            {t('month')}
                        </Button>
                    </div>
                )}

                {mode === 'branch' && (
                    <div className="flex items-center gap-2">
                        <Select value={branchA} onValueChange={(v: any) => setBranchA(v)}>
                            <SelectTrigger className="w-40 h-8 text-xs bg-background/50">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {BRANCHES.map(b => (
                                    <SelectItem key={b} value={b}>{t(b as any) || b}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span className="text-xs text-muted-foreground font-bold">{t('vs')}</span>
                        <Select value={branchB} onValueChange={(v: any) => setBranchB(v)}>
                            <SelectTrigger className="w-40 h-8 text-xs bg-background/50">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {BRANCHES.map(b => (
                                    <SelectItem key={b} value={b}>{t(b as any) || b}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6">
                {mode === 'time' && (
                    <>
                        {timeMode === 'day' ? (
                            <ComparisonBarChart
                                data={[
                                    { name: t('today'), Sales: todayData.current },
                                    { name: t('yesterday'), Sales: todayData.previous }
                                ]}
                                title={t('today_vs_yesterday')}
                            />
                        ) : (
                            <TrendLineChart
                                data={trendData}
                                title={t('month_vs_month')}
                            />
                        )}
                    </>
                )}

                {mode === 'branch' && (
                    <ComparisonBarChart
                        data={branchCompData}
                        title={`${t(branchA as any) || branchA} ${t('vs')} ${t(branchB as any) || branchB}`}
                    />
                )}

                {mode === 'heatmap' && (
                    <PerformanceHeatmap data={heatmapData} />
                )}
            </div>
        </div>
    );
}
