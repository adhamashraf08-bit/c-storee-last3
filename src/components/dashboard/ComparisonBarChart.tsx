import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    Legend,
} from 'recharts';
import { useLanguage } from '../LanguageProvider';

interface ComparisonBarChartProps {
    data: any[];
    title: string;
}

const COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b'];

export function ComparisonBarChart({ data, title }: ComparisonBarChartProps) {
    const { t, isRtl } = useLanguage();

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold tracking-tight">{title}</h3>
            <div className="h-80 glass-card p-4 rounded-2xl border-white/10 overflow-hidden relative group">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                            orientation={isRtl ? 'top' : 'bottom'}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                            orientation={isRtl ? 'right' : 'left'}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{
                                backgroundColor: 'rgba(23, 23, 23, 0.8)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                backdropFilter: 'blur(10px)'
                            }}
                        />
                        <Legend />
                        <Bar dataKey="Sales" name={t('sales')} radius={[6, 6, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
