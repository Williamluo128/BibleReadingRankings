import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface ReadingTrendData {
    date: string;
    versesRead: number;
}

interface ReadingTrendChartProps {
    data: ReadingTrendData[];
}

export const ReadingTrendChart: React.FC<ReadingTrendChartProps> = ({ data }) => {
    // 格式化日期显示
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    };

    // 自定义 Tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white border border-gray-200 px-4 py-2 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">{formatDate(data.date)}</p>
                    <p className="text-sm font-medium text-gray-900">
                        {data.versesRead} 节
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="date"
                        tickFormatter={formatDate}
                        tick={{ fontSize: 12, fill: '#9ca3af' }}
                        stroke="#e5e7eb"
                    />
                    <YAxis
                        tick={{ fontSize: 12, fill: '#9ca3af' }}
                        stroke="#e5e7eb"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                        type="monotone"
                        dataKey="versesRead"
                        stroke="#171717"
                        strokeWidth={2}
                        dot={{ fill: '#171717', r: 3 }}
                        activeDot={{ r: 5 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
