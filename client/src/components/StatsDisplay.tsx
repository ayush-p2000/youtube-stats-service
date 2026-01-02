'use client';

import { useAppSelector } from '@/lib/hooks';
import { Visibility, ThumbUp, Comment, TrendingUp, ChatBubbleOutline, Bolt } from '@mui/icons-material';

export default function StatsDisplay() {
    const { stats, statsLoading } = useAppSelector((state) => state.video);

    if (statsLoading && !stats) return (
        <div className="w-full text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto" />
            <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium tracking-wide">
                Analyzing data...
            </p>
        </div>
    );

    // if (!stats) return null;
    if (!stats) return (
        <div className="w-full text-center py-20">
            <p className="text-gray-500 dark:text-gray-400 font-medium tracking-wide">
                No statistics available for this video.
            </p>
        </div>
    );

    const views = Number(stats.viewCount) || 0;
    const likes = Number(stats.likeCount) || 0;
    const comments = Number(stats.commentCount) || 0;

    // Deep Analytics (with safety checks for division by zero)
    const likabilityRatio = views > 0 ? (likes / views) * 100 : 0;
    const conversationDensity = views > 0 ? (comments / views) * 1000 : 0;
    const viralMomentum = views > 0 ? ((likes * 2 + comments * 5) / views) * 100 : 0;

    return (
        <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Main Stats Card */}
            <div className="relative bg-white dark:bg-[#181818] rounded-2xl shadow-lg overflow-hidden border border-gray-200/50 dark:border-gray-800/50 hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />
                <div className="p-6 sm:p-8 md:p-10">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 leading-tight tracking-tight">
                        {stats.title}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                        <div className="group flex flex-col p-5 sm:p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100/50 dark:border-blue-800/30 hover:border-blue-300 dark:hover:border-blue-700/50 hover:shadow-md transition-all duration-300">
                            <div className="flex items-center gap-2 mb-2">
                                <Visibility className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">Total Views</span>
                            </div>
                            <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{views.toLocaleString()}</span>
                        </div>
                        <div className="group flex flex-col p-5 sm:p-6 bg-red-50/50 dark:bg-red-900/10 rounded-xl border border-red-100/50 dark:border-red-800/30 hover:border-red-300 dark:hover:border-red-700/50 hover:shadow-md transition-all duration-300">
                            <div className="flex items-center gap-2 mb-2">
                                <ThumbUp className="h-4 w-4 text-red-600 dark:text-red-400" />
                                <span className="text-red-600 dark:text-red-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">Total Likes</span>
                            </div>
                            <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{likes.toLocaleString()}</span>
                        </div>
                        <div className="group flex flex-col p-5 sm:p-6 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100/50 dark:border-emerald-800/30 hover:border-emerald-300 dark:hover:border-emerald-700/50 hover:shadow-md transition-all duration-300">
                            <div className="flex items-center gap-2 mb-2">
                                <Comment className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">Comments</span>
                            </div>
                            <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{comments.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Multipliers Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <TrendingUp className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Engagement Multipliers</h3>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:inline">Industry Benchmarks</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {/* Likability Ratio */}
                    <div className="bg-white dark:bg-[#181818] p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-800/50 relative overflow-hidden group hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                            <ThumbUp className="h-16 w-16 text-red-500" />
                        </div>
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-3">
                                <ThumbUp className="h-5 w-5 text-red-600 dark:text-red-400" />
                                <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Likability Ratio</p>
                            </div>
                            <div className="flex items-baseline gap-2 mb-4">
                                <h4 className="text-3xl sm:text-4xl font-bold text-red-600 dark:text-red-400">{likabilityRatio.toFixed(2)}%</h4>
                                <span className="text-xs font-medium text-gray-400">likes/views</span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-normal">
                                {likabilityRatio > 4 ? <>🔥 Exceptional engagement! Fans are actively supporting.</> :
                                    likabilityRatio > 2 ? <>📈 Strong performance compared to average.</> :
                                        <>⚖️ Normal engagement levels for this view count.</>}
                            </p>
                        </div>
                    </div>

                    {/* Conversation Density */}
                    <div className="bg-white dark:bg-[#181818] p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-800/50 relative overflow-hidden group hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                            <ChatBubbleOutline className="h-16 w-16 text-blue-500" />
                        </div>
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-3">
                                <ChatBubbleOutline className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Conversation Density</p>
                            </div>
                            <div className="flex items-baseline gap-2 mb-4">
                                <h4 className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400">{conversationDensity.toFixed(1)}</h4>
                                <span className="text-xs font-medium text-gray-400">per 1k views</span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-normal">
                                {conversationDensity > 10 ? <>💬 Highly conversational. This video sparks deep debate.</> :
                                    conversationDensity > 3 ? <>👥 Good community interaction detected.</> :
                                        <>❄️ Passive viewership. Less interaction than usual.</>}
                            </p>
                        </div>
                    </div>

                    {/* Viral Momentum */}
                    <div className="bg-white dark:bg-[#181818] p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-800/50 relative overflow-hidden group hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Bolt className="h-16 w-16 text-purple-500" />
                        </div>
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-3">
                                <Bolt className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Viral Momentum</p>
                            </div>
                            <div className="flex items-baseline gap-2 mb-4">
                                <h4 className="text-3xl sm:text-4xl font-bold text-purple-600 dark:text-purple-400">{viralMomentum.toFixed(1)}</h4>
                                <span className="text-xs font-medium text-gray-400">AI Score</span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-normal">
                                {viralMomentum > 20 ? <>🚀 Viral alert! The algorithm is likely pushing this hard.</> :
                                    viralMomentum > 10 ? <>⚡ Gaining steady traction across the platform.</> :
                                        <>📊 Steady growth, but not currently hyper-viral.</>}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
