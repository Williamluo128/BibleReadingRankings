import React from 'react';

interface HeatmapData {
    date: string;
    count: number;
    level: number;
}

interface ReadingHeatmapProps {
    data: HeatmapData[];
    year: number;
}

export const ReadingHeatmap: React.FC<ReadingHeatmapProps> = ({ data, year }) => {
    // 获取颜色等级
    const getColor = (level: number): string => {
        const colors = {
            0: '#f5f5f5',  // 无阅读
            1: '#d4d4d4',  // 1-9 节
            2: '#a3a3a3',  // 10-24 节
            3: '#737373',  // 25-49 节
            4: '#404040',  // 50+ 节
        };
        return colors[level as keyof typeof colors] || colors[0];
    };

    // 生成一年的所有日期
    const generateYearDates = () => {
        const dates: Date[] = [];
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d));
        }

        return dates;
    };

    // 创建日期到数据的映射
    const dataMap = new Map(data.map(d => [d.date, d]));

    // 按周分组日期
    const weeks: Date[][] = [];
    const allDates = generateYearDates();

    let currentWeek: Date[] = [];
    allDates.forEach((date, index) => {
        currentWeek.push(date);
        if (date.getDay() === 6 || index === allDates.length - 1) {
            weeks.push([...currentWeek]);
            currentWeek = [];
        }
    });

    // 填充第一周的空白
    while (weeks[0] && weeks[0][0].getDay() !== 0) {
        weeks[0].unshift(new Date(0)); // 使用无效日期作为占位符
    }

    return (
        <div className="w-full overflow-x-auto">
            <div className="inline-block min-w-full">
                <div className="flex gap-1">
                    {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-1">
                            {[0, 1, 2, 3, 4, 5, 6].map(dayIndex => {
                                const date = week.find(d => d.getDay() === dayIndex);
                                if (!date || date.getTime() === 0) {
                                    return <div key={dayIndex} className="w-3 h-3" />;
                                }

                                const dateStr = date.toISOString().split('T')[0];
                                const dayData = dataMap.get(dateStr);
                                const level = dayData?.level || 0;
                                const count = dayData?.count || 0;

                                return (
                                    <div
                                        key={dayIndex}
                                        className="w-3 h-3 cursor-pointer hover:ring-1 hover:ring-gray-400 transition-all"
                                        style={{ backgroundColor: getColor(level) }}
                                        title={`${dateStr}: ${count} 节`}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* 图例 */}
                <div className="flex items-center justify-end gap-2 mt-4">
                    <span className="text-xs text-gray-400">少</span>
                    {[0, 1, 2, 3, 4].map(level => (
                        <div
                            key={level}
                            className="w-3 h-3"
                            style={{ backgroundColor: getColor(level) }}
                        />
                    ))}
                    <span className="text-xs text-gray-400">多</span>
                </div>
            </div>
        </div>
    );
};
