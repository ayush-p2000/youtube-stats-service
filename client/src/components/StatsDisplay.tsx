'use client';

import { useAppSelector } from '@/lib/hooks';

export default function StatsDisplay() {
    const { stats, statsLoading } = useAppSelector((state) => state.video);

    if (statsLoading && !stats) return (
        <div className="w-full text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-4 text-gray-500 font-medium tracking-wide">
                <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Analyzing data...
            </p>
        </div>
    );

    if (!stats) return null;

    const views = Number(stats.viewCount) || 0;
    const likes = Number(stats.likeCount) || 0;
    const comments = Number(stats.commentCount) || 0;

    // Deep Analytics (with safety checks for division by zero)
    const likabilityRatio = views > 0 ? (likes / views) * 100 : 0;
    const conversationDensity = views > 0 ? (comments / views) * 1000 : 0;
    const viralMomentum = views > 0 ? ((likes * 2 + comments * 5) / views) * 100 : 0;

    return (
        <div className="w-full max-w-6xl mx-auto p-6 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Main Stats Card */}
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-blue-500 via-purple-500 to-rose-500" />
                <div className="p-8 md:p-12">
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-8 leading-tight tracking-tight">
                        {stats.title}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex flex-col p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-800/30">
                            <span className="text-blue-600 dark:text-blue-400 text-sm font-bold uppercase tracking-widest mb-2">Total Views</span>
                            <span className="text-3xl font-black text-gray-900 dark:text-white">{views.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col p-6 bg-rose-50/50 dark:bg-rose-900/10 rounded-2xl border border-rose-100/50 dark:border-rose-800/30">
                            <span className="text-rose-600 dark:text-rose-400 text-sm font-bold uppercase tracking-widest mb-2">Total Likes</span>
                            <span className="text-3xl font-black text-gray-900 dark:text-white">{likes.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col p-6 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/30">
                            <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold uppercase tracking-widest mb-2">Comments</span>
                            <span className="text-3xl font-black text-gray-900 dark:text-white">{comments.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Multipliers Section */}
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Engagement Multipliers</h3>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Industry Benchmarks</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Likability Ratio */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <svg className="w-12 h-12 text-rose-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                        </div>
                        <p className="text-sm font-bold text-gray-500 uppercase mb-2">Likability Ratio</p>
                        <div className="flex items-baseline gap-2">
                            <h4 className="text-4xl font-black text-rose-600">{likabilityRatio.toFixed(2)}%</h4>
                            <span className="text-xs font-bold text-gray-400">likes/views</span>
                        </div>
                        <p className="mt-4 text-sm text-gray-500 leading-relaxed font-medium">
                            {likabilityRatio > 4 ? <><i className="fa-solid fa-fire text-orange-500 mr-1"></i> Exceptional engagement! Fans are actively supporting.</> :
                                likabilityRatio > 2 ? <><i className="fa-solid fa-chart-line text-green-500 mr-1"></i> Strong performance compared to average.</> :
                                    <><i className="fa-solid fa-scale-balanced text-gray-400 mr-1"></i> Normal engagement levels for this view count.</>}
                        </p>
                    </div>

                    {/* Conversation Density */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <svg className="w-12 h-12 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
                        </div>
                        <p className="text-sm font-bold text-gray-500 uppercase mb-2">Conversation Density</p>
                        <div className="flex items-baseline gap-2">
                            <h4 className="text-4xl font-black text-blue-600">{conversationDensity.toFixed(1)}</h4>
                            <span className="text-xs font-bold text-gray-400">per 1k views</span>
                        </div>
                        <p className="mt-4 text-sm text-gray-500 leading-relaxed font-medium">
                            {conversationDensity > 10 ? <><i className="fa-solid fa-comments text-blue-500 mr-1"></i> Highly conversational. This video sparks deep debate.</> :
                                conversationDensity > 3 ? <><i className="fa-solid fa-user-group text-blue-400 mr-1"></i> Good community interaction detected.</> :
                                    <><i className="fa-solid fa-snowflake text-cyan-200 mr-1"></i> Passive viewership. Less interaction than usual.</>}
                        </p>
                    </div>

                    {/* Viral Momentum */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <svg className="w-12 h-12 text-purple-500" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                        </div>
                        <p className="text-sm font-bold text-gray-500 uppercase mb-2">Viral Momentum</p>
                        <div className="flex items-baseline gap-2">
                            <h4 className="text-4xl font-black text-purple-600">{viralMomentum.toFixed(1)}</h4>
                            <span className="text-xs font-bold text-gray-400">AI Score</span>
                        </div>
                        <p className="mt-4 text-sm text-gray-500 leading-relaxed font-medium">
                            {viralMomentum > 20 ? <><i className="fa-solid fa-rocket text-purple-500 mr-1"></i> Viral alert! The algorithm is likely pushing this hard.</> :
                                viralMomentum > 10 ? <><i className="fa-solid fa-bolt text-yellow-500 mr-1"></i> Gaining steady traction across the platform.</> :
                                    <><i className="fa-solid fa-chart-area text-purple-300 mr-1"></i> Steady growth, but not currently hyper-viral.</>}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
