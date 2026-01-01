'use client';

import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { analyzeSentiment } from '@/lib/features/videoSlice';

export default function SentimentAnalysis() {
    const dispatch = useAppDispatch();
    const { videoId, stats, sentiment, sentimentLoading } = useAppSelector((state) => state.video);

    // Show if we have a video and stats, even if comments aren't locally loaded
    if (!stats) return null;

    const handleRunAnalysis = () => {
        if (videoId) {
            dispatch(analyzeSentiment(videoId));
        }
    };

    // Calculate rotation for the meter needle
    // average_polarity is between -1 and 1
    // We want to map -1 to -90deg (Negative) and 1 to +90deg (Positive)
    const needleRotation = sentiment ? (sentiment.average_polarity * 90) : 0;

    const getSentimentLabel = (polarity: number) => {
        if (polarity > 0.2) return { text: 'Very Positive', color: 'text-green-600' };
        if (polarity > 0.05) return { text: 'Positive', color: 'text-green-500' };
        if (polarity < -0.2) return { text: 'Very Negative', color: 'text-red-600' };
        if (polarity < -0.05) return { text: 'Negative', color: 'text-red-500' };
        return { text: 'Neutral', color: 'text-gray-500' };
    };

    const label = sentiment ? getSentimentLabel(sentiment.average_polarity) : null;

    // Emotion icons and colors
    const emotionConfig = {
        joy: { icon: 'fa-face-laugh-beam', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/10', border: 'border-yellow-200 dark:border-yellow-800/30' },
        anger: { icon: 'fa-face-angry', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/10', border: 'border-red-200 dark:border-red-800/30' },
        sadness: { icon: 'fa-face-sad-tear', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10', border: 'border-blue-200 dark:border-blue-800/30' },
        surprise: { icon: 'fa-face-surprise', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/10', border: 'border-purple-200 dark:border-purple-800/30' },
        fear: { icon: 'fa-face-flushed', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/10', border: 'border-indigo-200 dark:border-indigo-800/30' },
        excitement: { icon: 'fa-face-grin-stars', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/10', border: 'border-orange-200 dark:border-orange-800/30' },
    };

    // Calculate max emotion for bar scaling
    const maxEmotion = sentiment ? Math.max(...Object.values(sentiment.emotions), 1) : 1;

    return (
        <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <span className="w-2 h-8 bg-purple-600 rounded-full" />
                    Audience Sentiment Analysis
                </h3>

                <button
                    onClick={handleRunAnalysis}
                    disabled={sentimentLoading}
                    className="px-6 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all disabled:opacity-50 shadow-lg hover:shadow-purple-500/20 flex items-center gap-2"
                >
                    <i className={`fa-solid ${sentimentLoading ? 'fa-spinner fa-spin' : 'fa-brain'}`}></i>
                    {sentimentLoading ? 'Processing...' : sentiment ? 'Recalculate' : 'Analyze audience mood'}
                </button>
            </div>

            {sentiment && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-700">
                    {/* Main Sentiment Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 dark:border-gray-700">
                        <div className="flex flex-col md:flex-row items-center gap-12">

                            {/* Gauge Meter */}
                            <div className="relative w-64 h-32 md:w-80 md:h-40 shrink-0">
                                {/* Semi-circle background */}
                                <div className="absolute inset-0 bg-linear-to-r from-red-500 via-gray-300 to-green-500 rounded-t-full opacity-20" />
                                <div className="absolute inset-2 bg-white dark:bg-gray-800 rounded-t-full" />

                                {/* Color Segments */}
                                <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 50">
                                    <path d="M 10,50 A 40,40 0 0 1 90,50" fill="none" stroke="#ef4444" strokeWidth="8" strokeDasharray="40 125.6" />
                                    <path d="M 10,50 A 40,40 0 0 1 90,50" fill="none" stroke="#9ca3af" strokeWidth="8" strokeDasharray="45 125.6" strokeDashoffset="-40" />
                                    <path d="M 10,50 A 40,40 0 0 1 90,50" fill="none" stroke="#22c55e" strokeWidth="8" strokeDasharray="40 125.6" strokeDashoffset="-85" />

                                    {/* Needle */}
                                    <g transform={`rotate(${needleRotation}, 50, 50)`}>
                                        <line x1="50" y1="50" x2="50" y2="10" stroke="currentColor" strokeWidth="2" className="text-gray-900 dark:text-white" />
                                        <circle cx="50" cy="50" r="3" fill="currentColor" className="text-gray-900 dark:text-white" />
                                    </g>
                                </svg>

                                <div className="absolute bottom-0 left-0 w-full flex justify-between px-2 text-[10px] font-bold text-gray-400">
                                    <span>CRITICAL</span>
                                    <span>NEUTRAL</span>
                                    <span>PRIME</span>
                                </div>
                            </div>

                            {/* Analysis Content */}
                            <div className="flex-1 space-y-6 text-center md:text-left">
                                <div>
                                    <h4 className={`text-4xl md:text-5xl font-black mb-2 transition-colors duration-500 ${label?.color}`}>
                                        {label?.text}
                                    </h4>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                                        Based on the analysis of {sentiment.total} audience interactions.
                                    </p>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-800/30">
                                        <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-tighter mb-1">Joy</p>
                                        <p className="text-2xl font-black text-gray-900 dark:text-white">{((sentiment.positive / sentiment.total) * 100).toFixed(0)}%</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-900/10 rounded-2xl border border-gray-100 dark:border-gray-800/30">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-tighter mb-1">Neutral</p>
                                        <p className="text-2xl font-black text-gray-900 dark:text-white">{((sentiment.neutral / sentiment.total) * 100).toFixed(0)}%</p>
                                    </div>
                                    <div className="p-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-800/30">
                                        <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-tighter mb-1">Critical</p>
                                        <p className="text-2xl font-black text-gray-900 dark:text-white">{((sentiment.negative / sentiment.total) * 100).toFixed(0)}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Emotion Breakdown Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                            <i className="fa-solid fa-masks-theater text-purple-500"></i>
                            Emotion Breakdown
                        </h4>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {(Object.keys(emotionConfig) as Array<keyof typeof emotionConfig>).map((emotion) => {
                                const config = emotionConfig[emotion];
                                const count = sentiment.emotions[emotion];
                                const percentage = ((count / sentiment.total) * 100).toFixed(1);
                                const barWidth = (count / maxEmotion) * 100;

                                return (
                                    <div key={emotion} className={`p-4 rounded-2xl ${config.bg} border ${config.border} relative overflow-hidden`}>
                                        {/* Background bar */}
                                        <div
                                            className={`absolute bottom-0 left-0 h-1 ${config.color.replace('text-', 'bg-')} opacity-50 transition-all duration-700`}
                                            style={{ width: `${barWidth}%` }}
                                        />

                                        <div className="flex items-center gap-2 mb-2">
                                            <i className={`fa-solid ${config.icon} ${config.color} text-lg`}></i>
                                            <span className="text-xs font-bold text-gray-500 uppercase">{emotion}</span>
                                        </div>
                                        <p className="text-xl font-black text-gray-900 dark:text-white">{count}</p>
                                        <p className="text-xs text-gray-400">{percentage}%</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Spam & Sarcasm Detection Card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Spam Detection */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                                <i className="fa-solid fa-robot text-amber-500"></i>
                                Spam & Bot Detection
                            </h4>

                            <div className="flex items-center gap-4 mb-4">
                                <div className={`text-4xl font-black ${sentiment.spam_count > sentiment.total * 0.1 ? 'text-red-500' : sentiment.spam_count > 0 ? 'text-amber-500' : 'text-green-500'}`}>
                                    {sentiment.spam_count}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Suspicious comments detected
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {((sentiment.spam_count / sentiment.total) * 100).toFixed(1)}% of total
                                    </p>
                                </div>
                            </div>

                            {sentiment.spam_count > 0 && sentiment.spam_comments.length > 0 && (
                                <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-3 border border-amber-200 dark:border-amber-800/30">
                                    <p className="text-xs font-bold text-amber-600 mb-2">Sample flagged:</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate italic">
                                        &quot;{sentiment.spam_comments[0]}&quot;
                                    </p>
                                </div>
                            )}

                            {sentiment.spam_count === 0 && (
                                <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-3 border border-green-200 dark:border-green-800/30">
                                    <p className="text-sm text-green-600 font-medium flex items-center gap-2">
                                        <i className="fa-solid fa-shield-check"></i>
                                        No spam detected - Clean comment section!
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Sarcasm Detection */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                                <i className="fa-solid fa-face-rolling-eyes text-indigo-500"></i>
                                Sarcasm Indicator
                            </h4>

                            <div className="flex items-center gap-4 mb-4">
                                <div className={`text-4xl font-black ${sentiment.sarcasm_detected > sentiment.total * 0.15 ? 'text-indigo-500' : 'text-gray-400'}`}>
                                    {sentiment.sarcasm_detected}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Potentially sarcastic comments
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {((sentiment.sarcasm_detected / sentiment.total) * 100).toFixed(1)}% of total
                                    </p>
                                </div>
                            </div>

                            <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-xl p-3 border border-indigo-200 dark:border-indigo-800/30">
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    <i className="fa-solid fa-info-circle text-indigo-500 mr-1"></i>
                                    Sarcasm is detected by analyzing mixed positive/negative signals and linguistic patterns.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
