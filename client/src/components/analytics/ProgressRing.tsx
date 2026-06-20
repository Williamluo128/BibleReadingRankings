import React from 'react';

interface ProgressRingProps {
    progress: number; // 0-100
    size?: number;
    strokeWidth?: number;
    label?: string;
    value?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
    progress,
    size = 120,
    strokeWidth = 8,
    label,
    value,
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                    {/* 背景圆环 */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#f5f5f5"
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                    {/* 进度圆环 */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#171717"
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-500 ease-out"
                    />
                </svg>

                {/* 中心文字 */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-2xl font-light text-gray-900">
                        {progress.toFixed(1)}%
                    </div>
                    {value && (
                        <div className="text-xs text-gray-400 mt-1">{value}</div>
                    )}
                </div>
            </div>

            {label && (
                <div className="text-xs uppercase tracking-widest text-gray-400 mt-4">
                    {label}
                </div>
            )}
        </div>
    );
};
