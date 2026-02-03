import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { useLanguage } from '../LanguageProvider';

interface TrendLineChartProps {
    data: any[];
    title: string;
}

export function TrendLineChart({ data, title }: TrendLineChartProps) {
    const { t } = useLanguage();

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold tracking-tight">{title}</h3>
            <div className="h-80 glass-card p-4 rounded-2xl border-white/10 overflow-hidden relative group">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(23, 23, 23, 0.8)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                backdropFilter: 'blur(10px)'
                            }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="current"
                            name={t('current_period')}
                            stroke="#8b5cf6"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2 }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="previous"
                            name={t('previous_period')}
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
