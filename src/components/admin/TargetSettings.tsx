import { useState, useEffect } from 'react';
import { Target, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BRANCHES } from '@/types/sales';
import { useTargets } from '@/hooks/useTargets';

export function TargetSettings() {
    const { getCurrentTargets, updateTargets, getCurrentMonth, isLoading } = useTargets();
    const [targets, setTargets] = useState<Record<string, number>>({});
    const [currentMonth, setCurrentMonth] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Load current targets
    useEffect(() => {
        const loadTargets = async () => {
            const month = getCurrentMonth();
            setCurrentMonth(month);

            const fetchedTargets = await getCurrentTargets();
            const targetsMap: Record<string, number> = {};

            fetchedTargets.forEach((target) => {
                targetsMap[target.branch_name] = target.target_value;
            });

            // Initialize with 0 for branches without targets
            BRANCHES.forEach((branch) => {
                if (!(branch in targetsMap)) {
                    targetsMap[branch] = 0;
                }
            });

            setTargets(targetsMap);
        };

        loadTargets();
    }, [getCurrentTargets, getCurrentMonth]);

    const handleTargetChange = (branch: string, value: string) => {
        const numValue = parseFloat(value) || 0;
        setTargets((prev) => ({
            ...prev,
            [branch]: numValue,
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);

        const targetArray = BRANCHES.map((branch) => ({
            branchName: branch,
            targetValue: targets[branch] || 0,
        }));

        await updateTargets(targetArray);
        setIsSaving(false);
    };

    const formatMonth = (monthStr: string) => {
        const [year, month] = monthStr.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-EG', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className="kpi-card animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-accent/10 text-accent">
                    <Target className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="font-semibold">Target Settings</h3>
                    <p className="text-sm text-muted-foreground">
                        Set monthly sales targets for each branch
                    </p>
                </div>
            </div>

            {currentMonth && (
                <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm font-medium text-primary">
                        Setting targets for: <span className="font-bold">{formatMonth(currentMonth)}</span>
                    </p>
                </div>
            )}

            <div className="space-y-4">
                {BRANCHES.map((branch) => (
                    <div key={branch} className="space-y-2">
                        <Label htmlFor={`target-${branch}`} className="text-sm font-medium">
                            {branch}
                        </Label>
                        <div className="flex items-center gap-3">
                            <Input
                                id={`target-${branch}`}
                                type="number"
                                min="0"
                                step="1000"
                                value={targets[branch] || 0}
                                onChange={(e) => handleTargetChange(branch, e.target.value)}
                                className="flex-1"
                                placeholder="Enter target amount"
                                disabled={isLoading || isSaving}
                            />
                            <span className="text-sm text-muted-foreground min-w-[100px]">
                                {formatCurrency(targets[branch] || 0)} EGP
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                    Total Target: <span className="font-semibold text-foreground">{formatCurrency(Object.values(targets).reduce((a, b) => a + b, 0))} EGP</span>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isLoading || isSaving}
                    className="gap-2"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            Save Targets
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
