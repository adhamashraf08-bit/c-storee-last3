import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { DashboardSummary, SalesRecord } from '@/types/sales';

/**
 * Data-First Excel Export
 * Uses pure FileSaver.js saveAs() which is the industry standard for handling
 * browser idiosyncrasies regarding file downloads.
 */
export function exportToExcel(summary: DashboardSummary | null, salesData: SalesRecord[]) {
    if (!summary) return;

    try {
        const wb = XLSX.utils.book_new();
        // Simple filename to avoid any character encoding issues
        const dateStr = new Date().toISOString().split('T')[0];
        const filename = `CStore_Report_${dateStr}.xlsx`;

        // 1. Overall Summary Sheet
        const summaryRows = [
            ['C Store Online Sales Report'],
            [`Generated on: ${dateStr}`],
            [],
            ['OVERALL KPI SUMMARY'],
            ['Metric', 'Value'],
            ['Total Sales', summary.totalSales],
            ['Total Orders', summary.totalOrders],
            ['Total Target', summary.totalTarget],
            ['Achievement %', summary.overallAchievement.toFixed(1) + '%'],
            ['Avg. Order Value (AOV)', summary.overallAov.toFixed(2)],
            [],
            ['BRANCH PERFORMANCE'],
            ['Branch', 'Sales', 'Orders', 'Target', 'Achievement %', 'AOV'],
        ];

        summary.branchMetrics.forEach(b => {
            summaryRows.push([
                b.branchName,
                b.totalSales,
                b.totalOrders,
                b.totalTarget,
                b.achievementPercentage.toFixed(1) + '%',
                b.aov.toFixed(2)
            ]);
        });

        const summaryWs = XLSX.utils.aoa_to_sheet(summaryRows);
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary Overview');

        // 2. RAW RECORDS SHEET
        const rawHeaders = ['Date', 'Branch', 'Channel', 'Sales Value', 'Orders Count', 'Target Value', 'AOV'];
        const rawRows = salesData.map(r => [
            r.date,
            r.branch_name,
            r.channel_name,
            r.sales_value,
            r.orders_count,
            r.target_value,
            r.orders_count > 0 ? (r.sales_value / r.orders_count).toFixed(2) : 0
        ]);

        const rawDataWs = XLSX.utils.aoa_to_sheet([rawHeaders, ...rawRows]);
        XLSX.utils.book_append_sheet(wb, rawDataWs, 'Raw Sales Data');

        // Generate binary
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

        // Create Blob with strictly correct MIME type
        const blob = new Blob([excelBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
        });

        // Trigger Save
        saveAs(blob, filename);
        console.log(`Excel Download Triggered for: ${filename}`);

        return true;
    } catch (error) {
        console.error('Excel Export Failed:', error);
        throw error;
    }
}

/**
 * Visual-First PDF Export
 * Uses pure FileSaver.js saveAs()
 */
export function exportToPDF(summary: DashboardSummary | null) {
    if (!summary) return;

    try {
        const doc = new jsPDF();
        const dateStr = new Date().toISOString().split('T')[0];
        const filename = `CStore_Report_${dateStr}.pdf`;

        // Styled Header
        doc.setFillColor(30, 30, 30);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('C STORE SALES REPORT', 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Performance Intelligence - ${dateStr}`, 105, 30, { align: 'center' });

        // KPIs Table
        doc.setTextColor(0);
        doc.setFontSize(14);
        doc.text('Key Performance Indicators', 14, 55);

        autoTable(doc, {
            startY: 60,
            head: [['Metric', 'Value']],
            body: [
                ['Total Sales', `EGP ${summary.totalSales.toLocaleString()}`],
                ['Total Orders', summary.totalOrders.toLocaleString()],
                ['Total Target', `EGP ${summary.totalTarget.toLocaleString()}`],
                ['Overall Achievement', `${summary.overallAchievement.toFixed(1)}%`],
                ['Avg. Order Value (AOV)', `EGP ${summary.overallAov.toFixed(2)}`],
            ],
            headStyles: { fillColor: [227, 23, 130] },
            theme: 'striped'
        });

        // Branch Table
        const nextY = (doc as any).lastAutoTable.finalY + 15;
        doc.text('Branch Performance', 14, nextY);

        const branchData = summary.branchMetrics.map(b => [
            b.branchName,
            `EGP ${b.totalSales.toLocaleString()}`,
            b.totalOrders.toLocaleString(),
            `${b.achievementPercentage.toFixed(1)}%`,
            `EGP ${b.aov.toFixed(2)}`
        ]);

        autoTable(doc, {
            startY: nextY + 5,
            head: [['Branch', 'Sales', 'Orders', 'Achievement', 'AOV']],
            body: branchData,
            headStyles: { fillColor: [168, 85, 247] },
            theme: 'grid'
        });

        // Page Footer
        const pages = doc.getNumberOfPages();
        for (let i = 1; i <= pages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Page ${i} of ${pages} | C Store Online Sales Intelligence`, 105, 285, { align: 'center' });
        }

        // Generate Blob
        const pdfBlob = doc.output('blob');

        // Trigger Save
        saveAs(pdfBlob, filename);
        console.log(`PDF Download Triggered for: ${filename}`);

        return true;
    } catch (error) {
        console.error('PDF Export Failed:', error);
        throw error;
    }
}
