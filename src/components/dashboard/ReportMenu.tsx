import { FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardSummary, SalesRecord } from '@/types/sales';
import { exportToExcel, exportToPDF } from '@/lib/reportExporters';
import { useLanguage } from '../LanguageProvider';
import { useToast } from '@/hooks/use-toast';

interface ReportMenuProps {
    summary: DashboardSummary | null;
    salesData: SalesRecord[];
}

export function ReportMenu({ summary, salesData }: ReportMenuProps) {
    const { t } = useLanguage();
    const { toast } = useToast();

    const handleExcelExport = () => {
        try {
            exportToExcel(summary, salesData);
            toast({
                title: "Download Started",
                description: "Your Excel report is being generated.",
                className: "bg-emerald-50 text-emerald-900 border-emerald-200"
            });
        } catch (error) {
            toast({
                title: "Download Failed",
                description: "Please check console for details.",
                variant: "destructive"
            });
        }
    };

    const handlePDFExport = () => {
        try {
            exportToPDF(summary);
            toast({
                title: "Download Started",
                description: "Your PDF report is being generated.",
                className: "bg-pink-50 text-pink-900 border-pink-200"
            });
        } catch (error) {
            toast({
                title: "Download Failed",
                description: "Please check console for details.",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                disabled={!summary}
                onClick={handleExcelExport}
                className="gap-2 border-emerald-500/20 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-500 hover:text-emerald-700 transition-all font-bold"
                title={t('excel_data')}
            >
                <FileSpreadsheet className="h-4 w-4" />
                <span className="hidden sm:inline">Excel</span>
            </Button>

            <Button
                variant="outline"
                size="sm"
                disabled={!summary}
                onClick={handlePDFExport}
                className="gap-2 border-pink-500/20 text-pink-600 hover:bg-pink-50 hover:border-pink-500 hover:text-pink-700 transition-all font-bold"
                title={t('pdf_visual')}
            >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">PDF</span>
            </Button>
        </div>
    );
}
