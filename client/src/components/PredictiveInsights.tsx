'use client';

import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { predictMetrics } from '@/lib/features/videoSlice';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { TrendingUp, AutoAwesome, Lightbulb, ShowChart } from '@mui/icons-material';
import {
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from 'recharts';

export default function PredictiveInsights() {
    const dispatch = useAppDispatch();
    const { videoId, stats, sentiment, prediction, predictionLoading, comments } = useAppSelector((state) => state.video);
    const { resolvedTheme } = useTheme();
    const isClient = useSyncExternalStore(
        () => () => { },
        () => true,
        () => false
    );

    if (!isClient || !stats) return null;

    const isDark = resolvedTheme === 'dark';
    const gridColor = isDark ? '#374151' : '#f0f0f0';
    const tickColor = isDark ? '#9ca3af' : '#6b7280';
    const tooltipBg = isDark ? '#1f2937' : '#ffffff';
    const tooltipBorder = isDark ? '#374151' : '#e5e7eb';

    const handleRunPrediction = () => {
        if (videoId && stats) {
            dispatch(predictMetrics({
                videoId,
                stats,
                sentiment: sentiment || undefined,
                comments: comments || undefined
            }));
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <TrendingUp className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        AI Predictive Analytics
                    </h3>
                </div>

                <button
                    onClick={handleRunPrediction}
                    disabled={predictionLoading}
                    className="px-5 sm:px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg disabled:shadow-none flex items-center gap-2"
                >
                    {predictionLoading ? (
                        <>
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Analyzing...</span>
                        </>
                    ) : (
                        <>
                            <AutoAwesome className="h-4 w-4" />
                            <span>{prediction ? 'Refresh Predictions' : 'Predict Future Growth'}</span>
                        </>
                    )}
                </button>
            </div>

            {prediction && (
                <div className="space-y-6 sm:space-y-8">
                    {/* Linear Regression Chart */}
                    <div className="bg-white dark:bg-[#181818] rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200/50 dark:border-gray-800/50 hover:shadow-xl transition-all duration-300">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <ShowChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    <h4 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Growth Trajectory</h4>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-normal mt-1">Estimated historical views and linear regression trend line</p>
                            </div>
                            <div className="flex items-center gap-4 sm:gap-6 text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-600" />
                                    <span className="text-xs font-semibold uppercase tracking-wider">Est. Views</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-indigo-400" />
                                    <span className="text-xs font-semibold uppercase tracking-wider">Regression Line</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-[300px] sm:h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={prediction.chart_data}>
                                    <defs>
                                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={isDark ? 0.3 : 0.1} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: tickColor, fontSize: 12, fontWeight: 500 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: tickColor, fontSize: 12, fontWeight: 500 }}
                                        tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: tooltipBg,
                                            borderRadius: '16px',
                                            border: `1px solid ${tooltipBorder}`,
                                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                            color: isDark ? '#fff' : '#000'
                                        }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="views"
                                        stroke="#2563eb"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorViews)"
                                    />
                                    <Line
                                        type="linear"
                                        dataKey="regression"
                                        stroke="#818cf8"
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        dot={false}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                        {/* Virality Meter */}
                        <div className="lg:col-span-1 bg-white dark:bg-[#181818] rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200/50 dark:border-gray-800/50 hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center text-center">
                            <div className="relative w-40 h-40 mb-6">
                                <svg className="w-full h-full" viewBox="0 0 100 100">
                                    <circle
                                        cx="50" cy="50" r="45"
                                        fill="none" stroke="currentColor" strokeWidth="8"
                                        className="text-gray-100 dark:text-gray-700"
                                    />
                                    <circle
                                        cx="50" cy="50" r="45"
                                        fill="none" stroke="currentColor" strokeWidth="8"
                                        strokeDasharray={`${prediction.virality_score * 2.82} 282`}
                                        strokeLinecap="round"
                                        className="text-blue-600 transform -rotate-90 origin-center transition-all duration-1000"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-black text-gray-900 dark:text-white">{prediction.virality_score}%</span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Virality</span>
                                </div>
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                {prediction.virality_score > 70 ? 'Viral Potential' : prediction.virality_score > 40 ? 'High Momentum' : 'Steady Growth'}
                            </h4>
                            <p className="text-sm text-gray-500 font-medium">
                                Based on real-time engagement and audience sentiment correlation.
                            </p>
                        </div>

                        {/* Projections & Recommendations */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* 7d and 30d views projection icons */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-5 sm:p-6 rounded-xl border border-blue-100 dark:border-blue-800/30 hover:shadow-md transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">7 Day Forecast</span>
                                        <ShowChart className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">+{prediction.forecast.views_7d.toLocaleString()}</p>
                                        <p className="text-xs font-medium text-gray-400 uppercase">Projected Views</p>
                                    </div>
                                </div>
                                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-5 sm:p-6 rounded-xl border border-indigo-100 dark:border-indigo-800/30 hover:shadow-md transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">30 Day Forecast</span>
                                        <TrendingUp className="h-4 w-4 text-indigo-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">+{prediction.forecast.views_30d.toLocaleString()}</p>
                                        <p className="text-xs font-medium text-gray-400 uppercase">Projected Views</p>
                                    </div>
                                </div>
                            </div>

                            {/* AI Recommendations */}
                            <div className="bg-white dark:bg-[#181818] rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200/50 dark:border-gray-800/50 hover:shadow-xl transition-all duration-300">
                                <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-3">
                                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                                    Strategic AI Recommendations
                                </h4>
                                <div className="space-y-3 sm:space-y-4">
                                    {prediction.recommendations.map((rec: string, index: number) => (
                                        <div key={index} className="flex gap-3 sm:gap-4 p-4 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-200/50 dark:border-gray-800/50 hover:border-blue-300 dark:hover:border-blue-700/50 transition-all duration-300">
                                            <div className="mt-1 w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                                            <p className="text-xs sm:text-sm font-normal text-gray-700 dark:text-gray-300 leading-relaxed">
                                                {rec}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
