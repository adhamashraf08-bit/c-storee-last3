import { CHANNELS } from "@/types/sales";
import { useLanguage } from "../LanguageProvider";

interface PerformanceHeatmapProps {
    data: any[];
}

export function PerformanceHeatmap({ data }: PerformanceHeatmapProps) {
    const { t, isRtl } = useLanguage();
    const maxSales = Math.max(...data.flatMap(row =>
        CHANNELS.map(ch => row[ch] || 0)
    ));

    const getIntensity = (value: number) => {
        if (!value || maxSales === 0) return 0.05;
        return Math.max(0.1, value / maxSales);
    };

    return (
        <div className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
            <h3 className="text-xl font-bold tracking-tight">{t('heatmap_title')}</h3>
            <div className="glass-card p-6 rounded-2xl border-white/10 overflow-x-auto">
                <table className="w-full min-w-[600px]">
                    <thead>
                        <tr>
                            <th className={cn("p-2 text-sm font-medium text-muted-foreground", isRtl ? "text-right" : "text-left")}>
                                {t('branch')}
                            </th>
                            {CHANNELS.map(channel => (
                                <th key={channel} className="p-2 text-sm font-medium text-muted-foreground text-center">
                                    {channel}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row) => (
                            <tr key={row.branch} className="border-t border-white/5">
                                <td className={cn("p-3 text-sm font-bold text-foreground whitespace-nowrap", isRtl ? "text-right" : "text-left")}>
                                    {row.branch}
                                </td>
                                {CHANNELS.map(channel => {
                                    const val = row[channel] || 0;
                                    const intensity = getIntensity(val);
                                    return (
                                        <td key={channel} className="p-1">
                                            <div
                                                className="h-12 w-full rounded-lg flex items-center justify-center transition-all hover:scale-105 group relative cursor-default"
                                                style={{
                                                    backgroundColor: `rgba(139, 92, 246, ${intensity})`,
                                                    border: `1px solid rgba(139, 92, 246, ${intensity * 0.5})`
                                                }}
                                            >
                                                <span className={`text-[10px] font-bold ${intensity > 0.6 ? 'text-white' : 'text-foreground'}`}>
                                                    {val >= 1000 ? `${(val / 1000).toFixed(1)}K` : val}
                                                </span>

                                                {/* Tooltip */}
                                                <div className="absolute bottom-full mb-2 hidden group-hover:block z-50">
                                                    <div className="bg-popover text-popover-foreground text-xs p-2 rounded shadow-lg border border-border whitespace-nowrap">
                                                        {row.branch} - {channel}: EGP {val.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

import { cn } from "@/lib/utils";
