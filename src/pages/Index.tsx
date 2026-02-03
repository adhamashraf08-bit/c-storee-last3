import { useState } from 'react';
import { useSalesData } from '@/hooks/useSalesData';
import { useAuth } from '@/hooks/useAuth';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { BranchCard } from '@/components/dashboard/BranchCard';
import { ExcelUpload } from '@/components/dashboard/ExcelUpload';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { ComparisonDashboard } from '@/components/dashboard/ComparisonDashboard';
import { ChatAssistant } from '@/components/chat/ChatAssistant';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, LayoutDashboard, BarChart3, FileText } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { MonthlyReports } from '@/components/dashboard/MonthlyReports';

const Index = () => {
  const {
    salesData,
    rawSalesData,
    summary,
    isLoading,
    filters,
    setFilters,
    refetch,
    uploadData
  } = useSalesData();

  const { isAdmin: userIsAdmin } = useAuth();
  const [expandedBranch, setExpandedBranch] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const { t, isRtl } = useLanguage();

  const toggleBranch = (branchName: string) => {
    setExpandedBranch((prev) => (prev === branchName ? null : branchName));
  };

  const handleMonthSelect = (month: string) => {
    setFilters({ ...filters, selectedMonth: month });
    setActiveTab('overview');
  };

  if (isLoading && !summary) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-accent mx-auto" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container max-w-7xl py-6 px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header with KPI Summary */}
        <DashboardHeader
          summary={summary}
          salesData={salesData}
          isLoading={isLoading}
          onRefresh={refetch}
          isAdmin={userIsAdmin}
        />

        {/* Global Filters Bar */}
        <DashboardFilters
          filters={filters}
          onFilterChange={setFilters}
        />

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50 p-1 rounded-2xl glass-card border-white/5 h-12">
            <TabsTrigger value="overview" className="rounded-xl flex gap-2 h-10 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <LayoutDashboard className="h-4 w-4" /> {t('overview')}
            </TabsTrigger>
            <TabsTrigger value="reports" className="rounded-xl flex gap-2 h-10 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="h-4 w-4" /> {t('monthly_reports')}
            </TabsTrigger>
            <TabsTrigger value="comparisons" className="rounded-xl flex gap-2 h-10 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="h-4 w-4" /> {t('comparisons')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8 animate-fade-in">
            {/* Charts Section */}
            <SalesChart summary={summary} />

            {/* Branch Cards & Upload Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Branch Performance Section */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-lg font-semibold">{t('branch_performance')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {summary?.branchMetrics.map((branch) => (
                    <BranchCard
                      key={branch.branchName}
                      metrics={branch}
                      isExpanded={expandedBranch === branch.branchName}
                      onToggle={() => toggleBranch(branch.branchName)}
                    />
                  ))}
                </div>
              </div>

              {/* Data Management Section */}
              {userIsAdmin ? (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">{t('data_management')}</h2>
                  <ExcelUpload onUpload={uploadData} />
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">{t('viewer_desc')}</h2>
                  <div className="rounded-lg border border-border bg-card p-6 text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-2">
                      <span className="text-2xl">👁️</span>
                    </div>
                    <h3 className="font-semibold">{t('viewer_access')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('viewer_desc')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="animate-fade-in">
            <MonthlyReports salesData={rawSalesData} onMonthSelect={handleMonthSelect} />
          </TabsContent>

          <TabsContent value="comparisons" className="animate-fade-in">
            {/* Comparisons use raw data to independent calculations (like today vs yesterday) */}
            <ComparisonDashboard salesData={rawSalesData} />
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Chat Assistant */}
      <ChatAssistant summary={summary} salesData={salesData} />
    </div>
  );
};

export default Index;
