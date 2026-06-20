import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface TestamentPieChartProps {
    oldTestament: number;
    newTestament: number;
}

export const TestamentPieChart: React.FC<TestamentPieChartProps> = ({
    oldTestament,
    newTestament,
}) => {
    const data = [
        { name: '旧约', value: oldTestament },
        { name: '新约', value: newTestament },
    ];

    const COLORS = ['#404040', '#a3a3a3'];

    // 自定义 Tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            const total = oldTestament + newTestament;
            const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;

            return (
                <div className="bg-white border border-gray-200 px-4 py-2 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">{data.name}</p>
                    <p className="text-sm font-medium text-gray-900">
                        {data.value} 节 ({percentage}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    // 自定义图例
    const renderLegend = (props: any) => {
        const { payload } = props;
        const total = oldTestament + newTestament;

        return (
            <div className="flex justify-center gap-6 mt-4">
                {payload.map((entry: any, index: number) => {
                    const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
                    return (
                        <div key={index} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-xs text-gray-600">
                                {entry.value} ({percentage}%) {entry.payload.name}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    if (oldTestament === 0 && newTestament === 0) {
        return (
            <div className="w-full h-64 flex items-center justify-center">
                <p className="text-gray-400 font-light">暂无阅读数据</p>
            </div>
        );
    }

    return (
        <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                    >
                        {data.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend content={renderLegend} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
