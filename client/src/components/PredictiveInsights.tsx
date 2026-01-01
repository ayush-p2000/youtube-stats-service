'use client';

import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { predictMetrics } from '@/lib/features/videoSlice';

export default function PredictiveInsights() {
    const dispatch = useAppDispatch();
    const { videoId, stats, sentiment, prediction, predictionLoading } = useAppSelector((state) => state.video);

    if (!stats) return null;

    const handleRunPrediction = () => {
        if (videoId && stats) {
            dispatch(predictMetrics({ videoId, stats, sentiment: sentiment || undefined }));
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <span className="w-2 h-8 bg-blue-600 rounded-full" />
                    AI Predictive Analytics
                </h3>

                <button
                    onClick={handleRunPrediction}
                    disabled={predictionLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg hover:shadow-blue-500/20 flex items-center gap-2"
                >
                    <i className={`fa-solid ${predictionLoading ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
                    {predictionLoading ? 'Analyzing...' : prediction ? 'Refresh Predictions' : 'Predict Future Growth'}
                </button>
            </div>

            {prediction && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Virality Meter */}
                    <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center">
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
                            <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">7 Day Forecast</span>
                                    <i className="fa-solid fa-chart-line text-blue-500"></i>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-2xl font-black text-gray-900 dark:text-white">+{prediction.forecast.views_7d.toLocaleString()}</p>
                                    <p className="text-xs font-bold text-gray-400 uppercase">Projected Views</p>
                                </div>
                            </div>
                            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">30 Day Forecast</span>
                                    <i className="fa-solid fa-arrow-trend-up text-indigo-500"></i>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-2xl font-black text-gray-900 dark:text-white">+{prediction.forecast.views_30d.toLocaleString()}</p>
                                    <p className="text-xs font-bold text-gray-400 uppercase">Projected Views</p>
                                </div>
                            </div>
                        </div>

                        {/* AI Recommendations */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                                <i className="fa-solid fa-lightbulb text-yellow-500"></i>
                                Strategic AI Recommendations
                            </h4>
                            <div className="space-y-4">
                                {prediction.recommendations.map((rec, index) => (
                                    <div key={index} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-800">
                                        <div className="mt-1 w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                                            {rec}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
