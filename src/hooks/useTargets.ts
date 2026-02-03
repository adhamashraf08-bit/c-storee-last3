import { useState, useCallback } from 'react';
import { BranchTarget, BRANCHES } from '@/types/sales';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useTargets() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const { toast } = useToast();

    // Get current month in YYYY-MM format
    const getCurrentMonth = useCallback(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }, []);

    // Fetch targets for a specific month
    const getTargets = useCallback(async (month?: string): Promise<BranchTarget[]> => {
        try {
            setIsLoading(true);
            setError(null);

            const targetMonth = month || getCurrentMonth();

            const { data, error: fetchError } = await supabase
                .from('branch_targets')
                .select('*')
                .eq('month', targetMonth);

            if (fetchError) throw fetchError;

            return (data || []) as BranchTarget[];
        } catch (err) {
            const error = err as Error;
            setError(error);
            console.error('Error fetching targets:', error);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [getCurrentMonth]);

    // Get current month's targets
    const getCurrentTargets = useCallback(async (): Promise<BranchTarget[]> => {
        return getTargets(getCurrentMonth());
    }, [getTargets, getCurrentMonth]);

    // Update or insert a single target
    const setTarget = useCallback(async (
        branchName: string,
        targetValue: number,
        month?: string
    ): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);

            const targetMonth = month || getCurrentMonth();

            const { error: upsertError } = await supabase
                .from('branch_targets')
                .upsert({
                    branch_name: branchName,
                    target_value: targetValue,
                    month: targetMonth,
                    updated_at: new Date().toISOString(),
                }, {
                    onConflict: 'branch_name,month'
                });

            if (upsertError) throw upsertError;

            return true;
        } catch (err) {
            const error = err as Error;
            setError(error);
            console.error('Error setting target:', error);
            toast({
                title: 'Error',
                description: 'Failed to update target',
                variant: 'destructive',
            });
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [getCurrentMonth, toast]);

    // Update multiple targets at once
    const updateTargets = useCallback(async (
        targets: { branchName: string; targetValue: number }[],
        month?: string
    ): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);

            const targetMonth = month || getCurrentMonth();

            const upsertData = targets.map((t) => ({
                branch_name: t.branchName,
                target_value: t.targetValue,
                month: targetMonth,
                updated_at: new Date().toISOString(),
            }));

            const { error: upsertError } = await supabase
                .from('branch_targets')
                .upsert(upsertData, {
                    onConflict: 'branch_name,month'
                });

            if (upsertError) throw upsertError;

            toast({
                title: 'Success',
                description: 'Targets updated successfully',
            });

            return true;
        } catch (err) {
            const error = err as Error;
            setError(error);
            console.error('Error updating targets:', error);
            toast({
                title: 'Error',
                description: 'Failed to update targets',
                variant: 'destructive',
            });
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [getCurrentMonth, toast]);

    // Initialize default targets for current month (if they don't exist)
    const initializeDefaultTargets = useCallback(async (): Promise<boolean> => {
        try {
            const currentMonth = getCurrentMonth();
            const existing = await getTargets(currentMonth);

            if (existing.length === BRANCHES.length) {
                return true; // Already initialized
            }

            const defaultTargets = BRANCHES.map((branch) => ({
                branchName: branch,
                targetValue: 0,
            }));

            return await updateTargets(defaultTargets, currentMonth);
        } catch (err) {
            console.error('Error initializing targets:', err);
            return false;
        }
    }, [getCurrentMonth, getTargets, updateTargets]);

    return {
        isLoading,
        error,
        getTargets,
        getCurrentTargets,
        setTarget,
        updateTargets,
        initializeDefaultTargets,
        getCurrentMonth,
    };
}
