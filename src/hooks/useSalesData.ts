import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SalesRecord, DashboardSummary, BranchMetrics, ChannelMetrics, BRANCHES, CHANNELS } from '@/types/sales';
import { useToast } from '@/hooks/use-toast';
import { useTargets } from '@/hooks/useTargets';
import { DateRange } from 'react-day-picker';
import { isWithinInterval, parseISO, getDay } from 'date-fns';

export interface DashboardFilterState {
  dateRange: DateRange | undefined;
  selectedMonth: string | undefined;
  branches: string[];
  channels: string[];
  daysOfWeek: number[];
}

export function useSalesData() {
  const [salesData, setSalesData] = useState<SalesRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { getCurrentTargets, getTargets } = useTargets();

  // Filter State
  const [filters, setFilters] = useState<DashboardFilterState>({
    dateRange: undefined,
    selectedMonth: undefined,
    branches: [],
    channels: [],
    daysOfWeek: [],
  });

  const calculateMetrics = useCallback((data: SalesRecord[], targetsMap: Record<string, number> = {}): DashboardSummary => {
    const branchMetrics: BranchMetrics[] = BRANCHES.map(branch => {
      const branchData = data.filter(d => d.branch_name === branch);

      const channels: ChannelMetrics[] = CHANNELS.map(channel => {
        const channelData = branchData.filter(d => d.channel_name === channel);
        const sales = channelData.reduce((sum, d) => sum + Number(d.sales_value), 0);
        const orders = channelData.reduce((sum, d) => sum + Number(d.orders_count), 0);
        const target = channelData.reduce((sum, d) => sum + Number(d.target_value), 0);

        return {
          channelName: channel,
          sales,
          orders,
          target,
          achievementPercentage: target > 0 ? (sales / target) * 100 : 0,
          aov: orders > 0 ? sales / orders : 0,
        };
      });

      const totalSales = channels.reduce((sum, c) => sum + c.sales, 0);
      const totalOrders = channels.reduce((sum, c) => sum + c.orders, 0);
      const totalTarget = targetsMap[branch] ?? channels.reduce((sum, c) => sum + c.target, 0);

      return {
        branchName: branch,
        totalSales,
        totalOrders,
        totalTarget,
        achievementPercentage: totalTarget > 0 ? (totalSales / totalTarget) * 100 : 0,
        aov: totalOrders > 0 ? totalSales / totalOrders : 0,
        channels,
      };
    });

    const totalSales = branchMetrics.reduce((sum, b) => sum + b.totalSales, 0);
    const totalOrders = branchMetrics.reduce((sum, b) => sum + b.totalOrders, 0);
    const totalTarget = branchMetrics.reduce((sum, b) => sum + b.totalTarget, 0);

    return {
      totalSales,
      totalOrders,
      totalTarget,
      overallAchievement: totalTarget > 0 ? (totalSales / totalTarget) * 100 : 0,
      overallAov: totalOrders > 0 ? totalSales / totalOrders : 0,
      branchMetrics,
    };
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('sales_data')
        .select('*')
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;

      const records = (data || []) as SalesRecord[];
      setSalesData(records);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Derived Filtered Data
  const filteredData = useMemo(() => {
    return salesData.filter((record) => {
      if (!record || !record.date) return false;

      // Date Range Filter
      if (filters.dateRange?.from) {
        const recordDate = parseISO(record.date);
        const start = filters.dateRange.from;
        const end = filters.dateRange.to || filters.dateRange.from;
        if (!isWithinInterval(recordDate, { start, end })) {
          return false;
        }
      }

      // Selected Month Filter (Format: YYYY-MM)
      if (filters.selectedMonth) {
        if (!record.date.startsWith(filters.selectedMonth)) {
          return false;
        }
      }

      // Branch Filter
      if (filters.branches.length > 0 && !filters.branches.includes(record.branch_name)) {
        return false;
      }

      // Channel Filter
      if (filters.channels.length > 0 && !filters.channels.includes(record.channel_name)) {
        return false;
      }

      // Day of Week Filter
      if (filters.daysOfWeek.length > 0) {
        const recordDate = parseISO(record.date);
        const day = getDay(recordDate);
        if (!filters.daysOfWeek.includes(day)) {
          return false;
        }
      }

      return true;
    });
  }, [salesData, filters]);

  // Derived Summary
  const [targetsMap, setTargetsMap] = useState<Record<string, number>>({});

  useEffect(() => {
    getTargets(filters.selectedMonth).then(targets => {
      const map: Record<string, number> = {};
      targets.forEach(t => {
        map[t.branch_name] = t.target_value;
      });
      setTargetsMap(map);
    });
  }, [getTargets, filters.selectedMonth]);

  const summary = useMemo(() => {
    if (salesData.length === 0) return null;
    return calculateMetrics(filteredData, targetsMap);
  }, [filteredData, targetsMap, calculateMetrics, salesData.length]);

  const uploadData = useCallback(async (records: Omit<SalesRecord, 'id' | 'created_at' | 'updated_at'>[]) => {
    try {
      console.log(`Starting upload of ${records.length} records...`);

      // Diagnostics: Check authentication status
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current Auth Session:', {
        isAuthenticated: !!session,
        email: session?.user?.email,
        role: session?.user?.role,
      });

      if (!session) {
        throw new Error('You must be logged in to upload data');
      }

      const { error: deleteError } = await supabase
        .from('sales_data')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw deleteError;
      }

      // Chunk the insert to avoid payload size limits
      const CHUNK_SIZE = 500;
      for (let i = 0; i < records.length; i += CHUNK_SIZE) {
        const chunk = records.slice(i, i + CHUNK_SIZE);
        console.log(`Uploading chunk ${Math.floor(i / CHUNK_SIZE) + 1} (${chunk.length} records)...`);

        const { error: insertError } = await supabase
          .from('sales_data')
          .insert(chunk);

        if (insertError) {
          console.error(`Insert error at chunk ${i}:`, insertError);
          throw insertError;
        }
      }

      console.log('Upload complete, refetching data...');
      await fetchData();

      toast({
        title: 'Success',
        description: `Uploaded ${records.length} records successfully`,
      });

      return true;
    } catch (err: any) {
      console.error('Upload process failed:', err);
      const message = err?.message || err?.details || (typeof err === 'string' ? err : 'Failed to upload data');
      toast({
        title: 'Upload Error',
        description: message,
        variant: 'destructive',
      });
      return false;
    }
  }, [fetchData, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    salesData: filteredData, // Return filtered data by default
    rawSalesData: salesData, // Provide raw data if needed (for comparisons)
    summary,
    isLoading,
    error,
    filters,
    setFilters,
    refetch: fetchData,
    uploadData,
  };
}
