import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Target, DollarSign, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KPICard } from '@/components/dashboard/KPICard';
import { useSalesData } from '@/hooks/useSalesData';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { ChannelCard } from '@/components/dashboard/ChannelCard';

export default function BranchDetail() {
    const { branchName } = useParams<{ branchName: string }>();
    const navigate = useNavigate();
    const { summary, isLoading } = useSalesData();

    if (!branchName) {
        navigate('/');
        return null;
    }

    const branchData = summary?.branchMetrics.find(b => b.branchName === branchName);

    if (!branchData && !isLoading) {
        navigate('/');
        return null;
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-EG', {
            style: 'currency',
            currency: 'EGP',
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('en-EG').format(value);
    };

    return (
        <div className="min-h-screen dashboard-gradient p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/')}
                        className="rounded-full"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{branchName}</h1>
                        <p className="text-muted-foreground">Detailed performance analytics</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : branchData ? (
                    <>
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <KPICard
                                title="Total Sales"
                                value={formatCurrency(branchData.totalSales)}
                                icon={DollarSign}
                                variant="sales"
                                subtitle="Branch total"
                            />
                            <KPICard
                                title="Total Orders"
                                value={formatNumber(branchData.totalOrders)}
                                icon={ShoppingCart}
                                variant="orders"
                                subtitle="All channels"
                            />
                            <KPICard
                                title="Monthly Target"
                                value={formatCurrency(branchData.totalTarget)}
                                icon={Target}
                                variant="target"
                                subtitle="Current month"
                            />
                            <KPICard
                                title="Achievement"
                                value={`${branchData.achievementPercentage.toFixed(1)}%`}
                                icon={TrendingUp}
                                variant="achievement"
                                trend={{
                                    value: branchData.achievementPercentage - 100,
                                    isPositive: branchData.achievementPercentage >= 100,
                                }}
                                subtitle="vs target"
                            />
                        </div>

                        {/* Channel Breakdown */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold tracking-tight">Channel Performance</h2>
                                <div className="text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full border">
                                    {branchData.channels.length} Channels Active
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {branchData.channels.map((channel) => (
                                    <ChannelCard key={channel.channelName} channel={channel} />
                                ))}
                            </div>
                        </div>

                        {/* Sales Chart */}
                        <div className="kpi-card">
                            <SalesChart summary={summary} branchName={branchName} />
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
}
