import { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, Filter, X, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { enUS, ar } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { BRANCHES, CHANNELS } from '@/types/sales';
import { useLanguage } from '../LanguageProvider';

export interface DashboardFilterState {
    dateRange: DateRange | undefined;
    selectedMonth: string | undefined; // Format: "YYYY-MM"
    branches: string[];
    channels: string[];
    daysOfWeek: number[]; // 0 for Sunday, 1 for Monday, etc.
}

interface DashboardFiltersProps {
    filters: DashboardFilterState;
    onFilterChange: (filters: DashboardFilterState) => void;
}

export function DashboardFilters({ filters, onFilterChange }: DashboardFiltersProps) {
    const { t, isRtl, language } = useLanguage();
    const dateLocale = language === 'ar' ? ar : enUS;

    const days = [
        { label: t('sunday'), value: 0 },
        { label: t('monday'), value: 1 },
        { label: t('tuesday'), value: 2 },
        { label: t('wednesday'), value: 3 },
        { label: t('thursday'), value: 4 },
        { label: t('friday'), value: 5 },
        { label: t('saturday'), value: 6 },
    ];

    const handleDateChange = (range: DateRange | undefined) => {
        onFilterChange({ ...filters, dateRange: range });
    };

    const handleBranchChange = (branch: string) => {
        const newBranches = branch === 'all' ? [] : [branch];
        onFilterChange({ ...filters, branches: newBranches });
    };

    const handleChannelChange = (channel: string) => {
        const newChannels = channel === 'all' ? [] : [channel];
        onFilterChange({ ...filters, channels: newChannels });
    };

    const handleDayChange = (day: string) => {
        const dayVal = day === 'all' ? [] : [parseInt(day)];
        onFilterChange({ ...filters, daysOfWeek: dayVal });
    };

    const handleMonthChange = (month: string) => {
        const selectedMonth = month === 'all' ? undefined : month;
        onFilterChange({ ...filters, selectedMonth });
    };

    const clearFilters = () => {
        onFilterChange({
            dateRange: undefined,
            selectedMonth: undefined,
            branches: [],
            channels: [],
            daysOfWeek: [],
        });
    };

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.dateRange?.from) count++;
        if (filters.selectedMonth) count++;
        if (filters.branches.length > 0) count++;
        if (filters.channels.length > 0) count++;
        if (filters.daysOfWeek.length > 0) count++;
        return count;
    }, [filters]);

    // Generate last 12 months
    const months = useMemo(() => {
        const result = [];
        const now = new Date();
        for (let i = 0; i < 12; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const value = format(date, 'yyyy-MM');
            const label = format(date, 'MMMM yyyy', { locale: dateLocale });
            result.push({ value, label });
        }
        return result;
    }, [dateLocale]);

    return (
        <div className="glass-card p-4 rounded-2xl border-white/10 flex flex-wrap items-center gap-4 animate-fade-in relative z-20">
            <div className="flex items-center gap-2 text-primary font-bold mr-2">
                <Filter className="h-4 w-4" />
                <span className="text-sm uppercase tracking-wider">{t('filters')}</span>
                {activeFilterCount > 0 && (
                    <span className="bg-primary text-white text-[10px] h-4 w-4 flex items-center justify-center rounded-full">
                        {activeFilterCount}
                    </span>
                )}
            </div>

            {/* Date Range Picker */}
            <div className="flex-1 min-w-[240px]">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-full justify-start text-left font-normal border-white/10 bg-white/5 hover:bg-white/10",
                                !filters.dateRange && "text-muted-foreground",
                                isRtl && "text-right"
                            )}
                        >
                            <CalendarIcon className={cn("h-4 w-4 opacity-50", isRtl ? "ml-2" : "mr-2")} />
                            {filters.dateRange?.from ? (
                                filters.dateRange.to ? (
                                    <>
                                        {format(filters.dateRange.from, "LLL dd, y", { locale: dateLocale })} -{" "}
                                        {format(filters.dateRange.to, "LLL dd, y", { locale: dateLocale })}
                                    </>
                                ) : (
                                    format(filters.dateRange.from, "LLL dd, y", { locale: dateLocale })
                                )
                            ) : (
                                <span>{t('date_range')}</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 glass-card border-white/20" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={filters.dateRange?.from}
                            selected={filters.dateRange}
                            onSelect={handleDateChange}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Month Selector */}
            <div className="w-full sm:w-48">
                <Select
                    value={filters.selectedMonth || 'all'}
                    onValueChange={handleMonthChange}
                >
                    <SelectTrigger className="border-white/10 bg-white/5 hover:bg-white/10">
                        <SelectValue placeholder={t('month')} />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-white/20">
                        <SelectItem value="all">{t('all_months')}</SelectItem>
                        {months.map(month => (
                            <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Branch Selector */}
            <div className="w-full sm:w-44">
                <Select
                    value={filters.branches[0] || 'all'}
                    onValueChange={handleBranchChange}
                >
                    <SelectTrigger className="border-white/10 bg-white/5 hover:bg-white/10">
                        <SelectValue placeholder={t('branch')} />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-white/20">
                        <SelectItem value="all">{t('all_branches_select')}</SelectItem>
                        {BRANCHES.map(branch => (
                            <SelectItem key={branch} value={branch}>{t(branch as any) || branch}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Channel Selector */}
            <div className="w-full sm:w-44">
                <Select
                    value={filters.channels[0] || 'all'}
                    onValueChange={handleChannelChange}
                >
                    <SelectTrigger className="border-white/10 bg-white/5 hover:bg-white/10">
                        <SelectValue placeholder={t('channel')} />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-white/20">
                        <SelectItem value="all">{t('all_channels_select')}</SelectItem>
                        {CHANNELS.map(channel => (
                            <SelectItem key={channel} value={channel}>{t(channel as any) || channel}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Day of Week Selector */}
            <div className="w-full sm:w-44">
                <Select
                    value={filters.daysOfWeek.length > 0 ? filters.daysOfWeek[0].toString() : 'all'}
                    onValueChange={handleDayChange}
                >
                    <SelectTrigger className="border-white/10 bg-white/5 hover:bg-white/10">
                        <SelectValue placeholder={t('day_of_week')} />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-white/20">
                        <SelectItem value="all">{t('any_day')}</SelectItem>
                        {days.map(day => (
                            <SelectItem key={day.value} value={day.value.toString()}>{day.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Clear Button */}
            {activeFilterCount > 0 && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-muted-foreground hover:text-destructive flex gap-2"
                >
                    <X className="h-4 w-4" /> {t('clear_filters')}
                </Button>
            )}
        </div>
    );
}
